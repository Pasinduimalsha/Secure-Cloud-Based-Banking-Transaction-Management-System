package com.cloud.notification_service.service;

import com.cloud.notification_service.config.RabbitMQConfig;
import com.cloud.notification_service.dto.TransactionEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class NotificationMessageListener {

    @RabbitListener(queues = RabbitMQConfig.NOTIF_QUEUE)
    public void consumeTransactionEvent(TransactionEvent event) {
        log.info("🔔 [NOTIFICATION SENT]");
        log.info("Transaction ID : {}", event.getTransactionId());
        log.info("Type           : {}", event.getType());
        log.info("Amount         : ${}", event.getAmount());
        log.info("Status         : {}", event.getStatus());
        
        if (event.getSenderAccountId() != null) {
            log.info("Sender Acc     : {}", event.getSenderAccountId());
        }
        if (event.getReceiverAccountId() != null) {
            log.info("Receiver Acc   : {}", event.getReceiverAccountId());
        }
        
        log.info("Timestamp      : {}", event.getTimestamp());
        log.info("--------------------------------------------------");
        
        // In a real application, you would invoke an EmailClient (like SendGrid)
        // or an SMS Gateway (like Twilio) here to notify the user.
    }
}
