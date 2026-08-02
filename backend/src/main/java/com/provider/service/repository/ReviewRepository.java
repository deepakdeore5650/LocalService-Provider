package com.provider.service.repository;

import com.provider.service.entity.ReviewEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<ReviewEntity, Long> {
    List<ReviewEntity> findByProvider_IdOrderByCreatedAtDesc(Long providerId);

    @Query("select avg(r.rating) from ReviewEntity r where r.provider.id = :providerId")
    Double findAverageRatingByProviderId(@Param("providerId") Long providerId);

    @Query("select count(r) from ReviewEntity r where r.provider.id = :providerId")
    Long countByProviderId(@Param("providerId") Long providerId);

    boolean existsByProvider_IdAndUser_Id(Long providerId, Long userId);

    Optional<ReviewEntity> findByProvider_IdAndUser_Id(Long providerId, Long userId);
}
