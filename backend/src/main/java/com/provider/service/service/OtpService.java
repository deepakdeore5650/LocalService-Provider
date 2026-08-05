package com.provider.service.service;

import com.provider.service.entity.OtpEntity;
import com.provider.service.repository.OtpRepository;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);

    private final OtpRepository otpRepository;
    private final EmailService emailService;

    public OtpService(OtpRepository otpRepository, EmailService emailService) {
        this.otpRepository = otpRepository;
        this.emailService = emailService;
    }

    public void generateAndSendOtp(String toEmail, String toName, String purpose) {
        log.info("OTP GENERATION STARTED for purpose: {}", purpose);
        String otp = String.format("%06d", new Random().nextInt(999999));
        
        OtpEntity otpEntity = new OtpEntity();
        otpEntity.setEmail(toEmail);
        otpEntity.setOtp(otp);
        otpEntity.setPurpose(purpose);
        otpEntity.setExpiryTime(LocalDateTime.now().plusMinutes(5));
        
        otpRepository.save(otpEntity);
        
        String subject = "";
        String htmlContent = "";
        
        if ("REGISTER".equals(purpose)) {
            if ("Admin".equalsIgnoreCase(toName)) {
                subject = "Admin Registration Approval Required";
                htmlContent = getAdminRegistrationTemplate(otp);
            } else {
                subject = "Verify your Provider Registration";
                htmlContent = getProviderRegistrationTemplate(otp);
            }
        } else if ("DELETE_ADMIN".equals(purpose)) {
            subject = "Admin Deletion Verification";
            htmlContent = getAdminDeleteTemplate(otp);
        }
        
        log.info("OTP GENERATED successfully for purpose: {}", purpose);
        emailService.sendEmail(toEmail, toName, subject, htmlContent);
    }
    
    public boolean verifyOtp(String email, String otp, String purpose) {
        Optional<OtpEntity> otpOpt = otpRepository.findByEmailAndOtpAndPurposeAndUsedFalse(email, otp, purpose);
        if (otpOpt.isPresent()) {
            OtpEntity entity = otpOpt.get();
            if (entity.getExpiryTime().isAfter(LocalDateTime.now())) {
                entity.setUsed(true);
                otpRepository.save(entity);
                return true;
            }
        }
        return false;
    }

    private String getProviderRegistrationTemplate(String otp) {
        return "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>" +
               "<h2 style='color: #4CAF50; text-align: center;'>Local Service Provider</h2>" +
               "<p>Hello,</p>" +
               "<p>Thank you for registering as a Provider.</p>" +
               "<p>Your verification code is:</p>" +
               "<div style='background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; color: #333; margin: 20px 0;'>" + otp + "</div>" +
               "<p style='color: #d9534f; font-size: 14px;'>This OTP expires in 5 minutes.</p>" +
               "<p style='font-size: 14px; color: #777;'>If you did not request this registration, please ignore this email.</p>" +
               "<br/><p>Regards,<br/>Local Service Provider Team</p>" +
               "</div>";
    }

    private String getAdminRegistrationTemplate(String otp) {
        return "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>" +
               "<h2 style='color: #2196F3; text-align: center;'>Local Service Provider</h2>" +
               "<p>An Admin registration request has been received.</p>" +
               "<p>OTP for approval:</p>" +
               "<div style='background-color: #e3f2fd; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; color: #0d47a1; margin: 20px 0;'>" + otp + "</div>" +
               "<p style='color: #d9534f; font-size: 14px;'>This OTP expires in 5 minutes.</p>" +
               "<p style='font-size: 14px; color: #777;'>Only share this OTP if you approve the registration.</p>" +
               "<br/><p>Regards,<br/>Local Service Provider Team</p>" +
               "</div>";
    }

    private String getAdminDeleteTemplate(String otp) {
        return "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>" +
               "<h2 style='color: #F44336; text-align: center;'>Local Service Provider</h2>" +
               "<p>An admin deletion request has been initiated.</p>" +
               "<p>OTP for confirmation:</p>" +
               "<div style='background-color: #ffebee; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; color: #b71c1c; margin: 20px 0;'>" + otp + "</div>" +
               "<p style='color: #d9534f; font-size: 14px;'>This OTP expires in 5 minutes.</p>" +
               "<p style='font-size: 14px; color: #777;'>If you did not perform this action, ignore this email.</p>" +
               "<br/><p>Regards,<br/>Local Service Provider Team</p>" +
               "</div>";
    }
}
