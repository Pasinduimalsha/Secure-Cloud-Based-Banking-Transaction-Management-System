package com.cloud.account_service.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.Map;

/**
 * Base controller providing standardized response formats across the banking system.
 * Follows the guidelines defined in the Banking Service Style Guide.
 */
public abstract class AbstractController {

    protected static final String STATUS_KEY = "status";
    protected static final String MESSAGE_KEY = "message";
    protected static final String DATA_KEY = "data";

    protected <T> ResponseEntity<Map<String, Object>> sendSuccessResponse(T data, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put(STATUS_KEY, HttpStatus.OK.value());
        body.put(MESSAGE_KEY, message);
        if (data != null) {
            body.put(DATA_KEY, data);
        }
        return ResponseEntity.ok(body);
    }

    protected <T> ResponseEntity<Map<String, Object>> sendCreatedResponse(T data, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put(STATUS_KEY, HttpStatus.CREATED.value());
        body.put(MESSAGE_KEY, message);
        if (data != null) {
            body.put(DATA_KEY, data);
        }
        return new ResponseEntity<>(body, HttpStatus.CREATED);
    }

    protected ResponseEntity<Map<String, Object>> sendNoContentResponse(String message) {
        Map<String, Object> body = new HashMap<>();
        body.put(STATUS_KEY, HttpStatus.NO_CONTENT.value());
        body.put(MESSAGE_KEY, message);
        return new ResponseEntity<>(body, HttpStatus.NO_CONTENT);
    }

    protected ResponseEntity<Map<String, Object>> sendErrorResponse(HttpStatus status, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put(STATUS_KEY, status.value());
        body.put(MESSAGE_KEY, message);
        return new ResponseEntity<>(body, status);
    }
    
    protected ResponseEntity<Map<String, Object>> sendNotFoundResponse(String message) {
        return sendErrorResponse(HttpStatus.NOT_FOUND, message);
    }

    protected ResponseEntity<Map<String, Object>> sendBadRequestResponse(String message) {
        return sendErrorResponse(HttpStatus.BAD_REQUEST, message);
    }
}
