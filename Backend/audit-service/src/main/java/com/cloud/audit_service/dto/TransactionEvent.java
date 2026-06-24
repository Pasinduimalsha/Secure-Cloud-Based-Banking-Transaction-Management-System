package com.cloud.audit_service.dto;

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
public class TransactionEvent {
    private Long transactionId;
    private String requestKey;
    private String senderAccountNumber;
    private String receiverAccountNumber;
    private BigDecimal amount;
    private String type;
    private String status;
    private String userId;
    private LocalDateTime timestamp;
}
