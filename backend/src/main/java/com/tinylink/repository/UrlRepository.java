package com.tinylink.repository;

import com.tinylink.entity.Url;
import com.tinylink.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UrlRepository extends JpaRepository<Url, Long> {
    Optional<Url> findByShortCode(String shortCode);
    Optional<Url> findByCustomAlias(String customAlias);
    
    @Query("SELECT u FROM Url u WHERE u.shortCode = :code OR u.customAlias = :code")
    Optional<Url> findByShortCodeOrCustomAlias(@Param("code") String code);

    Page<Url> findByUser(User user, Pageable pageable);

    @Query("SELECT u FROM Url u WHERE u.user = :user AND " +
           "(LOWER(u.originalUrl) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.shortCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.customAlias) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Url> searchUrls(@Param("user") User user, @Param("search") String search, Pageable pageable);

    @Query("SELECT SUM(u.clickCount) FROM Url u WHERE u.user = :user")
    Long countTotalClicksByUser(@Param("user") User user);

    Long countByUser(User user);

    Optional<Url> findFirstByUserOrderByClickCountDesc(User user);
}
