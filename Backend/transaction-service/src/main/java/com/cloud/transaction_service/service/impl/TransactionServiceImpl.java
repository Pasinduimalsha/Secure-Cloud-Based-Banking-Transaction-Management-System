package com.cloud.transaction_service.service.impl;

import com.cloud.transaction_service.dto.TransactionEvent;
import com.cloud.transaction_service.dto.TransferRequest;
import com.cloud.transaction_service.entity.*;
import com.cloud.transaction_service.exception.InsufficientBalanceException;
import com.cloud.transaction_service.exception.InvalidInputException;
import com.cloud.transaction_service.exception.ResourceNotFoundException;
import com.cloud.transaction_service.repository.AccountRepository;
import com.cloud.transaction_service.repository.OutboxRepository;
import com.cloud.transaction_service.repository.TransactionRepository;
import com.cloud.transaction_service.service.IdempotencyService;
import com.cloud.transaction_service.service.TransactionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionServiceImpl implements TransactionService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final OutboxRepository outboxRepository;
    private final IdempotencyService idempotencyService;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public Transaction transfer(TransferRequest req) {
        log.info("Processing transfer request from {} to {} for amount {}", 
            req.getSenderAccountId(), req.getReceiverAccountId(), req.getAmount());

        // 1. Idempotency check
        if (!idempotencyService.isFirstRequest(req.getRequestKey(), Duration.ofHours(24))) {
            return transactionRepository.findByRequestKey(req.getRequestKey())
                    .orElseThrow(() -> new RuntimeException("Transaction in progress or duplicate request"));
        }

        try {
            // 2. Load accounts with Pessimistic Lock (Prevents double spending)
            Account sender = accountRepository.findByIdWithLock(req.getSenderAccountId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sender account not found"));
            Account receiver = accountRepository.findByIdWithLock(req.getReceiverAccountId())
                    .orElseThrow(() -> new ResourceNotFoundException("Receiver account not found"));

            // 3. Validation
            if (sender.getBalance().compareTo(req.getAmount()) < 0) {
                throw new InsufficientBalanceException("Insufficient balance");
            }
            if (!"ACTIVE".equals(sender.getStatus())) {
                throw new InvalidInputException("Sender account is not active");
            }

            //TODO: Before completing transaction add an OTP verification

            // 4. Atomic balance update
            sender.setBalance(sender.getBalance().subtract(req.getAmount()));
            receiver.setBalance(receiver.getBalance().add(req.getAmount()));

            accountRepository.save(sender);
            accountRepository.save(receiver);

            // 5. Create Transaction Record
            Transaction txn = Transaction.builder()
                    .requestKey(req.getRequestKey())
                    .senderAccount(sender)
                    .receiverAccount(receiver)
                    .amount(req.getAmount())
                    .type(TransactionType.TRANSFER)
                    .status(TransactionStatus.SUCCESS)
                    .description(req.getDescription())
                    .build();
            
            Transaction savedTxn = transactionRepository.save(txn);

            // 6. Save to Outbox (Reliable Message Delivery)
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
    public Transaction deposit(Long accountId, BigDecimal amount) {
        Account account = accountRepository.findByIdWithLock(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        account.setBalance(account.getBalance().add(amount));
        accountRepository.save(account);

        Transaction txn = Transaction.builder()
                .requestKey("DEP-" + UUID.randomUUID())
                .receiverAccount(account)
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
    public Transaction withdraw(Long accountId, BigDecimal amount) {
        Account account = accountRepository.findByIdWithLock(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        if (account.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException("Insufficient balance");
        }

        account.setBalance(account.getBalance().subtract(amount));
        accountRepository.save(account);

        Transaction txn = Transaction.builder()
                .requestKey("WTH-" + UUID.randomUUID())
                .senderAccount(account)
                .amount(amount)
                .type(TransactionType.WITHDRAWAL)
                .status(TransactionStatus.SUCCESS)
                .build();

        Transaction savedTxn = transactionRepository.save(txn);
        createOutboxEvent(savedTxn, "WITHDRAWAL_COMPLETED");
        return savedTxn;
    }

    private void createOutboxEvent(Transaction txn, String eventType) {
        try {
            TransactionEvent event = TransactionEvent.builder()
                    .transactionId(txn.getId())
                    .requestKey(txn.getRequestKey())
                    .senderAccountId(txn.getSenderAccount() != null ? txn.getSenderAccount().getId() : null)
                    .receiverAccountId(txn.getReceiverAccount() != null ? txn.getReceiverAccount().getId() : null)
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
            // This will cause the transaction to rollback, which is what we want for consistency
            throw new RuntimeException("Outbox logging failed", e);
        }
    }
}
