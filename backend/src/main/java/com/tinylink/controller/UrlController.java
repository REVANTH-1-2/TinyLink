package com.tinylink.controller;

import com.tinylink.dto.PasswordRequest;
import com.tinylink.dto.UrlRequest;
import com.tinylink.dto.UrlResponse;
import com.tinylink.service.UrlService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/urls")
@RequiredArgsConstructor
@Tag(name = "URLs", description = "Endpoints to create, manage, and verify password-protected short URLs")
public class UrlController {

    private final UrlService urlService;

    @PostMapping
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create a shortened URL")
    public ResponseEntity<UrlResponse> createUrl(@Valid @RequestBody UrlRequest request) {
        UrlResponse response = urlService.createUrl(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get current user's shortened URLs list")
    public ResponseEntity<Page<UrlResponse>> getUserUrls(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<UrlResponse> urls = urlService.getUserUrls(search, pageable);
        return ResponseEntity.ok(urls);
    }

    @GetMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get specific URL details")
    public ResponseEntity<UrlResponse> getUrlById(@PathVariable Long id) {
        UrlResponse response = urlService.getUrlById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update shortened URL configuration")
    public ResponseEntity<UrlResponse> updateUrl(@PathVariable Long id, @Valid @RequestBody UrlRequest request) {
        UrlResponse response = urlService.updateUrl(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete a shortened URL")
    public ResponseEntity<Void> deleteUrl(@PathVariable Long id) {
        urlService.deleteUrl(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{shortCode}/access")
    @Operation(summary = "Verify password and get target original URL for password-protected link")
    public ResponseEntity<Map<String, String>> verifyPasswordAndGetUrl(
            @PathVariable String shortCode,
            @Valid @RequestBody PasswordRequest request) {
        String originalUrl = urlService.verifyPasswordAndGetUrl(shortCode, request.getPassword());
        return ResponseEntity.ok(Map.of("originalUrl", originalUrl));
    }
}
