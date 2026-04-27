package com.cloud.notification_service.controller;

import com.cloud.notification_service.entity.Notification;
import com.cloud.notification_service.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getNotifications(@org.springframework.web.bind.annotation.RequestParam(required = false) String userId) {
        List<Notification> notifications;
        if (userId != null && !userId.isEmpty()) {
            notifications = notificationRepository.findByUserId(userId, Sort.by(Sort.Direction.DESC, "createdAt"));
        } else {
            notifications = notificationRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", 200);
        response.put("message", "Notifications retrieved successfully");
        response.put("data", notifications);
        
        return ResponseEntity.ok(response);
    }
}
