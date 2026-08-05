package com.provider.service.controller;

import com.provider.service.dto.UserDto;
import com.provider.service.entity.UserEntity;
import com.provider.service.entity.BookingEntity;
import com.provider.service.repository.UserRepository;
import com.provider.service.repository.BookingRepository;
import com.provider.service.service.OtpService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final OtpService otpService;

    public AdminController(UserRepository userRepository, BookingRepository bookingRepository, OtpService otpService) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.otpService = otpService;
    }

    private UserDto toDto(UserEntity e) {
        UserDto d = new UserDto();
        d.setId(e.getId());
        d.setName(e.getName());
        d.setEmail(e.getEmail());
        d.setRole(e.getRole());
        d.setServiceType(e.getServiceType());
        d.setPincode(e.getPincode());
        d.setAddress(e.getAddress());
        d.setState(e.getState());
        d.setDistrict(e.getDistrict());
        d.setPhoneNo(e.getPhoneNo());
        d.setStatus(e.getStatus());
        d.setStatus1(e.getStatus1());
        d.setCreatedDate(e.getCreatedDate());
        return d;
    }

    @GetMapping("/providers/pending")
    public ResponseEntity<?> getPendingProviders() {
        try {
            List<UserDto> pendingProviders = userRepository.findByRoleAndStatus("PROVIDER", "pending")
                    .stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(pendingProviders);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch pending providers"));
        }
    }

    @PostMapping("/providers/{id}/verify")
    public ResponseEntity<?> verifyProvider(@PathVariable Long id) {
        try {
            if (id == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Provider ID is required"));
            }

            return userRepository.findById(id)
                    .map(provider -> {
                        if (!"PROVIDER".equals(provider.getRole())) {
                            return ResponseEntity.badRequest().body(Map.of("error", "User is not a provider"));
                        }
                        provider.setStatus("active");
                        provider.setStatus1("verified");
                        UserEntity saved = userRepository.save(provider);
                        return ResponseEntity.ok(toDto(saved));
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to verify provider"));
        }
    }

    @PostMapping("/users/{id}/status")
    public ResponseEntity<?> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        try {
            String status = payload.get("status");
            if (status == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
            }

            return userRepository.findById(id)
                    .map(user -> {
                        if ("ADMIN".equals(user.getRole())) {
                            return ResponseEntity.badRequest().body(Map.of("error", "Cannot update admin status"));
                        }
                        user.setStatus(status);
                        UserEntity saved = userRepository.save(user);
                        return ResponseEntity.ok(toDto(saved));
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to update status"));
        }
    }

    @PostMapping("/users/{id}/status1")
    public ResponseEntity<?> updateUserStatus1(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        try {
            String status1 = payload.get("status1");
            if (status1 == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Status1 is required"));
            }

            return userRepository.findById(id)
                    .map(user -> {
                        if ("ADMIN".equals(user.getRole())) {
                            return ResponseEntity.badRequest().body(Map.of("error", "Cannot update admin status"));
                        }
                        user.setStatus1(status1);
                        UserEntity saved = userRepository.save(user);
                        return ResponseEntity.ok(toDto(saved));
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to update status1"));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<UserDto> users = userRepository.findAll()
                    .stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch users"));
        }
    }

    @GetMapping("/bookings")
    public ResponseEntity<?> getAllBookings() {
        try {
            List<BookingEntity> bookings = bookingRepository.findAll();
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch bookings"));
        }
    }

    @DeleteMapping("/admins/{id}")
    public ResponseEntity<?> deleteAdmin(@PathVariable Long id, @RequestParam String otp) {
        try {
            if (otp == null || otp.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "OTP is required for deletion"));
            }
            if (!otpService.verifyOtp("deepakdeore750@gmail.com", otp, "DELETE_ADMIN")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired OTP for admin deletion"));
            }

            return userRepository.findById(id).map(user -> {
                if (!"ADMIN".equals(user.getRole())) {
                    return ResponseEntity.badRequest().body(Map.of("error", "User is not an admin"));
                }
                userRepository.delete(user);
                return ResponseEntity.ok(Map.of("message", "Admin deleted successfully"));
            }).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to delete admin"));
        }
    }
}