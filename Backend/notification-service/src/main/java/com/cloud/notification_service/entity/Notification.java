package com.cloud.notification_service.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    private String id;

    @Field("user_id")
    private String userId;

    private String title;

    private String message;

    private String type; // EMAIL, SMS, PUSH

    private String recipient;

    private String status; // SENT, FAILED, PENDING

    @Builder.Default
    @Field("created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
