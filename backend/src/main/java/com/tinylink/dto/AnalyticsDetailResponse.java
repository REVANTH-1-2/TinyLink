package com.tinylink.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsDetailResponse {
    private Long id;
    private LocalDateTime clickTimestamp;
    private String ipHash;
    private String country;
    private String browser;
    private String operatingSystem;
    private String deviceType;
    private String referrer;
}
