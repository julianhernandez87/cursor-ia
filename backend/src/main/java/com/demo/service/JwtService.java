package com.demo.service;

import com.demo.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final JwtProperties jwtProperties;
    private final SecretKey key;

    public JwtService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
        this.key = Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
    }

    public String sign(String subject, String email) {
        long now = System.currentTimeMillis();
        Date expiry = new Date(now + jwtProperties.getExpirationSeconds() * 1000L);
        return Jwts.builder()
                .subject(subject)
                .claim("email", email)
                .issuedAt(new Date(now))
                .expiration(expiry)
                .signWith(key)
                .compact();
    }

    public Claims validateAndGetClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractSubject(String token) {
        return validateAndGetClaims(token).getSubject();
    }

    public long getExpirationSeconds() {
        return jwtProperties.getExpirationSeconds();
    }
}
