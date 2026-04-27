package com.cloud.transaction_service.controller;

import com.cloud.transaction_service.dto.TransferRequest;
import com.cloud.transaction_service.entity.Transaction;
import com.cloud.transaction_service.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController extends AbstractController {

    private final TransactionService transactionService;

    @PostMapping("/transfer")
    public ResponseEntity<Map<String, Object>> transfer(@Valid @RequestBody TransferRequest request) {
        Transaction txn = transactionService.transfer(request);
        return sendCreatedResponse(txn, "Transfer completed successfully");
    }

    @PostMapping("/deposit")
    public ResponseEntity<Map<String, Object>> deposit(
            @RequestParam String accountNumber,
            @RequestParam BigDecimal amount) {
        Transaction txn = transactionService.deposit(accountNumber, amount);
        return sendCreatedResponse(txn, "Deposit completed successfully");
    }

    @PostMapping("/withdraw")
    public ResponseEntity<Map<String, Object>> withdraw(
            @RequestParam String accountNumber,
            @RequestParam BigDecimal amount) {
        Transaction txn = transactionService.withdraw(accountNumber, amount);
        return sendCreatedResponse(txn, "Withdrawal completed successfully");
    }
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllTransactions() {
        return sendSuccessResponse(transactionService.getAllTransactions(), "Transactions retrieved successfully");
    }
}
