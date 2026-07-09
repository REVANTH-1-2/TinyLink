package com.tinylink.controller;

import com.tinylink.dto.AnalyticsDetailResponse;
import com.tinylink.dto.AnalyticsSummaryResponse;
import com.tinylink.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Endpoints for retrieving URL click analytics and dashboard summaries")
@SecurityRequirement(name = "bearerAuth")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get aggregated analytics metrics for the dashboard")
    public ResponseEntity<AnalyticsSummaryResponse> getAnalyticsDashboard() {
        AnalyticsSummaryResponse summary = analyticsService.getAnalyticsSummary();
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get click analytics detail list for a specific URL ID")
    public ResponseEntity<List<AnalyticsDetailResponse>> getUrlAnalytics(@PathVariable Long id) {
        List<AnalyticsDetailResponse> detailList = analyticsService.getUrlAnalytics(id);
        return ResponseEntity.ok(detailList);
    }
}
