package com.provider.service.controller;

import com.provider.service.entity.ReviewEntity;
import com.provider.service.entity.UserEntity;
import com.provider.service.repository.ReviewRepository;
import com.provider.service.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/providers")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    public ReviewController(ReviewRepository reviewRepository, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
    }

    // DTO for response
    private Map<String, Object> toDto(ReviewEntity r) {
        return Map.of(
                "id", r.getId(),
                "rating", r.getRating(),
                "comment", r.getComment(),
                "createdAt", r.getCreatedAt(),
                "user", Map.of("id", r.getUser().getId(), "name", r.getUser().getName())
        );
    }

    @GetMapping("/{providerId}/reviews")
    public ResponseEntity<?> listReviews(@PathVariable Long providerId) {
        try {
            List<ReviewEntity> reviews = reviewRepository.findByProvider_IdOrderByCreatedAtDesc(providerId);
            List<Map<String, Object>> data = reviews.stream().map(this::toDto).collect(Collectors.toList());
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch reviews"));
        }
    }

    @GetMapping("/{providerId}/rating")
    public ResponseEntity<?> getRating(@PathVariable Long providerId) {
        try {
            Double avg = reviewRepository.findAverageRatingByProviderId(providerId);
            Long count = reviewRepository.countByProviderId(providerId);
            if (avg == null) avg = 0.0;
            return ResponseEntity.ok(Map.of("average", Math.round(avg * 10.0) / 10.0, "count", count));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch rating"));
        }
    }

    @PostMapping("/{providerId}/reviews")
    public ResponseEntity<?> addReview(@PathVariable Long providerId, @RequestBody Map<String, Object> payload) {
        try {

            // Prefer the authenticated user when available
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long userIdFromPayload = payload.get("userId") == null ? null : Long.valueOf(String.valueOf(payload.get("userId")));
            Integer rating = payload.get("rating") == null ? null : Integer.valueOf(String.valueOf(payload.get("rating")));
            String comment = payload.get("comment") == null ? "" : String.valueOf(payload.get("comment"));

            Long reviewerId = null;
            if (auth != null && auth.getName() != null && !"anonymousUser".equals(auth.getName())) {
                // auth name is email in our app; find user by email
                UserEntity authUser = userRepository.findByEmail(auth.getName()).orElse(null);
                if (authUser != null) reviewerId = authUser.getId();
            }
            if (reviewerId == null) reviewerId = userIdFromPayload; // fallback to payload

            if (reviewerId == null || rating == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "userId (or authenticated user) and rating are required"));
            }

            UserEntity provider = userRepository.findById(providerId).orElse(null);
            UserEntity user = userRepository.findById(reviewerId).orElse(null);

            if (provider == null || !"PROVIDER".equals(provider.getRole())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Provider not found"));
            }
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            // Prevent duplicate reviews by same user for same provider
            if (reviewRepository.existsByProvider_IdAndUser_Id(providerId, reviewerId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "You have already reviewed this provider"));
            }

            ReviewEntity r = new ReviewEntity();
            r.setProvider(provider);
            r.setUser(user);
            r.setRating(Math.max(1, Math.min(5, rating)));
            r.setComment(comment);

            ReviewEntity saved = reviewRepository.save(r);
            return ResponseEntity.ok(Map.of("id", saved.getId()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to save review"));
        }
    }
}
