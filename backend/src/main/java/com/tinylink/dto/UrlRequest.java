package com.tinylink.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UrlRequest {
    @NotBlank(message = "Original URL is required")
    @Pattern(regexp = "^(https?|ftp|file)://[-a-zA-Z0-9+&@#/%?=~_|!:,.;]*[-a-zA-Z0-9+&@#/%=~_|]", message = "Invalid original URL format")
    private String originalUrl;

    @Pattern(regexp = "^[a-zA-Z0-9-_]*$", message = "Custom alias must contain only alphanumeric characters, hyphens, or underscores")
    private String customAlias;

    private String title;

    private String description;

    private String password;

    private LocalDateTime expirationDate;

    @Builder.Default
    private boolean isOneTimeUse = false;

    @Builder.Default
    private boolean isEnabled = true;
}
