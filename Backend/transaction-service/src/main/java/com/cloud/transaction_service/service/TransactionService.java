package com.cloud.transaction_service.service;

import com.cloud.transaction_service.dto.TransferRequest;
import com.cloud.transaction_service.entity.Transaction;

public interface TransactionService {
    Transaction transfer(TransferRequest request);
    Transaction deposit(Long accountId, java.math.BigDecimal amount);
    Transaction withdraw(Long accountId, java.math.BigDecimal amount);
}
