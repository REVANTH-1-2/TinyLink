package com.tinylink.service;

import com.tinylink.dto.UrlRequest;
import com.tinylink.dto.UrlResponse;
import com.tinylink.entity.Url;
import com.tinylink.entity.User;
import com.tinylink.exception.BadRequestException;
import com.tinylink.mapper.UrlMapper;
import com.tinylink.repository.UrlRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UrlServiceTest {

    @Mock
    private UrlRepository urlRepository;
    @Mock
    private UserService userService;
    @Mock
    private QrCodeService qrCodeService;
    @Mock
    private UrlMapper urlMapper;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private CacheManager cacheManager;

    @InjectMocks
    private UrlService urlService;

    private User testUser;
    private Url testUrl;

    @BeforeEach
    public void setup() {
        testUser = User.builder()
                .id(1L)
                .username("jane")
                .email("jane@example.com")
                .build();

        testUrl = Url.builder()
                .id(100L)
                .originalUrl("https://google.com/search?q=springboot")
                .shortCode("googlesp")
                .customAlias("googlesp")
                .user(testUser)
                .build();
    }

    @Test
    public void testCreateUrlWithUniqueAlias() {
        UrlRequest request = UrlRequest.builder()
                .originalUrl("https://google.com/search?q=springboot")
                .customAlias("googlesp")
                .isEnabled(true)
                .build();

        when(userService.getCurrentUser()).thenReturn(testUser);
        when(urlRepository.findByShortCodeOrCustomAlias("googlesp")).thenReturn(Optional.empty());
        when(urlRepository.save(any(Url.class))).thenReturn(testUrl);
        when(qrCodeService.generateQrCodeBase64(anyString())).thenReturn("base64qr");
        
        UrlResponse expectedResponse = UrlResponse.builder()
                .id(100L)
                .originalUrl("https://google.com/search?q=springboot")
                .shortCode("googlesp")
                .qrCode("base64qr")
                .build();
        when(urlMapper.toResponse(any(Url.class), eq("base64qr"))).thenReturn(expectedResponse);

        UrlResponse result = urlService.createUrl(request);

        assertNotNull(result);
        assertEquals("googlesp", result.getShortCode());
        assertEquals("base64qr", result.getQrCode());
        verify(urlRepository, times(1)).save(any(Url.class));
    }

    @Test
    public void testCreateUrlWithDuplicateAliasThrowsException() {
        UrlRequest request = UrlRequest.builder()
                .originalUrl("https://google.com")
                .customAlias("googlesp")
                .build();

        when(userService.getCurrentUser()).thenReturn(testUser);
        when(urlRepository.findByShortCodeOrCustomAlias("googlesp")).thenReturn(Optional.of(testUrl));

        assertThrows(BadRequestException.class, () -> {
            urlService.createUrl(request);
        });
        
        verify(urlRepository, never()).save(any(Url.class));
    }
}
