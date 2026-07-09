package com.tinylink.dto;

import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UrlCacheDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String originalUrl;
    private String shortCode;
    private String passwordHash;
    private LocalDateTime expirationDate;
    private boolean isEnabled;
    private boolean isOneTimeUse;
}
