package com.security;

import io.jsonwebtoken.*; // Import all from jjwt
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration; // Should be just the number now

    private Key key;

    @PostConstruct
    public void init() {
        if (secret == null || secret.isEmpty()) {
            logger.error("JWT secret key is not configured. Please check application properties.");
            throw new IllegalStateException("JWT secret key is not configured.");
        }
        try {
            byte[] keyBytes = Decoders.BASE64.decode(secret);
            this.key = Keys.hmacShaKeyFor(keyBytes);
            logger.info("JWT key initialized successfully using configured secret.");
        } catch (IllegalArgumentException e) {
            logger.error("Invalid Base64 encoding for JWT secret key: {}", e.getMessage());
            throw new IllegalStateException("Invalid Base64 encoding for JWT secret key.", e);
        }
    }

    public String generateToken(String username, String role) {
        logger.debug("Generating token for user: {}, role: {}", username, role);
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);
        logger.debug("Token expiration set to: {}", expiryDate);

        return Jwts.builder()
                .setSubject(username)
                .claim("role", role) // Include role claim
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    private Claims extractAllClaims(String token) throws JwtException { // Declare that it throws JwtException
        // This method handles parsing and can throw various JWT exceptions
        // logger.debug("Attempting to parse token claims..."); // Optional: Add trace logging
        return Jwts.parser()
                .setSigningKey(key) // Use the key initialized in init()
                .build()
                .parseClaimsJws(token) // This performs validation (signature, expiration)
                .getBody();
    }


    public String extractUsername(String token) {
        try {
            String username = extractAllClaims(token).getSubject();
            // logger.debug("Successfully extracted username: {}", username); // Optional log
            return username;
        } catch (ExpiredJwtException e) {
            // Log specific exception type
            logger.warn("Failed to extract username from token: Token Expired. Details: {}", e.getMessage());
            return null;
        } catch (SignatureException e) {
            logger.warn("Failed to extract username from token: Invalid Signature. Details: {}", e.getMessage());
            return null;
        } catch (MalformedJwtException e) {
            logger.warn("Failed to extract username from token: Malformed Token. Details: {}", e.getMessage());
            return null;
        } catch (UnsupportedJwtException e) {
            logger.warn("Failed to extract username from token: Unsupported Token. Details: {}", e.getMessage());
            return null;
        } catch (IllegalArgumentException e) {
            logger.warn("Failed to extract username from token: Illegal Argument (e.g., empty token). Details: {}", e.getMessage());
            return null;
        } catch (JwtException e) { // Catch any other JWT-related exceptions
            logger.warn("Failed to extract username from token due to generic JwtException: {}. Details: {}", e.getClass().getSimpleName(), e.getMessage());
            return null;
        } catch (Exception e) { // Catch unexpected errors during claim extraction
            logger.error("Unexpected error during username extraction: {}", e.getMessage(), e);
            return null;
        }
    }

    // Extract Role (add similar detailed exception logging if needed)
    public String extractRole(String token) {
        try {
            return extractAllClaims(token).get("role", String.class);
        } catch (JwtException e) {
            logger.warn("Failed to extract role from token ({}): {}", e.getClass().getSimpleName(), e.getMessage());
            return null;
        }
    }

    // Validates signature and expiration by attempting to parse claims
    public boolean validateTokenSignatureAndExpiration(String token) {
        try {
            extractAllClaims(token); // If this doesn't throw, the token is valid
            // logger.debug("Token signature and expiration validated successfully."); // Optional log
            return true;
        } catch (ExpiredJwtException e) {
            logger.warn("Token validation failed: Expired JWT: {}", e.getMessage());
        } catch (SignatureException e) {
            logger.warn("Token validation failed: Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            logger.warn("Token validation failed: Invalid JWT token: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.warn("Token validation failed: Unsupported JWT token: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.warn("Token validation failed: JWT claims string is empty or invalid: {}", e.getMessage());
        } catch (JwtException e) { // Catch broader JwtException
            logger.warn("Token validation failed: Generic JWT problem: {}", e.getMessage());
        }
        return false; // Return false if any exception occurred
    }
}