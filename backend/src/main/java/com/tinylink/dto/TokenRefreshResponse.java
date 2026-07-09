package com.tinylink.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenRefreshResponse {
    private String token;
    private String refreshToken;
    @Builder.Default
    private String type = "Bearer";
}
