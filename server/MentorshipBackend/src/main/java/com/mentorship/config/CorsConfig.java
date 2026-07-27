package com.mentorship.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

	 @Bean
	    public CorsFilter corsFilter() {
	        CorsConfiguration corsConfiguration = new CorsConfiguration();
	        
	        // Allow all origins for development (update for production)
	        corsConfiguration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000"));
	        
	        // Allow all HTTP methods
	        corsConfiguration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
	        
	        // Allow all headers
	        corsConfiguration.setAllowedHeaders(Arrays.asList("*"));
	        
	        // Allow credentials
	        corsConfiguration.setAllowCredentials(true);
	        
	        // Set max age
	        corsConfiguration.setMaxAge(3600L);

	        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
	        source.registerCorsConfiguration("/api/**", corsConfiguration);

	        return new CorsFilter(source);
	    }
}
