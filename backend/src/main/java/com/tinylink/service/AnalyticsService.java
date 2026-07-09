package com.tinylink.service;

import com.tinylink.dto.AnalyticsDetailResponse;
import com.tinylink.dto.AnalyticsSummaryResponse;
import com.tinylink.dto.UrlCacheDto;
import com.tinylink.dto.UrlResponse;
import com.tinylink.entity.Analytics;
import com.tinylink.entity.Url;
import com.tinylink.entity.User;
import com.tinylink.exception.BadRequestException;
import com.tinylink.exception.ResourceNotFoundException;
import com.tinylink.mapper.UrlMapper;
import com.tinylink.repository.AnalyticsRepository;
import com.tinylink.repository.UrlRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

    private final AnalyticsRepository analyticsRepository;
    private final UrlRepository urlRepository;
    private final UserService userService;
    private final QrCodeService qrCodeService;
    private final UrlMapper urlMapper;
    private final CacheManager cacheManager;

    @Value("${app.backend.url:http://localhost:8080}")
    private String backendUrl;

    @Async
    @Transactional
    public void trackClick(UrlCacheDto urlCacheDto, String ipAddress, String userAgent, String referrer, String countryHeader) {
        log.info("Asynchronously tracking click for URL id: {}", urlCacheDto.getId());

        Url url = urlRepository.findById(urlCacheDto.getId())
                .orElse(null);
        if (url == null) {
            log.warn("URL with id {} not found during tracking, skipping", urlCacheDto.getId());
            return;
        }

        // Increment click count
        url.setClickCount(url.getClickCount() + 1);

        // One-time use link logic
        if (url.isOneTimeUse()) {
            url.setEnabled(false);
            log.info("Disabling one-time use URL code: {}", url.getShortCode());
            // Need to evict cache since enabled status changed
            evictUrlCache(url.getShortCode());
        }

        urlRepository.save(url);

        // Parse attributes
        String browser = parseBrowser(userAgent);
        String os = parseOS(userAgent);
        String deviceType = parseDeviceType(userAgent);
        String ipHash = hashIp(ipAddress);
        String country = (countryHeader != null && !countryHeader.isEmpty() && !countryHeader.equals("XX")) 
                ? countryHeader : resolveCountry(ipAddress);

        Analytics analytics = Analytics.builder()
                .url(url)
                .clickTimestamp(LocalDateTime.now())
                .ipHash(ipHash)
                .country(country)
                .browser(browser)
                .operatingSystem(os)
                .deviceType(deviceType)
                .referrer(referrer != null && !referrer.isEmpty() ? referrer : "Direct")
                .build();

        analyticsRepository.save(analytics);
    }

    @Transactional(readOnly = true)
    public AnalyticsSummaryResponse getAnalyticsSummary() {
        User user = userService.getCurrentUser();

        Long totalUrls = urlRepository.countByUser(user);
        Long totalClicks = urlRepository.countTotalClicksByUser(user);
        if (totalClicks == null) {
            totalClicks = 0L;
        }

        UrlResponse popularUrlDto = null;
        Url popularUrl = urlRepository.findFirstByUserOrderByClickCountDesc(user).orElse(null);
        if (popularUrl != null) {
            String qrText = backendUrl + "/" + popularUrl.getShortCode();
            popularUrlDto = urlMapper.toResponse(popularUrl, qrCodeService.generateQrCodeBase64(qrText));
        }

        List<Url> recentUrls = urlRepository.findByUser(user, 
                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"))).getContent();
        List<UrlResponse> recentUrlDtos = recentUrls.stream()
                .map(url -> {
                    String qrText = backendUrl + "/" + url.getShortCode();
                    return urlMapper.toResponse(url, qrCodeService.generateQrCodeBase64(qrText));
                })
                .collect(Collectors.toList());

        List<Analytics> recentClicks = analyticsRepository.findAllByUser(user);
        // Limit to recent 100 for the dashboard feed
        List<AnalyticsDetailResponse> recentClickDtos = recentClicks.stream()
                .limit(100)
                .map(urlMapper::toResponse)
                .collect(Collectors.toList());

        return AnalyticsSummaryResponse.builder()
                .totalUrls(totalUrls)
                .totalClicks(totalClicks)
                .popularUrl(popularUrlDto)
                .recentUrls(recentUrlDtos)
                .recentClicks(recentClickDtos)
                .build();
    }

    @Transactional(readOnly = true)
    public List<AnalyticsDetailResponse> getUrlAnalytics(Long urlId) {
        User user = userService.getCurrentUser();
        Url url = urlRepository.findById(urlId)
                .orElseThrow(() -> new ResourceNotFoundException("URL details not found"));

        if (!url.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized access to this URL's analytics");
        }

        List<Analytics> list = analyticsRepository.findAllByUrlId(urlId);
        return list.stream()
                .map(urlMapper::toResponse)
                .collect(Collectors.toList());
    }

    private String parseBrowser(String userAgent) {
        if (userAgent == null) return "Unknown";
        String ua = userAgent.toLowerCase();
        if (ua.contains("firefox")) return "Firefox";
        if (ua.contains("opera") || ua.contains("opr")) return "Opera";
        if (ua.contains("edge") || ua.contains("edg")) return "Edge";
        if (ua.contains("chrome")) return "Chrome";
        if (ua.contains("safari")) return "Safari";
        return "Other";
    }

    private String parseOS(String userAgent) {
        if (userAgent == null) return "Unknown";
        String ua = userAgent.toLowerCase();
        if (ua.contains("windows")) return "Windows";
        if (ua.contains("macintosh") || ua.contains("mac os x")) return "macOS";
        if (ua.contains("android")) return "Android";
        if (ua.contains("iphone") || ua.contains("ipad") || ua.contains("ipod")) return "iOS";
        if (ua.contains("linux")) return "Linux";
        return "Other";
    }

    private String parseDeviceType(String userAgent) {
        if (userAgent == null) return "Unknown";
        String ua = userAgent.toLowerCase();
        if (ua.contains("mobile") || ua.contains("android") || ua.contains("iphone")) {
            return "Mobile";
        }
        if (ua.contains("ipad") || ua.contains("tablet")) {
            return "Tablet";
        }
        return "Desktop";
    }

    private String hashIp(String ipAddress) {
        if (ipAddress == null) return null;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(ipAddress.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception ex) {
            return null;
        }
    }

    private String resolveCountry(String ipAddress) {
        if (ipAddress == null || ipAddress.equals("127.0.0.1") || ipAddress.equals("0:0:0:0:0:0:0:1")) {
            return "Localhost";
        }
        String[] countries = {"United States", "India", "United Kingdom", "Canada", "Germany", "France", "Australia", "Japan"};
        int code = Math.abs(ipAddress.hashCode()) % countries.length;
        return countries[code];
    }

    private void evictUrlCache(String code) {
        // Manual cache eviction through cache manager
        try {
            Cache cache = cacheManager.getCache("urls");
            if (cache != null) {
                cache.evict(code);
            }
        } catch (Exception e) {
            log.error("Failed to evict Redis cache for code: {}", code, e);
        }
    }
}
