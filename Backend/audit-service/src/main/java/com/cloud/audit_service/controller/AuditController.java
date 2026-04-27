package com.cloud.audit_service.controller;

import com.cloud.audit_service.entity.AuditLog;
import com.cloud.audit_service.repository.AuditLogRepository;
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
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping("/logs")
    public ResponseEntity<Map<String, Object>> getLogs(@org.springframework.web.bind.annotation.RequestParam(required = false) String userId) {
        List<AuditLog> logs;
        if (userId != null && !userId.isEmpty()) {
            logs = auditLogRepository.findByUserId(userId, Sort.by(Sort.Direction.DESC, "loggedAt"));
        } else {
            logs = auditLogRepository.findAll(Sort.by(Sort.Direction.DESC, "loggedAt"));
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", 200);
        response.put("message", "Audit logs retrieved successfully");
        response.put("data", logs);
        
        return ResponseEntity.ok(response);
    }
}
