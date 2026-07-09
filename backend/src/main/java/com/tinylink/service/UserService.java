package com.tinylink.service;

import com.tinylink.dto.UserDto;
import com.tinylink.entity.User;
import com.tinylink.exception.ResourceNotFoundException;
import com.tinylink.exception.UnauthorizedException;
import com.tinylink.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || 
                authentication.getPrincipal().equals("anonymousUser")) {
            throw new UnauthorizedException("User is not authenticated");
        }
        
        Object principal = authentication.getPrincipal();
        if (principal instanceof com.tinylink.security.UserPrincipal) {
            Long userId = ((com.tinylink.security.UserPrincipal) principal).getId();
            return userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        }
        
        throw new UnauthorizedException("Invalid authentication principal");
    }

    public UserDto getCurrentUserDto() {
        User user = getCurrentUser();
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }
}
