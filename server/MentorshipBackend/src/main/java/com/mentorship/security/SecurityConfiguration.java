package com.mentorship.security;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.AllArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@AllArgsConstructor
public class SecurityConfiguration {

	
	private final PasswordEncoder encoder;
	private final CustomJwtFilter customJwtFilter;
	private final JwtAuthEntryPoint jwtAuthEntryPoint;
	
	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http)throws Exception{
		http.csrf(csrf -> csrf.disable());
		
		http.cors(cors -> cors.configurationSource(corsConfigurationSource()));
		
		http.authorizeHttpRequests(request ->
			request.requestMatchers("/swagger-ui/**", "/v**/api-docs/**",
		        "/api/users/signin", "/api/users/signup/**").permitAll()
			.requestMatchers("/error").permitAll()
			.requestMatchers("/api/test/**").permitAll()  // Allow test endpoints
			.requestMatchers(HttpMethod.OPTIONS).permitAll()
			.requestMatchers(HttpMethod.GET, "/students").permitAll()
			.requestMatchers(HttpMethod.GET, "/users/image/**").permitAll()
			.requestMatchers(HttpMethod.GET, "/mentors/public", "/mentors/public/**").permitAll()
			.requestMatchers("/api/mentor/**").permitAll()  // TEMPORARY: Allow all mentor requests for testing
			.requestMatchers("/api/student/**").permitAll()  // TEMPORARY: Allow all student requests for testing
			.requestMatchers("/api/messages/**").permitAll()  // Allow all message/chat endpoints
			.requestMatchers("/api/admin/migration/**").permitAll()  // Allow migration endpoints (one-time use)
			.requestMatchers("/api/admin/**").hasRole("ADMIN")
			.requestMatchers("/mentors/me", "/mentors/profile", "/mentors/resume").authenticated()
			.requestMatchers("/students/**").authenticated()  // Require authentication for students endpoints
			.anyRequest().authenticated());
		http.sessionManagement(session ->
		session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
		http.addFilterBefore(customJwtFilter,
				UsernamePasswordAuthenticationFilter.class);
		http.exceptionHandling(ex->ex.authenticationEntryPoint(jwtAuthEntryPoint));
		
		return http.build();
	}
	
	@Bean
	AuthenticationManager authenticationManager(AuthenticationConfiguration mgr) throws Exception{
		return mgr.getAuthenticationManager();
	}
	
	@Bean
	CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:5174"));
		configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
		configuration.setAllowedHeaders(Arrays.asList("*"));
		configuration.setAllowCredentials(true);
		configuration.setMaxAge(3600L);
		
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}
}
