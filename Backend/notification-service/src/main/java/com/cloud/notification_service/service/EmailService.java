package com.cloud.notification_service.service;

import com.cloud.notification_service.dto.MailtrapRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final RestTemplate restTemplate;

    @Value("${mailtrap.api.token}")
    private String apiToken;

    @Value("${mailtrap.api.url:https://send.api.mailtrap.io/api/send}")
    private String apiUrl;

    @Value("${mailtrap.from.email}")
    private String fromEmail;

    @Value("${mailtrap.from.name:SecureBank}")
    private String fromName;

    public void sendEmail(String to, String subject, String body) {
        log.info("📧 Sending email to {} via Mailtrap API", to);
        try {
            MailtrapRequest request = MailtrapRequest.builder()
                    .from(MailtrapRequest.From.builder()
                            .email(fromEmail)
                            .name(fromName)
                            .build())
                    .to(Collections.singletonList(MailtrapRequest.To.builder()
                            .email(to)
                            .build()))
                    .subject(subject)
                    .text(body)
                    .category("Transaction Notification")
                    .build();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiToken);

            HttpEntity<MailtrapRequest> entity = new HttpEntity<>(request, headers);

            restTemplate.postForEntity(apiUrl, entity, String.class);
            
            log.info("✅ Email sent successfully to {} via Mailtrap API", to);
        } catch (Exception e) {
            log.error("❌ Failed to send email to {} via Mailtrap API: {}", to, e.getMessage());
        }
    }
}
