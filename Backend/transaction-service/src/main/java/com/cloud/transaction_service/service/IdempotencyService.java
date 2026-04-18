package com.cloud.transaction_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Service to handle idempotency using Redis.
 * Prevents duplicate processing of transactions (e.g., duplicate clicks).
 */
@Service
@RequiredArgsConstructor
public class IdempotencyService {

    private final StringRedisTemplate redisTemplate;
    private static final String KEY_PREFIX = "txn:request:";

    /**
     * Tries to acquire a lock for a request key.
     * @param requestKey Unique identifier for the request.
     * @param timeoutDuration How long the idempotency key should last.
     * @return true if the key was set (first time), false if it already exists.
     */
    public boolean isFirstRequest(String requestKey, Duration timeoutDuration) {
        String key = KEY_PREFIX + requestKey;
        Boolean isSet = redisTemplate.opsForValue().setIfAbsent(key, "PROCESSING", timeoutDuration);
        return Boolean.TRUE.equals(isSet);
    }

    public void markAsFailed(String requestKey) {
        redisTemplate.delete(KEY_PREFIX + requestKey);
    }
}
