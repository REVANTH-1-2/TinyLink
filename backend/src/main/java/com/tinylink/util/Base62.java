package com.tinylink.util;

import java.security.SecureRandom;

public class Base62 {
    private static final String CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int BASE = CHARACTERS.length();
    private static final SecureRandom random = new SecureRandom();

    public static String generateRandomCode() {
        // Generate a random length between 6 and 8 characters
        int length = 6 + random.nextInt(3); 
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(CHARACTERS.charAt(random.nextInt(BASE)));
        }
        return sb.toString();
    }
    
    public static String encode(long value) {
        if (value == 0) {
            return String.valueOf(CHARACTERS.charAt(0));
        }
        StringBuilder sb = new StringBuilder();
        while (value > 0) {
            sb.append(CHARACTERS.charAt((int) (value % BASE)));
            value /= BASE;
        }
        return sb.reverse().toString();
    }
}
