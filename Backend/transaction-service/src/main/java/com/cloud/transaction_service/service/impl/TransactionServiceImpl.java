package com.cloud.transaction_service.service.impl;

import com.cloud.transaction_service.dto.AccountDTO;
import com.cloud.transaction_service.dto.TransactionEvent;
import com.cloud.transaction_service.dto.TransferRequest;
import com.cloud.transaction_service.entity.*;
import com.cloud.transaction_service.exception.InsufficientBalanceException;
import com.cloud.transaction_service.exception.InvalidInputException;
import com.cloud.transaction_service.exception.ResourceNotFoundException;
import com.cloud.transaction_service.repository.OutboxRepository;
import com.cloud.transaction_service.repository.TransactionRepository;
import com.cloud.transaction_service.service.AccountServiceClient;
import com.cloud.transaction_service.service.IdempotencyService;
import com.cloud.transaction_service.service.TransactionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final OutboxRepository outboxRepository;
    private final IdempotencyService idempotencyService;
    private final AccountServiceClient accountServiceClient;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public Transaction transfer(TransferRequest req) {
        log.info("Processing transfer request from {} to {} for amount {}", 
            req.getSenderAccountNumber(), req.getReceiverAccountNumber(), req.getAmount());

        if (!idempotencyService.isFirstRequest(req.getRequestKey(), Duration.ofHours(24))) {
            return transactionRepository.findByRequestKey(req.getRequestKey())
                    .orElseThrow(() -> new RuntimeException("Transaction in progress or duplicate request"));
        }

        try {
            // 1. Fetch account details by account number
            AccountDTO sender = accountServiceClient.getAccountByNumber(req.getSenderAccountNumber()).block();
            AccountDTO receiver = accountServiceClient.getAccountByNumber(req.getReceiverAccountNumber()).block();

            if (sender == null || receiver == null) {
                throw new ResourceNotFoundException("One or both accounts not found");
            }

            // 2. Ownership Validation for Sender
            checkOwnership(sender.getUserId());

            // 3. Status and Balance Validation
            if (sender.getBalance().compareTo(req.getAmount()) < 0) {
                throw new InsufficientBalanceException("Insufficient balance");
            }
            if (!"ACTIVE".equals(sender.getStatus())) {
                throw new InvalidInputException("Sender account is not active");
            }

            // 4. Update balances in account-service
            accountServiceClient.updateBalance(sender.getId(), req.getAmount().negate()).block();
            accountServiceClient.updateBalance(receiver.getId(), req.getAmount()).block();

            // 5. Create Transaction Record
            Transaction txn = Transaction.builder()
                    .requestKey(req.getRequestKey())
                    .senderAccountId(sender.getId())
                    .senderAccountNumber(sender.getAccountNumber())
                    .receiverAccountId(receiver.getId())
                    .receiverAccountNumber(receiver.getAccountNumber())
                    .amount(req.getAmount())
                    .type(TransactionType.TRANSFER)
                    .status(TransactionStatus.SUCCESS)
                    .description(req.getDescription())
                    .build();
            
            Transaction savedTxn = transactionRepository.save(txn);
            createOutboxEvent(savedTxn, "TRANSACTION_COMPLETED");
            return savedTxn;

        } catch (Exception e) {
            log.error("Transfer failed: {}", e.getMessage());
            idempotencyService.markAsFailed(req.getRequestKey());
            throw e;
        }
    }

    @Override
    @Transactional
    public Transaction deposit(String accountNumber, BigDecimal amount) {
        AccountDTO account = accountServiceClient.getAccountByNumber(accountNumber).block();
        if (account == null) {
            throw new ResourceNotFoundException("Account not found");
        }

        accountServiceClient.updateBalance(account.getId(), amount).block();

        Transaction txn = Transaction.builder()
                .requestKey("DEP-" + UUID.randomUUID())
                .receiverAccountId(account.getId())
                .receiverAccountNumber(account.getAccountNumber())
                .amount(amount)
                .type(TransactionType.DEPOSIT)
                .status(TransactionStatus.SUCCESS)
                .build();

        Transaction savedTxn = transactionRepository.save(txn);
        createOutboxEvent(savedTxn, "DEPOSIT_COMPLETED");
        return savedTxn;
    }

    @Override
    @Transactional
    public Transaction withdraw(String accountNumber, BigDecimal amount) {
        AccountDTO account = accountServiceClient.getAccountByNumber(accountNumber).block();
        if (account == null) {
            throw new ResourceNotFoundException("Account not found");
        }

        // Ownership Validation
        checkOwnership(account.getUserId());

        if (account.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException("Insufficient balance");
        }

        accountServiceClient.updateBalance(account.getId(), amount.negate()).block();

        Transaction txn = Transaction.builder()
                .requestKey("WTH-" + UUID.randomUUID())
                .senderAccountId(account.getId())
                .senderAccountNumber(account.getAccountNumber())
                .amount(amount)
                .type(TransactionType.WITHDRAWAL)
                .status(TransactionStatus.SUCCESS)
                .build();

        Transaction savedTxn = transactionRepository.save(txn);
        createOutboxEvent(savedTxn, "WITHDRAWAL_COMPLETED");
        return savedTxn;
    }

    private void checkOwnership(String accountUserId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        boolean isStaffOrAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("STAFF") || a.getAuthority().equals("ADMIN"));

        log.debug("Checking ownership: currentUserEmail={}, accountUserId={}, isStaffOrAdmin={}", 
            currentUserEmail, accountUserId, isStaffOrAdmin);

        if (!isStaffOrAdmin && !currentUserEmail.equals(accountUserId)) {
            log.error("Ownership check failed! Token user: {}, Account owner: {}", currentUserEmail, accountUserId);
            throw new AccessDeniedException("You do not have permission to perform this transaction for this account");
        }
    }

    private void createOutboxEvent(Transaction txn, String eventType) {
        try {
            TransactionEvent event = TransactionEvent.builder()
                    .transactionId(txn.getId())
                    .requestKey(txn.getRequestKey())
                    .senderAccountId(txn.getSenderAccountId())
                    .receiverAccountId(txn.getReceiverAccountId())
                    .amount(txn.getAmount())
                    .type(txn.getType().name())
                    .status(txn.getStatus().name())
                    .timestamp(txn.getCreatedAt())
                    .build();

            Outbox outbox = Outbox.builder()
                    .aggregateType("TRANSACTION")
                    .aggregateId(txn.getId().toString())
                    .eventType(eventType)
                    .payload(objectMapper.writeValueAsString(event))
                    .build();

            outboxRepository.save(outbox);
        } catch (Exception e) {
            log.error("Failed to create outbox event: {}", e.getMessage());
            throw new RuntimeException("Outbox logging failed", e);
        }
    }
}
