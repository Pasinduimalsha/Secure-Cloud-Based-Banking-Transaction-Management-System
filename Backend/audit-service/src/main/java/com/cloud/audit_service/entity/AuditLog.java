package com.cloud.audit_service.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    private String id; // MongoDB IDs are typically Strings (ObjectIds)

    @Field("transaction_id")
    private Long transactionId;

    @Field("request_key")
    private String requestKey;

    @Field("sender_account_id")
    private Long senderAccountId;

    @Field("receiver_account_id")
    private Long receiverAccountId;

    private BigDecimal amount;

    private String type;

    private String status;

    @Field("transaction_timestamp")
    private LocalDateTime transactionTimestamp;

    @Builder.Default
    @Field("logged_at")
    private LocalDateTime loggedAt = LocalDateTime.now();
}
