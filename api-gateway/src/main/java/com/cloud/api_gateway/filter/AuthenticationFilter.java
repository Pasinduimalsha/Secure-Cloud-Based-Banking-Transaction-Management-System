package com.cloud.api_gateway.filter;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.function.HandlerFilterFunction;
import org.springframework.web.servlet.function.ServerRequest;
import org.springframework.web.servlet.function.ServerResponse;

@Component
public class AuthenticationFilter implements HandlerFilterFunction<ServerResponse, ServerResponse> {

    @Override
    public ServerResponse filter(ServerRequest request, org.springframework.web.servlet.function.HandlerFunction<ServerResponse> next) throws Exception {
        // TODO: In the future, extract JWT token from request.headers()
        // Validate the token and route or reject.
        
        // For now, act as a generic pass-through.
        return next.handle(request);
    }
}
