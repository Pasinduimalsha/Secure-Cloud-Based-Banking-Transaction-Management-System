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
    private final EmailService emailService;

    @RabbitListener(queues = RabbitMQConfig.NOTIF_QUEUE)
    public void consumeTransactionEvent(TransactionEvent event) {
        log.info("🔔 [NOTIFICATION RECEIVED] for User: {}", event.getUserId());

        try {
            String title = "Transaction " + event.getType();
            String messageBody = String.format("A %s of $%s was %s.", 
                    event.getType().toLowerCase(), 
                    event.getAmount(), 
                    event.getStatus().toLowerCase());

            // 1. Save to database for UI alerts
            Notification notification = Notification.builder()
                    .userId(event.getUserId())
                    .title(title)
                    .message(messageBody)
                    .type("IN_APP")
                    .status("SENT")
                    .build();

            notificationRepository.save(notification);
            log.info("Successfully saved in-app notification for User: {}", event.getUserId());

            // 2. Send email notification
            if (event.getUserId() != null && event.getUserId().contains("@")) {
                emailService.sendEmail(event.getUserId(), title, messageBody + "\n\nThank you for banking with SecureBank.");
            }
        } catch (Exception e) {
            log.error("Failed to process notification: {}", e.getMessage());
        }
    }
}
