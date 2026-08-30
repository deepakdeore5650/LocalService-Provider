package com.provider.service.controller;

import com.provider.service.entity.ReviewEntity;
import com.provider.service.entity.UserEntity;
import com.provider.service.repository.ReviewRepository;
import com.provider.service.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
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

    // Resolve the logged-in user's id, preferring the security context (when populated)
    // and falling back to an explicitly supplied id, matching the pattern used elsewhere
    // in this app (the app does not issue server-side sessions/JWTs today).
    private Long resolveCurrentUserId(Long suppliedUserId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null && !"anonymousUser".equals(auth.getName())) {
            UserEntity authUser = userRepository.findByEmail(auth.getName()).orElse(null);
            if (authUser != null) return authUser.getId();
        }
        return suppliedUserId;
    }

    // Check whether the logged-in user has already reviewed this provider, and return
    // their existing review if so. Used by the frontend to decide whether to show the
    // review form or a "you already reviewed this provider" message.
    @GetMapping("/{providerId}/reviews/me")
    public ResponseEntity<?> getMyReview(@PathVariable Long providerId, @RequestParam(required = false) Long userId) {
        try {
            // Must be authenticated to check own review
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null || "anonymousUser".equals(auth.getName())) {
                return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
            }
            
            Long reviewerId = resolveCurrentUserId(userId);
            if (reviewerId == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
            }
            Optional<ReviewEntity> existing = reviewRepository.findByProvider_IdAndUser_Id(providerId, reviewerId);
            if (existing.isEmpty()) {
                return ResponseEntity.ok(Map.of("reviewed", false));
            }
            Map<String, Object> body = new java.util.HashMap<>(toDto(existing.get()));
            body.put("reviewed", true);
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to check review status"));
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
            // Require authentication - do NOT accept userId from frontend
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null || "anonymousUser".equals(auth.getName())) {
                return ResponseEntity.status(401).body(Map.of("error", "Authentication required to submit a review"));
            }
            
            Optional<UserEntity> authUserOpt = userRepository.findByEmail(auth.getName());
            if (authUserOpt.isEmpty()) {
                return ResponseEntity.status(401).body(Map.of("error", "Authentication required to submit a review"));
            }
            
            Long reviewerId = authUserOpt.get().getId();
            Integer rating = payload.get("rating") == null ? null : Integer.valueOf(String.valueOf(payload.get("rating")));
            String comment = payload.get("comment") == null ? "" : String.valueOf(payload.get("comment"));

            if (rating == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "rating is required"));
            }

            // Rating must be strictly within 1-5; reject rather than silently clamp.
            if (rating < 1 || rating > 5) {
                return ResponseEntity.badRequest().body(Map.of("error", "Rating must be between 1 and 5"));
            }

            UserEntity provider = userRepository.findById(providerId).orElse(null);
            UserEntity user = userRepository.findById(reviewerId).orElse(null);

            if (provider == null || !"PROVIDER".equals(provider.getRole())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Provider not found"));
            }
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }
            if (reviewerId.equals(providerId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "You cannot review yourself"));
            }

            // Prevent duplicate reviews by same user for same provider
            if (reviewRepository.existsByProvider_IdAndUser_Id(providerId, reviewerId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "You have already reviewed this provider"));
            }

            ReviewEntity r = new ReviewEntity();
            r.setProvider(provider);
            r.setUser(user);
            r.setRating(rating);
            r.setComment(comment);

            ReviewEntity saved = reviewRepository.save(r);
            return ResponseEntity.ok(toDto(saved));
        } catch (DataIntegrityViolationException dup) {
            // Backstop against race conditions: the DB-level unique constraint on
            // (provider_id, user_id) rejects a second concurrent submission.
            return ResponseEntity.badRequest().body(Map.of("error", "You have already reviewed this provider"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to save review"));
        }
    }
}
