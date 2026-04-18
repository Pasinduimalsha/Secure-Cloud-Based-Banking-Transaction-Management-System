package com.cloud.transaction_service.service;

import com.cloud.transaction_service.config.RabbitMQConfig;
import com.cloud.transaction_service.entity.Outbox;
import com.cloud.transaction_service.repository.OutboxRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Reliability worker that pushes messages from the Outbox table to RabbitMQ.
 * Implements the Transactional Outbox Pattern.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OutboxProcessor {

    private final OutboxRepository outboxRepository;
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    @Scheduled(fixedDelay = 5000) // Poll every 5 seconds
    @Transactional
    public void processOutbox() {
        List<Outbox> pendingEvents = outboxRepository.findByProcessedFalseOrderByCreatedAtAsc();
        
        if (pendingEvents.isEmpty()) {
            return;
        }

        log.info("Processing {} pending events from outbox", pendingEvents.size());

        for (Outbox event : pendingEvents) {
            try {
                // Convert JSON payload back to object (or just send string if needed)
                // For this implementation, we send the raw JSON and use RabbitMQ config to handle serialization
                Object payload = objectMapper.readValue(event.getPayload(), Object.class);
                
                rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.NOTIF_ROUTING_KEY, payload);
                
                event.setProcessed(true);
                event.setProcessedAt(LocalDateTime.now());
                outboxRepository.save(event);
                
                log.info("Successfully processed outbox event: {}", event.getId());
            } catch (Exception e) {
                log.error("Failed to process outbox event: {}. Reason: {}", event.getId(), e.getMessage());
                // In a production app, we would implement a retry count or Dead Letter Queue here
            }
        }
    }
}
