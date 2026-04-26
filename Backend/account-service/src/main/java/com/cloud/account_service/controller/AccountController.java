package com.cloud.account_service.controller;

import com.cloud.account_service.dto.AccountDTO;
import com.cloud.account_service.entity.AccountStatus;
import com.cloud.account_service.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/accounts")
@RequiredArgsConstructor
@Slf4j
public class AccountController extends AbstractController {

    private final AccountService accountService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createAccount(@Valid @RequestBody AccountDTO accountDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isStaffOrAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("STAFF") || a.getAuthority().equals("ADMIN"));

        // Only auto-set userId if the caller is a CUSTOMER.
        // STAFF/ADMIN can specify the customer's ID/email.
        if (!isStaffOrAdmin || accountDTO.getUserId() == null) {
            accountDTO.setUserId(authentication.getName());
        }
        
        AccountDTO createdAccount = accountService.createAccount(accountDTO);
        return sendCreatedResponse(createdAccount, "Account created successfully");
    }

    @GetMapping("/{accountId}")
    public ResponseEntity<Map<String, Object>> getAccountById(@PathVariable Long accountId) {
        AccountDTO account = accountService.getAccountById(accountId);
        checkOwnership(account.getUserId());
        return sendSuccessResponse(account, "Account retrieved successfully");
    }

    @GetMapping("/{accountId}/balance")
    public ResponseEntity<Map<String, Object>> getBalance(@PathVariable Long accountId) {
        AccountDTO account = accountService.getAccountById(accountId);
        checkOwnership(account.getUserId());
        BigDecimal balance = accountService.getBalance(accountId);
        return sendSuccessResponse(Map.of("balance", balance), "Balance retrieved successfully");
    }

    @GetMapping("/number/{accountNumber}")
    public ResponseEntity<Map<String, Object>> getAccountByNumber(@PathVariable String accountNumber) {
        AccountDTO account = accountService.getAccountByNumber(accountNumber);
        // Removed ownership check here to allow customers to resolve receiver accounts for transfers
        return sendSuccessResponse(account, "Account retrieved successfully by number");
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

    @DeleteMapping("/{accountId}")
    public ResponseEntity<Map<String, Object>> deleteAccount(@PathVariable Long accountId) {
        accountService.deleteAccount(accountId);
        return sendSuccessResponse(null, "Account deleted successfully");
    }

    @PutMapping("/{accountId}/balance")
    public ResponseEntity<Map<String, Object>> updateBalance(
            @PathVariable Long accountId,
            @RequestBody Map<String, BigDecimal> request) {
        BigDecimal delta = request.get("delta");
        AccountDTO updatedAccount = accountService.updateBalance(accountId, delta);
        return sendSuccessResponse(updatedAccount, "Account balance updated successfully");
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
            throw new AccessDeniedException("You do not have permission to access this account");
        }
    }
}
