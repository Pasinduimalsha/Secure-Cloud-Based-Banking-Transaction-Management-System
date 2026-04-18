package com.cloud.api_gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.stereotype.Component;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            // TODO: In the future, extract JWT token from exchange.getRequest().getHeaders()
            // Validate the token and route or reject.
            
            // For now, act as a generic pass-through.
            return chain.filter(exchange);
        };
    }

    public static class Config {
        // Put configuration properties here
    }
}
