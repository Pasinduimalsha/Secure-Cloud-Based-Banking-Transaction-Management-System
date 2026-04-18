package com.cloud.account_service.controller;

import com.cloud.account_service.dto.AccountDTO;
import com.cloud.account_service.entity.AccountStatus;
import com.cloud.account_service.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/accounts")
@RequiredArgsConstructor
public class AccountController extends AbstractController {

    private final AccountService accountService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createAccount(@Valid @RequestBody AccountDTO accountDTO) {
        AccountDTO createdAccount = accountService.createAccount(accountDTO);
        return sendCreatedResponse(createdAccount, "Account created successfully");
    }

    @GetMapping("/{accountId}")
    public ResponseEntity<Map<String, Object>> getAccountById(@PathVariable Long accountId) {
        AccountDTO account = accountService.getAccountById(accountId);
        return sendSuccessResponse(account, "Account retrieved successfully");
    }

    @GetMapping("/{accountId}/balance")
    public ResponseEntity<Map<String, Object>> getBalance(@PathVariable Long accountId) {
        BigDecimal balance = accountService.getBalance(accountId);
        return sendSuccessResponse(Map.of("balance", balance), "Balance retrieved successfully");
    }

    @PutMapping("/{accountId}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable Long accountId,
            @RequestBody Map<String, String> request) {
        AccountStatus status = AccountStatus.valueOf(request.get("status").toUpperCase());
        AccountDTO updatedAccount = accountService.updateStatus(accountId, status);
        return sendSuccessResponse(updatedAccount, "Account status updated successfully to " + status);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllAccounts() {
        List<AccountDTO> accounts = accountService.getAllAccounts();
        return sendSuccessResponse(accounts, "All accounts retrieved successfully");
    }
}
