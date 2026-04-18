package com.cloud.audit_service.service;

import com.cloud.audit_service.config.RabbitMQConfig;
import com.cloud.audit_service.dto.TransactionEvent;
import com.cloud.audit_service.entity.AuditLog;
import com.cloud.audit_service.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditMessageListener {

    private final AuditLogRepository auditLogRepository;

    @RabbitListener(queues = RabbitMQConfig.AUDIT_QUEUE)
    public void consumeTransactionEvent(TransactionEvent event) {
        log.info("Received transaction event for audit: HTTP Request Key = {}, Txn ID = {}", 
                event.getRequestKey(), event.getTransactionId());

        try {
            AuditLog auditLog = AuditLog.builder()
                    .transactionId(event.getTransactionId())
                    .requestKey(event.getRequestKey())
                    .senderAccountId(event.getSenderAccountId())
                    .receiverAccountId(event.getReceiverAccountId())
                    .amount(event.getAmount())
                    .type(event.getType())
                    .status(event.getStatus())
                    .transactionTimestamp(event.getTimestamp())
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Successfully saved audit log for Txn ID: {}", event.getTransactionId());
        } catch (Exception e) {
            log.error("Failed to process audit log for Txn ID: {}. Error: {}", event.getTransactionId(), e.getMessage());
            throw e; // Throwing exception will cause RabbitMQ to requeue or send to DLQ based on config
        }
    }
}
