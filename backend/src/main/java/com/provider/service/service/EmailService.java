package com.provider.service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Value("${brevo.api.key}")
    private String apiKey;

    @Value("${brevo.sender.email:deepakdeore5650@gmail.com}")
    private String senderEmail;

    private final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
    private final RestTemplate restTemplate = new RestTemplate();

    public void sendEmail(String toEmail, String toName, String subject, String htmlContent) {
        String maskedEmail = toEmail != null ? toEmail.replaceAll("(?<=.{2}).(?=.*@)", "*") : "unknown";
        log.info("EMAIL SEND STARTED: Attempting to send OTP email to {}", maskedEmail);

        boolean isKeyConfigured = apiKey != null && !apiKey.isBlank() && !"YOUR_BREVO_API_KEY_HERE".equals(apiKey) && !"your_brevo_api_key_here".equals(apiKey);
        log.info("BREVO_API_KEY CONFIGURED: {}", isKeyConfigured);

        if (!isKeyConfigured) {
            log.error("EMAIL FAILED: BREVO_API_KEY is not set or is default.");
            throw new IllegalStateException("Email service is not properly configured. Please set a valid BREVO_API_KEY.");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.set("api-key", apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        Map<String, Object> body = Map.of(
                "sender", Map.of("name", "Local Service Provider", "email", senderEmail),
                "to", List.of(Map.of("email", toEmail, "name", toName == null ? "" : toName)),
                "subject", subject,
                "htmlContent", htmlContent
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            log.info("BREVO REQUEST SENT: Sending transactional email request to Brevo");
            ResponseEntity<String> response = restTemplate.postForEntity(BREVO_API_URL, entity, String.class);
            log.info("BREVO RESPONSE RECEIVED. Status: {}", response.getStatusCode());

            if (!response.getStatusCode().is2xxSuccessful()) {
                log.error("EMAIL FAILED: Brevo email request failed. Status: {}", response.getStatusCode());
                throw new RuntimeException("Failed to send OTP email. Please try again later.");
            }
            log.info("EMAIL ACCEPTED: Brevo email request accepted successfully.");
        } catch (org.springframework.web.client.RestClientResponseException e) {
            log.error("EMAIL FAILED: Brevo API error. Status: {}, reason: {}", e.getRawStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Failed to send OTP email. Please check email configuration.");
        } catch (Exception e) {
            log.error("EMAIL FAILED: Unexpected error sending email: {}", e.getMessage(), e);
            throw new RuntimeException("An unexpected error occurred while sending OTP.");
        }
    }
}
