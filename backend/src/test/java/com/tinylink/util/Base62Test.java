package com.tinylink.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class Base62Test {

    @Test
    public void testRandomCodeGeneration() {
        String code1 = Base62.generateRandomCode();
        String code2 = Base62.generateRandomCode();

        assertNotNull(code1);
        assertNotNull(code2);
        assertTrue(code1.length() >= 6 && code1.length() <= 8);
        assertTrue(code2.length() >= 6 && code2.length() <= 8);
        // Random codes should generally be unique
        assertNotEquals(code1, code2);
    }

    @Test
    public void testEncoding() {
        assertEquals("b", Base62.encode(1));
        assertEquals("a", Base62.encode(0));
        
        long val = 123456789L;
        String encoded = Base62.encode(val);
        assertNotNull(encoded);
        assertTrue(encoded.length() > 0);
    }
}
