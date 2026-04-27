package com.cloud.transaction_service.service;

import com.cloud.transaction_service.dto.TransferRequest;
import com.cloud.transaction_service.entity.Transaction;

public interface TransactionService {
    Transaction transfer(TransferRequest request);
    Transaction deposit(String accountNumber, java.math.BigDecimal amount);
    Transaction withdraw(String accountNumber, java.math.BigDecimal amount);
}
