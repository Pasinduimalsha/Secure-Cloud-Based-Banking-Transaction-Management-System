package com.cloud.notification_service.service;

import com.cloud.notification_service.config.RabbitMQConfig;
import com.cloud.notification_service.dto.TransactionEvent;
import com.cloud.notification_service.entity.Notification;
import com.cloud.notification_service.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationMessageListener {

    private final NotificationRepository notificationRepository;

    @RabbitListener(queues = RabbitMQConfig.NOTIF_QUEUE)
    public void consumeTransactionEvent(TransactionEvent event) {
        log.info("🔔 [NOTIFICATION RECEIVED] for User: {}", event.getUserId());

        try {
            Notification notification = Notification.builder()
                    .userId(event.getUserId())
                    .title("Transaction " + event.getType())
                    .message(String.format("A %s of $%s was %s.", 
                            event.getType().toLowerCase(), 
                            event.getAmount(), 
                            event.getStatus().toLowerCase()))
                    .type("IN_APP")
                    .status("SENT")
                    .build();

            notificationRepository.save(notification);
            log.info("Successfully saved notification for User: {}", event.getUserId());
        } catch (Exception e) {
            log.error("Failed to process notification: {}", e.getMessage());
        }
    }
}
