package com.tinylink.repository;

import com.tinylink.entity.Analytics;
import com.tinylink.entity.Url;
import com.tinylink.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnalyticsRepository extends JpaRepository<Analytics, Long> {
    
    @Query("SELECT a FROM Analytics a WHERE a.url = :url ORDER BY a.clickTimestamp DESC")
    List<Analytics> findAllByUrl(@Param("url") Url url);

    @Query("SELECT a FROM Analytics a WHERE a.url.user = :user ORDER BY a.clickTimestamp DESC")
    List<Analytics> findAllByUser(@Param("user") User user);

    @Query("SELECT a FROM Analytics a WHERE a.url.id = :urlId ORDER BY a.clickTimestamp DESC")
    List<Analytics> findAllByUrlId(@Param("urlId") Long urlId);
}
