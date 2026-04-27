package com.cloud.auth_service.config;

import com.cloud.auth_service.entity.Role;
import com.cloud.auth_service.entity.User;
import com.cloud.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            // Seed Admin
            User admin = User.builder()
                    .email("admin@cloud.com")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);

            // Seed Customer
            User customer = User.builder()
                    .email("customer1@cloud.com")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.CUSTOMER)
                    .build();
            userRepository.save(customer);

            System.out.println("Database seeded with default users.");
        }
    }
}
