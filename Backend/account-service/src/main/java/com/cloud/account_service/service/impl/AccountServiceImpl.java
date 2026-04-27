package com.cloud.account_service.service.impl;

import com.cloud.account_service.dto.AccountDTO;
import com.cloud.account_service.entity.Account;
import com.cloud.account_service.entity.AccountStatus;
import com.cloud.account_service.exception.AccountNotFoundException;
import com.cloud.account_service.mapper.AccountMapper;
import com.cloud.account_service.repository.AccountRepository;
import com.cloud.account_service.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final AccountMapper accountMapper;

    @Override
    @Transactional
    public AccountDTO createAccount(AccountDTO accountDTO) {
        Account account = accountMapper.toEntity(accountDTO);
        if (account.getAccountNumber() == null || account.getAccountNumber().isEmpty()) {
            account.setAccountNumber("ACC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        account.setStatus(AccountStatus.PENDING);
        Account savedAccount = accountRepository.save(account);
        return accountMapper.toDTO(savedAccount);
    }

    @Override
    public AccountDTO getAccountById(Long id) {
        return accountRepository.findById(id)
                .map(accountMapper::toDTO)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with id: " + id));
    }

    @Override
    public BigDecimal getBalance(Long id) {
        return accountRepository.findById(id)
                .map(Account::getBalance)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with id: " + id));
    }

    @Override
    @Transactional
    public AccountDTO updateStatus(Long id, AccountStatus status) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with id: " + id));
        account.setStatus(status);
        return accountMapper.toDTO(accountRepository.save(account));
    }

    @Override
    public List<AccountDTO> getAllAccounts() {
        return accountRepository.findAll().stream()
                .map(accountMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AccountDTO> getAccountsByUserId(String userId) {
        return accountRepository.findByUserId(userId).stream()
                .map(accountMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteAccount(Long id) {
        if (!accountRepository.existsById(id)) {
            throw new AccountNotFoundException("Account not found with id: " + id);
        }
        accountRepository.deleteById(id);
    }

    @Override
    @Transactional
    public AccountDTO updateBalance(Long id, BigDecimal delta) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with id: " + id));
        account.setBalance(account.getBalance().add(delta));
        return accountMapper.toDTO(accountRepository.save(account));
    }

    @Override
    public AccountDTO getAccountByNumber(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .map(accountMapper::toDTO)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with number: " + accountNumber));
    }
}
