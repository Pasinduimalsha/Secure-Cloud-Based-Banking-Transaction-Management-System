package com.cloud.transaction_service.service;

import com.cloud.transaction_service.dto.AccountDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AccountServiceClient {

    private final WebClient accountWebClient;

    public Mono<AccountDTO> getAccount(Long accountId) {
        return accountWebClient.get()
                .uri("/api/v1/accounts/{accountId}", accountId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .map(this::mapToAccountDTO);
    }

    public Mono<AccountDTO> getAccountByNumber(String accountNumber) {
        return accountWebClient.get()
                .uri("/api/v1/accounts/number/{accountNumber}", accountNumber)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .map(this::mapToAccountDTO);
    }

    private AccountDTO mapToAccountDTO(Map<String, Object> response) {
        Map<String, Object> data = (Map<String, Object>) response.get("data");
        return AccountDTO.builder()
                .id(Long.valueOf(data.get("id").toString()))
                .accountNumber(data.get("accountNumber").toString())
                .userId(data.get("userId").toString())
                .balance(new BigDecimal(data.get("balance").toString()))
                .status(data.get("status").toString())
                .build();
    }

    public Mono<Void> updateAccountStatus(Long accountId, String status) {
        return accountWebClient.put()
                .uri("/api/v1/accounts/{accountId}/status", accountId)
                .bodyValue(Map.of("status", status))
                .retrieve()
                .bodyToMono(Void.class);
    }

    public Mono<Void> updateBalance(Long accountId, BigDecimal delta) {
        return accountWebClient.put()
                .uri("/api/v1/accounts/{accountId}/balance", accountId)
                .bodyValue(Map.of("delta", delta))
                .retrieve()
                .bodyToMono(Void.class);
    }
}
