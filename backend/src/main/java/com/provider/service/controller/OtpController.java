package com.provider.service.controller;

import com.provider.service.service.OtpService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

@RestController
@RequestMapping("/api/otp")
public class OtpController {

    private static final Logger log = LoggerFactory.getLogger(OtpController.class);

    private final OtpService otpService;
    private final String ADMIN_EMAIL = "deepakdeore750@gmail.com";

    public OtpController(OtpService otpService) {
        this.otpService = otpService;
    }

    @PostMapping("/send-registration")
    public ResponseEntity<?> sendRegistrationOtp(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String role = payload.get("role");
        String name = payload.get("name");

        log.info("ADMIN REGISTRATION REQUEST RECEIVED (or PROVIDER). Role: {}", role);

        if (email == null || role == null) {
            return ResponseEntity.badRequest().body("Email and role are required");
        }

        if ("ADMIN".equalsIgnoreCase(role)) {
            otpService.generateAndSendOtp(ADMIN_EMAIL, "Admin", "REGISTER");
            log.info("API SUCCESS: Admin OTP email submitted successfully.");
            return ResponseEntity.ok(Map.of("message", "An OTP has been sent to the Admin (Deepak Deore) for approval."));
        } else if ("PROVIDER".equalsIgnoreCase(role)) {
            otpService.generateAndSendOtp(email, name, "REGISTER");
            log.info("API SUCCESS: Provider OTP email submitted successfully.");
            return ResponseEntity.ok(Map.of("message", "An OTP has been sent to your email."));
        } else {
            log.warn("API ERROR: OTP not required for this role");
            return ResponseEntity.badRequest().body("OTP not required for this role");
        }
    }

    @PostMapping("/send-admin-delete")
    public ResponseEntity<?> sendAdminDeleteOtp(@RequestBody Map<String, String> payload) {
        // Generates OTP for deleting an admin
        otpService.generateAndSendOtp(ADMIN_EMAIL, "Admin", "DELETE_ADMIN");
        return ResponseEntity.ok(Map.of("message", "OTP has been sent to Admin (Deepak Deore) for confirmation."));
    }

    @ExceptionHandler({IllegalStateException.class, RuntimeException.class})
    public ResponseEntity<?> handleEmailErrors(Exception ex) {
        log.error("API ERROR: OTP email submission failure. Reason: {}", ex.getMessage());
        return ResponseEntity.status(500).body(Map.of("message", ex.getMessage()));
    }
}
