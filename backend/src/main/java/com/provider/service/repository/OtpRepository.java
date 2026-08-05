package com.provider.service.repository;

import com.provider.service.entity.OtpEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<OtpEntity, Long> {
    Optional<OtpEntity> findByEmailAndOtpAndPurposeAndUsedFalse(String email, String otp, String purpose);
}
