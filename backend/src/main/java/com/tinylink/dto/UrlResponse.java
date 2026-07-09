package com.tinylink.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UrlResponse {
    private Long id;
    private String originalUrl;
    private String shortCode;
    private String customAlias;
    private String title;
    private String description;
    private boolean isEnabled;
    private boolean isOneTimeUse;
    private Long clickCount;
    private String qrCode; // Base64 data URL
    private LocalDateTime expirationDate;
    private boolean isPasswordProtected;
    private LocalDateTime createdAt;
}
