package com.mentorship.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@AllArgsConstructor
public class CustomJwtFilter extends OncePerRequestFilter{

		private final JwtUtils jwtUtils;
		private final CustomUserDetailsService customUserDetailsService;

		@Override
		protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
				FilterChain filterChain) throws ServletException, IOException {
			String headerValue = request.getHeader("Authorization");

			// SAFETY CHECK: If no header or doesn't start with Bearer, just continue to next filter
			if (headerValue == null || !headerValue.startsWith("Bearer ")) {
				filterChain.doFilter(request, response);
				return;
			}
			
			if(headerValue != null && headerValue.startsWith("Bearer ")) {
				
				String jwt = headerValue.substring(7);
				log.info("JWT in request header {}", jwt);
		
				try {
					String email = jwtUtils.getUserNameFromJwtToken(jwtUtils.validateJwtToken(jwt));
			
					if(email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
				
						UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);
				
						UsernamePasswordAuthenticationToken authentication =
								new UsernamePasswordAuthenticationToken(userDetails,null,userDetails.getAuthorities());
						authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
				
						SecurityContextHolder.getContext().setAuthentication(authentication);
						log.info("Authentication set for user: {}", email);
					}
				} catch (Exception e) {
					log.error("Error validating JWT token: {}", e.getMessage(), e);
				}
				
				
				
				/*
				 * Authentication authentication =
				 * jwtUtils.populateAuthenticationTokenFromJWT(jwt);
				 * 
				 * log.info("auth object from JWT {} ", authentication);
				 * log.info("is auth : {}", authentication.isAuthenticated());
				 * 
				 * SecurityContextHolder .getContext().setAuthentication(authentication);
				 */
			}
			
			filterChain.doFilter(request, response);
			
		}
	
	// @Override
	// protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
	// 	String path = request.getServletPath();
	// 	return path.startsWith("/users/signin") || 
	// 	       path.startsWith("/users/signup") || 
	// 	       path.startsWith("/swagger-ui") || 
	// 	       path.startsWith("/v3/api-docs") ||
	// 	       path.startsWith("/v2/api-docs") ||
	// 	       path.equals("/error");
	// }
}
