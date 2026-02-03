package com.security;

import com.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.cors.CorsConfiguration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);

    private final CustomUserDetailsService customUserDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    public SecurityConfig(CustomUserDetailsService customUserDetailsService, JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.customUserDetailsService = customUserDetailsService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        logger.info("Configuring Security Filter Chain...");
        http
                .cors(cors -> cors.configurationSource(request -> {
                    var config = new CorsConfiguration();
//                    config.setAllowedOrigins(List.of("http://localhost:3000")); // uncomment this line when running local
                        config.setAllowedOrigins(List.of("*"));
                    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                    config.setAllowedHeaders(List.of("*"));
                    config.setAllowCredentials(true);
                    return config;
                }))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests((authorize) -> authorize
                        // --- PUBLIC Endpoints ---
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/departments").permitAll()
                        .requestMatchers(HttpMethod.GET, "/static/**").permitAll() // Simplified static access
                        .requestMatchers(HttpMethod.GET, "/error").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/api/**").authenticated()

                        // --- USER & ADMIN Authenticated Endpoints (More specific first) ---
                        .requestMatchers("/api/users/profile/**").authenticated()
                        .requestMatchers("/api/attendance/**").authenticated()
                        .requestMatchers("/api/leave", "/api/leave/my-requests", "/api/leave/balances", "/api/leave/{id}/cancel").authenticated()
                        .requestMatchers("/api/expenses", "/api/expenses/my-claims").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/payroll/my-payslips").authenticated() // FIX: User can get their own payslips
                        .requestMatchers(HttpMethod.GET, "/api/payroll/{payslipId}").authenticated() // FIX: User can get details of one of their payslips (service layer validates ownership)
                        .requestMatchers(HttpMethod.POST, "/api/meetings/{meetingId}/respond").authenticated()

                        // --- ADMIN ONLY Endpoints ---
                        .requestMatchers("/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                        .requestMatchers("/api/notices/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                        .requestMatchers("/api/meetings/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                        .requestMatchers("/api/leave/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                        .requestMatchers("/api/expenses/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                        .requestMatchers("/api/projects/**").authenticated()
                        .requestMatchers("/api/timesheets/**").authenticated()

                       
                        .requestMatchers("/api/dashboard/**").authenticated()
                        .requestMatchers("/api/search/**").authenticated()
                        .requestMatchers("/api/tickets/**").authenticated()

                        // --- SUPER ADMIN ONLY ---
                        .requestMatchers("/api/superadmin/**").hasRole("SUPER_ADMIN")

                        // --- DEFAULT: Any other request must be authenticated ---
                        .anyRequest().authenticated()
                )
                .sessionManagement((session) -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        logger.info("Security Filter Chain configuration complete.");
        return http.build();

    }

}