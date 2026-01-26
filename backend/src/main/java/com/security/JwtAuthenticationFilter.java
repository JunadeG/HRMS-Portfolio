// src/main/java/com/HRMSbackend/HRMSbackend/security/JwtAuthenticationFilter.java
package com.HRMSbackend.HRMSbackend.security;

import com.HRMSbackend.HRMSbackend.model.User;
import com.HRMSbackend.HRMSbackend.repository.UserRepository;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.util.StringUtils; // Required for StringUtils.hasText

import java.io.IOException;
import java.util.List; // Required for List<GrantedAuthority>
import java.util.Optional; // Required for Optional<User>

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Autowired
    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String requestURI = request.getRequestURI(); // Get URI for logging
        String jwt = extractJwtFromRequest(request);
        String username = null; // Initialize username

        // Only process if token exists and no auth is already set in the security context
        if (StringUtils.hasText(jwt) && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                username = jwtUtil.extractUsername(jwt); // Extract username from token

                if (username != null) {
                    // Fetch user from DB based on username. Ensure eager fetching if needed.
                    Optional<User> userOptional = userRepository.findByUsername(username);

                    if (userOptional.isPresent()) {
                        User user = userOptional.get(); // Get the User object

                        // Validate token signature & expiration AFTER finding user
                        if (jwtUtil.validateTokenSignatureAndExpiration(jwt)) {

                            // *** Create authorities with ROLE_ prefix (Case-sensitive based on Enum) ***
                            String roleName = user.getRole() != null ? user.getRole().name() : "USER"; // Default to USER if role is null
                            List<GrantedAuthority> authorities = AuthorityUtils.createAuthorityList("ROLE_" + roleName);

                            // *** Use the fully loaded User object as the principal ***
                            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                    user, // Principal is the User object
                                    null, // Credentials aren't needed (token validated)
                                    authorities // Authorities derived from user role
                            );
                            // Set details like IP address, session ID etc.
                            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                            // --- Logging Authentication Details ---
                            System.out.println("JwtAuthenticationFilter: Setting Authentication for '" + username
                                    + "' with authorities: " + authorities + " for URI: " + requestURI);
                            // --- End Logging ---

                            // Set the authentication in the security context
                            SecurityContextHolder.getContext().setAuthentication(authentication);

                        } else {
                            // Token invalid (expired or signature mismatch)
                            System.out.println("JwtAuthenticationFilter: Invalid JWT Token (expired/signature) for user '" + username + "'. URI: " + requestURI);
                            // Do NOT set auth context. Let request proceed.
                        }
                    } else {
                        // User specified in token not found in the database
                        System.out.println("JwtAuthenticationFilter: User '" + username + "' from token not found in database. URI: " + requestURI);
                    }
                } else {
                    // Username could not be extracted from the token
                    System.out.println("JwtAuthenticationFilter: Username couldn't be extracted from provided token. URI: " + requestURI);
                }

                // Catch specific JWT exceptions for better logging
            } catch (ExpiredJwtException ex) {
                System.out.println("JwtAuthenticationFilter: JWT Token expired for user '" + (username != null ? username : "token") + "'. URI: " + requestURI + ". Msg: " + ex.getMessage());
            } catch (SignatureException ex) {
                System.out.println("JwtAuthenticationFilter: JWT Signature exception for user '" + (username != null ? username : "token") + "'. URI: " + requestURI + ". Msg: " + ex.getMessage());
            } catch (MalformedJwtException ex) {
                System.out.println("JwtAuthenticationFilter: Malformed JWT Token for user '" + (username != null ? username : "token") + "'. URI: " + requestURI + ". Msg: " + ex.getMessage());
            } catch (UnsupportedJwtException ex) {
                System.out.println("JwtAuthenticationFilter: Unsupported JWT Token for user '" + (username != null ? username : "token") + "'. URI: " + requestURI + ". Msg: " + ex.getMessage());
            } catch (IllegalArgumentException ex) {
                // Often happens if the token string is empty or claims are invalid
                System.out.println("JwtAuthenticationFilter: Illegal Argument processing JWT for user '" + (username != null ? username : "token") + "'. URI: " + requestURI + ". Msg: " + ex.getMessage());
            } catch (Exception e) {
                // Catch any other unexpected errors during token processing or user lookup
                System.err.println("JwtAuthenticationFilter: Unexpected error processing JWT. URI: " + requestURI + ". Error: " + e.getMessage());
                e.printStackTrace(); // Log stack trace for unexpected errors
            }
        } else {
            // Log why processing was skipped (optional, can be noisy)
            // if (!StringUtils.hasText(jwt)) { System.out.println("JwtAuthenticationFilter: No token for URI: " + requestURI); }
            // if (SecurityContextHolder.getContext().getAuthentication() != null) { System.out.println("JwtAuthenticationFilter: Auth context already set for URI: " + requestURI); }
        }

        // Continue the filter chain in all cases (whether auth was set or not)
        filterChain.doFilter(request, response);
    }

    // Helper method to extract JWT from the Authorization header
    private String extractJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        // Check if the header exists and starts with "Bearer " (case-insensitive check might be better)
        if (StringUtils.hasText(bearerToken) && bearerToken.trim().startsWith("Bearer ")) {
            // Extract token after "Bearer " prefix
            String token = bearerToken.trim().substring(7);
            if (StringUtils.hasText(token)) {
                return token;
            }
        }
        return null; // Return null if header is missing, empty, or not Bearer type
    }
}