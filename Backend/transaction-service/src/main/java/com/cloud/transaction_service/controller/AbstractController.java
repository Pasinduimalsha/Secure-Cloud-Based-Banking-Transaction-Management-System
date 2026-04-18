package com.cloud.transaction_service.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.Map;

/**
 * Standardized base controller to ensure consistent API response envelopes.
 */
public abstract class AbstractController {

    protected ResponseEntity<Map<String, Object>> sendSuccessResponse(Object data, String message) {
        return buildResponse(HttpStatus.OK, "success", message, data);
    }

    protected ResponseEntity<Map<String, Object>> sendCreatedResponse(Object data, String message) {
        return buildResponse(HttpStatus.CREATED, "success", message, data);
    }

    protected ResponseEntity<Map<String, Object>> sendErrorResponse(HttpStatus status, String message) {
        return buildResponse(status, "error", message, null);
    }

    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String result, String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", status.value());
        response.put("result", result);
        response.put("message", message);
        if (data != null) {
            response.put("data", data);
        }
        return new ResponseEntity<>(response, status);
    }
}
