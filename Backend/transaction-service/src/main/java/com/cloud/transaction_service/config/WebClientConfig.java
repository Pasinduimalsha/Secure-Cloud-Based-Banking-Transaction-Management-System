package com.cloud.transaction_service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.reactive.function.client.ClientRequest;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.WebClient;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class WebClientConfig {

    @Value("${account.service.url}")
    private String accountServiceUrl;

    @Bean
    public WebClient accountWebClient() {
        return WebClient.builder()
                .baseUrl(accountServiceUrl)
                .filter(addBearerTokenFilter())
                .build();
    }

    private ExchangeFilterFunction addBearerTokenFilter() {
        return (request, next) -> {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest httpServletRequest = attributes.getRequest();
                String authHeader = httpServletRequest.getHeader(HttpHeaders.AUTHORIZATION);
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    ClientRequest clientRequest = ClientRequest.from(request)
                            .header(HttpHeaders.AUTHORIZATION, authHeader)
                            .build();
                    return next.exchange(clientRequest);
                }
            }
            return next.exchange(request);
        };
    }
}
