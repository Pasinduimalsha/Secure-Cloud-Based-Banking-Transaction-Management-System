package com.cloud.account_service.dto;

import com.cloud.account_service.entity.AccountStatus;
import com.cloud.account_service.entity.AccountType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountDTO {
    private Long id;
    private String accountNumber;
    
    @NotNull(message = "User identifier is required")
    private String userId;
    
    @PositiveOrZero(message = "Balance cannot be negative")
    private BigDecimal balance;
    
    @NotNull(message = "Account type is required")
    private AccountType accountType;
    
    private AccountStatus status;
    private LocalDateTime createdAt;
}
