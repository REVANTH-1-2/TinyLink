package com.tinylink.controller;

import com.tinylink.dto.UrlCacheDto;
import com.tinylink.service.AnalyticsService;
import com.tinylink.service.UrlService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Set;

@RestController
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Redirect Manager", description = "Resolves redirection logic from short link root requests")
public class RedirectController {

    private final UrlService urlService;
    private final AnalyticsService analyticsService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    // Set of reserved keywords that should not be interpreted as short codes
    private static final Set<String> RESERVED_KEYWORDS = Set.of(
            "api", "swagger-ui", "swagger-ui.html", "v3", "error", "favicon.ico", "index.html", "static"
    );

    @GetMapping("/{shortCode}")
    @Operation(summary = "Resolve shortened URL code and redirect to destination")
    public ResponseEntity<Void> redirect(
            @PathVariable String shortCode,
            HttpServletRequest request) {

        if (RESERVED_KEYWORDS.contains(shortCode.toLowerCase())) {
            log.debug("Ignoring reserved keyword path: {}", shortCode);
            return ResponseEntity.notFound().build();
        }

        try {
            // Get URL metadata from cache / database
            UrlCacheDto urlCache = urlService.getUrlForRedirect(shortCode);

            // Validation: enabled check
            if (!urlCache.isEnabled()) {
                log.info("Redirect failed: Code '{}' is disabled", shortCode);
                return ResponseEntity.status(HttpStatus.FOUND)
                        .header("Location", frontendUrl + "/disabled")
                        .build();
            }

            // Validation: expiration check
            if (urlCache.getExpirationDate() != null && urlCache.getExpirationDate().isBefore(LocalDateTime.now())) {
                log.info("Redirect failed: Code '{}' has expired", shortCode);
                return ResponseEntity.status(HttpStatus.FOUND)
                        .header("Location", frontendUrl + "/expired")
                        .build();
            }

            // Validation: password protection check
            if (urlCache.getPasswordHash() != null && !urlCache.getPasswordHash().isEmpty()) {
                log.info("Redirect: Code '{}' is password-protected, directing to entry portal", shortCode);
                return ResponseEntity.status(HttpStatus.FOUND)
                        .header("Location", frontendUrl + "/p/" + shortCode)
                        .build();
            }

            // Client analytics gathering
            String ipAddress = getClientIp(request);
            String userAgent = request.getHeader("User-Agent");
            String referrer = request.getHeader("Referer");
            String countryHeader = request.getHeader("CF-IPCountry"); // Cloudflare GeoIP Header support

            // Async tracking
            analyticsService.trackClick(urlCache, ipAddress, userAgent, referrer, countryHeader);

            // HTTP 302 Found Redirection
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", urlCache.getOriginalUrl())
                    .build();

        } catch (Exception e) {
            log.error("Redirection failure for code '{}': {}", shortCode, e.getMessage());
            // Fallback: send user to frontend home/not-found page
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", frontendUrl + "/not-found")
                    .build();
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("CF-Connecting-IP"); // Cloudflare
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Forwarded-For");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        
        // Handle comma-separated list of IPs in case of multiple proxies
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
