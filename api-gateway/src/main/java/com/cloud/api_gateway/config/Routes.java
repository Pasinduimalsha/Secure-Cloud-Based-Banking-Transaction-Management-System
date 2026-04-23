package com.cloud.api_gateway.config;

import com.cloud.api_gateway.filter.AuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.server.mvc.filter.CircuitBreakerFilterFunctions;
import org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions;
import org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.function.RequestPredicates;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

import java.net.URI;

import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.route;

@Configuration
public class Routes {

    private final AuthenticationFilter authFilter;

    public Routes(AuthenticationFilter authFilter) {
        this.authFilter = authFilter;
    }

    @Value("${service.auth.url}")
    private String authServiceUrl;

    @Value("${service.account.url}")
    private String accountServiceUrl;

    @Value("${service.transaction.url}")
    private String transactionServiceUrl;

    @Value("${service.audit.url}")
    private String auditServiceUrl;

    @Value("${service.notification.url}")
    private String notificationServiceUrl;

    @Bean
    public RouterFunction<ServerResponse> authServiceRoute() {
        return GatewayRouterFunctions.route("auth_service")
                .route(RequestPredicates.path("/api/v1/auth/**"), HandlerFunctions.http(authServiceUrl))
                .filter(authFilter)
                .filter(CircuitBreakerFilterFunctions.circuitBreaker("authServiceCircuitBreaker",
                        URI.create("forward:/fallbackRoute")))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> accountServiceRoute() {
        return GatewayRouterFunctions.route("account_service")
                .route(RequestPredicates.path("/api/v1/accounts/**"), HandlerFunctions.http(accountServiceUrl))
                .filter(authFilter)
                .filter(CircuitBreakerFilterFunctions.circuitBreaker("accountServiceCircuitBreaker",
                        URI.create("forward:/fallbackRoute")))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> transactionServiceRoute() {
        return GatewayRouterFunctions.route("transaction_service")
                .route(RequestPredicates.path("/api/v1/transactions/**"), HandlerFunctions.http(transactionServiceUrl))
                .filter(authFilter)
                .filter(CircuitBreakerFilterFunctions.circuitBreaker("transactionServiceCircuitBreaker",
                        URI.create("forward:/fallbackRoute")))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> auditServiceRoute() {
        return GatewayRouterFunctions.route("audit_service")
                .route(RequestPredicates.path("/api/v1/audit/**"), HandlerFunctions.http(auditServiceUrl))
                .filter(authFilter)
                .filter(CircuitBreakerFilterFunctions.circuitBreaker("auditServiceCircuitBreaker",
                        URI.create("forward:/fallbackRoute")))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> notificationServiceRoute() {
        return GatewayRouterFunctions.route("notification_service")
                .route(RequestPredicates.path("/api/v1/notifications/**"), HandlerFunctions.http(notificationServiceUrl))
                .filter(authFilter)
                .filter(CircuitBreakerFilterFunctions.circuitBreaker("notificationServiceCircuitBreaker",
                        URI.create("forward:/fallbackRoute")))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> fallbackRoute() {
        return route("fallbackRoute")
                .route(RequestPredicates.path("/fallbackRoute"), request -> ServerResponse.status(HttpStatus.SERVICE_UNAVAILABLE)
                        .header("Content-Type", "application/json")
                        .body(java.util.Map.of(
                                "status", "error",
                                "message", "The requested service is currently unavailable. Please try again later.",
                                "errorCode", "SERVICE_UNAVAILABLE",
                                "timestamp", java.time.LocalDateTime.now().toString()
                        )))
                .build();
    }
}
