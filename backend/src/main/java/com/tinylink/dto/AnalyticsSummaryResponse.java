package com.tinylink.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsSummaryResponse {
    private Long totalUrls;
    private Long totalClicks;
    private UrlResponse popularUrl;
    private List<UrlResponse> recentUrls;
    private List<AnalyticsDetailResponse> recentClicks;
}
