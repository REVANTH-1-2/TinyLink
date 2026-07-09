package com.tinylink.service;

import com.tinylink.dto.UrlCacheDto;
import com.tinylink.dto.UrlRequest;
import com.tinylink.dto.UrlResponse;
import com.tinylink.entity.Url;
import com.tinylink.entity.User;
import com.tinylink.exception.BadRequestException;
import com.tinylink.exception.ResourceNotFoundException;
import com.tinylink.mapper.UrlMapper;
import com.tinylink.repository.UrlRepository;
import com.tinylink.util.Base62;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class UrlService {

    private final UrlRepository urlRepository;
    private final UserService userService;
    private final QrCodeService qrCodeService;
    private final UrlMapper urlMapper;
    private final PasswordEncoder passwordEncoder;
    private final CacheManager cacheManager;

    @Value("${app.backend.url:http://localhost:8080}")
    private String backendUrl;

    @Transactional
    public UrlResponse createUrl(UrlRequest request) {
        User user = userService.getCurrentUser();
        String shortCode;

        if (StringUtils.hasText(request.getCustomAlias())) {
            String alias = request.getCustomAlias().trim();
            if (urlRepository.findByShortCodeOrCustomAlias(alias).isPresent()) {
                throw new BadRequestException("Custom alias '" + alias + "' is already in use!");
            }
            shortCode = alias;
        } else {
            // Generate a random shortcode and ensure it's unique
            int maxAttempts = 10;
            int attempts = 0;
            do {
                shortCode = Base62.generateRandomCode();
                attempts++;
                if (attempts > maxAttempts) {
                    throw new RuntimeException("System is busy, please try again");
                }
            } while (urlRepository.findByShortCodeOrCustomAlias(shortCode).isPresent());
        }

        String passwordHash = null;
        if (StringUtils.hasText(request.getPassword())) {
            passwordHash = passwordEncoder.encode(request.getPassword());
        }

        Url url = Url.builder()
                .originalUrl(request.getOriginalUrl())
                .shortCode(shortCode)
                .customAlias(StringUtils.hasText(request.getCustomAlias()) ? request.getCustomAlias().trim() : null)
                .title(request.getTitle())
                .description(request.getDescription())
                .passwordHash(passwordHash)
                .expirationDate(request.getExpirationDate())
                .isEnabled(request.isEnabled())
                .isOneTimeUse(request.isOneTimeUse())
                .user(user)
                .build();

        Url savedUrl = urlRepository.save(url);
        String qrText = backendUrl + "/" + shortCode;
        String qrCodeBase64 = qrCodeService.generateQrCodeBase64(qrText);

        return urlMapper.toResponse(savedUrl, qrCodeBase64);
    }

    @Transactional(readOnly = true)
    public Page<UrlResponse> getUserUrls(String search, Pageable pageable) {
        User user = userService.getCurrentUser();
        Page<Url> urlsPage;

        if (StringUtils.hasText(search)) {
            urlsPage = urlRepository.searchUrls(user, search.trim(), pageable);
        } else {
            urlsPage = urlRepository.findByUser(user, pageable);
        }

        return urlsPage.map(url -> {
            String qrText = backendUrl + "/" + url.getShortCode();
            String qrCodeBase64 = qrCodeService.generateQrCodeBase64(qrText);
            return urlMapper.toResponse(url, qrCodeBase64);
        });
    }

    @Transactional(readOnly = true)
    public UrlResponse getUrlById(Long id) {
        User user = userService.getCurrentUser();
        Url url = urlRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("URL details not found"));

        if (!url.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized access to this URL");
        }

        String qrText = backendUrl + "/" + url.getShortCode();
        String qrCodeBase64 = qrCodeService.generateQrCodeBase64(qrText);
        return urlMapper.toResponse(url, qrCodeBase64);
    }

    @Transactional
    public UrlResponse updateUrl(Long id, UrlRequest request) {
        User user = userService.getCurrentUser();
        Url url = urlRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("URL not found to update"));

        if (!url.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized access to this URL");
        }

        // Validate custom alias if it has changed
        if (StringUtils.hasText(request.getCustomAlias()) && !request.getCustomAlias().equals(url.getCustomAlias())) {
            String alias = request.getCustomAlias().trim();
            if (urlRepository.findByShortCodeOrCustomAlias(alias).isPresent()) {
                throw new BadRequestException("Custom alias '" + alias + "' is already in use!");
            }
            // Evict old cache code and also prep to evict new one
            evictCache(url.getShortCode());
            url.setCustomAlias(alias);
            url.setShortCode(alias);
        }

        // If password changed
        if (request.getPassword() != null) {
            if (request.getPassword().isEmpty()) {
                url.setPasswordHash(null);
            } else {
                url.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            }
        }

        url.setOriginalUrl(request.getOriginalUrl());
        url.setTitle(request.getTitle());
        url.setDescription(request.getDescription());
        url.setExpirationDate(request.getExpirationDate());
        url.setEnabled(request.isEnabled());
        url.setOneTimeUse(request.isOneTimeUse());

        Url updatedUrl = urlRepository.save(url);
        
        // Evict from Redis cache
        evictCache(updatedUrl.getShortCode());

        String qrText = backendUrl + "/" + updatedUrl.getShortCode();
        String qrCodeBase64 = qrCodeService.generateQrCodeBase64(qrText);
        return urlMapper.toResponse(updatedUrl, qrCodeBase64);
    }

    @Transactional
    public void deleteUrl(Long id) {
        User user = userService.getCurrentUser();
        Url url = urlRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("URL not found to delete"));

        if (!url.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized access to this URL");
        }

        // Evict from Redis cache
        evictCache(url.getShortCode());

        urlRepository.delete(url);
    }

    // Cache lookup for redirects. Caches Cache DTO.
    @Cacheable(value = "urls", key = "#shortCode", unless = "#result == null")
    @Transactional(readOnly = true)
    public UrlCacheDto getUrlForRedirect(String shortCode) {
        log.info("Redis cache miss for shortCode: {}", shortCode);
        Url url = urlRepository.findByShortCodeOrCustomAlias(shortCode)
                .orElseThrow(() -> new ResourceNotFoundException("Short URL code not found"));

        return UrlCacheDto.builder()
                .id(url.getId())
                .originalUrl(url.getOriginalUrl())
                .shortCode(url.getShortCode())
                .passwordHash(url.getPasswordHash())
                .expirationDate(url.getExpirationDate())
                .isEnabled(url.isEnabled())
                .isOneTimeUse(url.isOneTimeUse())
                .build();
    }

    @Transactional(readOnly = true)
    public String verifyPasswordAndGetUrl(String shortCode, String password) {
        Url url = urlRepository.findByShortCodeOrCustomAlias(shortCode)
                .orElseThrow(() -> new ResourceNotFoundException("Short URL code not found"));

        if (url.getPasswordHash() == null) {
            return url.getOriginalUrl();
        }

        if (!passwordEncoder.matches(password, url.getPasswordHash())) {
            throw new BadRequestException("Invalid password entered");
        }

        return url.getOriginalUrl();
    }

    public void evictCache(String code) {
        Cache cache = cacheManager.getCache("urls");
        if (cache != null) {
            cache.evict(code);
            log.info("Evicted code from Redis cache: {}", code);
        }
    }
}
