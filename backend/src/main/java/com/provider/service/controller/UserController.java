package com.provider.service.controller;

import com.provider.service.dto.UserDto;
import com.provider.service.dto.UserRegistrationRequest;
import com.provider.service.entity.UserEntity;
import com.provider.service.entity.ServiceEntity;
import com.provider.service.repository.ServiceRepository;
import com.provider.service.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.provider.service.service.OtpService;
import com.provider.service.config.JwtUtil;

import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ServiceRepository serviceRepository;
    private final OtpService otpService;
    private final JwtUtil jwtUtil;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder, ServiceRepository serviceRepository, OtpService otpService, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.serviceRepository = serviceRepository;
        this.otpService = otpService;
        this.jwtUtil = jwtUtil;
    }

    private UserDto toDto(UserEntity e) {
        UserDto d = new UserDto();
        d.setId(e.getId());
        d.setName(e.getName());
        d.setEmail(e.getEmail());
        d.setRole("ADMIN");
        // d.setRole(e.getRole());
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

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserRegistrationRequest req) {
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered");
        }

        String role = req.getRole() == null ? "USER" : req.getRole().toUpperCase();
        if ("PROVIDER".equals(role)) {
            if (req.getOtp() == null || !otpService.verifyOtp(req.getEmail(), req.getOtp(), "REGISTER")) {
                return ResponseEntity.badRequest().body("Invalid or expired OTP");
            }
        } else if ("ADMIN".equals(role)) {
            // Hardcoded admin email for verification
            if (req.getOtp() == null || !otpService.verifyOtp("deepakdeore750@gmail.com", req.getOtp(), "REGISTER")) {
                return ResponseEntity.badRequest().body("Invalid or expired OTP for Admin approval");
            }
        }
        UserEntity user = new UserEntity();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole(role);
        user.setStatus("PROVIDER".equals(role) ? "pending" : "active");
        user.setStatus1("PROVIDER".equals(role) ? "pending" : null);
        user.setServiceType(req.getServiceType());
        user.setPincode(req.getPincode());
        user.setAddress(req.getAddress());
        user.setState(req.getState());
        user.setDistrict(req.getDistrict());
        user.setPhoneNo(req.getPhoneNo());

        UserEntity saved = userRepository.save(user);

        // If provider, create the associated service entry
        if ("PROVIDER".equalsIgnoreCase(saved.getRole()) && req.getServiceName() != null && !req.getServiceName().isBlank()) {
            ServiceEntity svc = new ServiceEntity();
            svc.setServiceName(req.getServiceName());
            svc.setDescription(req.getServiceDescription());
            svc.setPricingPerHour(req.getPricingPerHour() == null ? 0.0 : req.getPricingPerHour());
            svc.setStatus(req.getServiceStatus() == null ? "AVAILABLE" : req.getServiceStatus());
            svc.setProvider(saved);
            serviceRepository.save(svc);
        }
        UserDto responseDto = toDto(saved);
        String token = jwtUtil.generateToken(saved.getEmail(), saved.getRole());
        responseDto.setToken(token);
        
        return ResponseEntity.ok(responseDto);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserRegistrationRequest login) {
        Optional<UserEntity> u = userRepository.findByEmail(login.getEmail());
        if (!u.isPresent() || !passwordEncoder.matches(login.getPassword(), u.get().getPassword())) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
        
        UserEntity user = u.get();
        if ("PROVIDER".equals(user.getRole()) && !"active".equals(user.getStatus())) {
            return ResponseEntity.status(403).body("Provider account not yet approved or has been deactivated");
        }
        if ("USER".equals(user.getRole()) && "inactive".equals(user.getStatus())) {
            return ResponseEntity.status(403).body("Account has been deactivated");
        }
        UserDto responseDto = toDto(user);
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        responseDto.setToken(token);
        
        return ResponseEntity.ok(responseDto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProfile(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(u -> ResponseEntity.ok(toDto(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editProfile(@PathVariable Long id, @RequestBody UserRegistrationRequest updated) {
        return userRepository.findById(id).map(u -> {
            // allow email update if not taken
            if (updated.getEmail() != null && !updated.getEmail().isBlank() && !updated.getEmail().equals(u.getEmail())) {
                if (userRepository.findByEmail(updated.getEmail()).isPresent()) {
                    return ResponseEntity.badRequest().body("Email already in use");
                }
                u.setEmail(updated.getEmail());
            }
            u.setName(updated.getName());
            u.setAddress(updated.getAddress());
            u.setDistrict(updated.getDistrict());
            u.setState(updated.getState());
            u.setPincode(updated.getPincode());
            u.setPhoneNo(updated.getPhoneNo());
            UserEntity saved = userRepository.save(u);
            return ResponseEntity.ok(toDto(saved));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");
        if (oldPassword == null || newPassword == null) return ResponseEntity.badRequest().body("oldPassword and newPassword required");
        return userRepository.findById(id).map(u -> {
            if (!passwordEncoder.matches(oldPassword, u.getPassword())) {
                return ResponseEntity.status(403).body("Old password does not match");
            }
            u.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(u);
            return ResponseEntity.ok("Password changed");
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("")
    public ResponseEntity<?> listAllUsers() {
        return ResponseEntity.ok(userRepository.findAll().stream().map(this::toDto).toList());
    }
}
