package com.cloud.account_service.service;

import com.cloud.account_service.dto.AccountDTO;
import com.cloud.account_service.entity.AccountStatus;
import java.math.BigDecimal;
import java.util.List;

public interface AccountService {
    AccountDTO createAccount(AccountDTO accountDTO);
    AccountDTO getAccountById(Long id);
    BigDecimal getBalance(Long id);
    AccountDTO updateStatus(Long id, AccountStatus status);
    List<AccountDTO> getAllAccounts();
    List<AccountDTO> getAccountsByUserId(String userId);
}
