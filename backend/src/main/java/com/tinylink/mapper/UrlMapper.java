package com.tinylink.mapper;

import com.tinylink.dto.AnalyticsDetailResponse;
import com.tinylink.dto.UserDto;
import com.tinylink.dto.UrlResponse;
import com.tinylink.entity.Analytics;
import com.tinylink.entity.User;
import com.tinylink.entity.Url;
import org.springframework.stereotype.Component;

@Component
public class UrlMapper {

    public UserDto toDto(User user) {
        if (user == null) {
            return null;
        }
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }

    public UrlResponse toResponse(Url url, String qrCodeBase64) {
        if (url == null) {
            return null;
        }
        return UrlResponse.builder()
                .id(url.getId())
                .originalUrl(url.getOriginalUrl())
                .shortCode(url.getShortCode())
                .customAlias(url.getCustomAlias())
                .title(url.getTitle())
                .description(url.getDescription())
                .isEnabled(url.isEnabled())
                .isOneTimeUse(url.isOneTimeUse())
                .clickCount(url.getClickCount())
                .qrCode(qrCodeBase64)
                .expirationDate(url.getExpirationDate())
                .isPasswordProtected(url.getPasswordHash() != null && !url.getPasswordHash().isEmpty())
                .createdAt(url.getCreatedAt())
                .build();
    }

    public AnalyticsDetailResponse toResponse(Analytics analytics) {
        if (analytics == null) {
            return null;
        }
        return AnalyticsDetailResponse.builder()
                .id(analytics.getId())
                .clickTimestamp(analytics.getClickTimestamp())
                .ipHash(analytics.getIpHash())
                .country(analytics.getCountry())
                .browser(analytics.getBrowser())
                .operatingSystem(analytics.getOperatingSystem())
                .deviceType(analytics.getDeviceType())
                .referrer(analytics.getReferrer())
                .build();
    }
}
