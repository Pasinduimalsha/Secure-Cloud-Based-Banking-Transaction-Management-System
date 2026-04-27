package com.cloud.auth_service.service;

import com.cloud.auth_service.dto.JwtAuthenticationResponse;
import com.cloud.auth_service.dto.SignInRequest;
import com.cloud.auth_service.dto.SignUpRequest;
import com.cloud.auth_service.entity.User;

public interface AuthenticationService {
    User signup(SignUpRequest request);
    JwtAuthenticationResponse signin(SignInRequest request);
}
