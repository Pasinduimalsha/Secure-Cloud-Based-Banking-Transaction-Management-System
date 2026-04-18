package com.cloud.account_service.mapper;

import com.cloud.account_service.dto.AccountDTO;
import com.cloud.account_service.entity.Account;
import org.springframework.stereotype.Component;

@Component
public class AccountMapper {

    public AccountDTO toDTO(Account account) {
        if (account == null) return null;
        return AccountDTO.builder()
                .id(account.getId())
                .accountNumber(account.getAccountNumber())
                .userId(account.getUserId())
                .balance(account.getBalance())
                .accountType(account.getAccountType())
                .status(account.getStatus())
                .createdAt(account.getCreatedAt())
                .build();
    }

    public Account toEntity(AccountDTO dto) {
        if (dto == null) return null;
        return Account.builder()
                .id(dto.getId())
                .accountNumber(dto.getAccountNumber())
                .userId(dto.getUserId())
                .balance(dto.getBalance())
                .accountType(dto.getAccountType())
                .status(dto.getStatus())
                .createdAt(dto.getCreatedAt())
                .build();
    }
}
