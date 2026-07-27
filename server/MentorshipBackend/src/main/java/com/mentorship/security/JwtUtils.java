package com.mentorship.security;


import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class JwtUtils {

	@Value("${jwt.secret.key}")
	private String jwtSecret;
	
	@Value("${jwt.expiration.time}")
	private int jwtExpirationMs;
	
	private SecretKey key;
	
	@PostConstruct
	public void init() {
		log.info("Key {} Exp Time {}",jwtSecret,jwtExpirationMs);
		
		key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
	}
	
	public String generateJwtToken(Authentication authentication) {
		log.info("generate jwt token "+ authentication);
		
		/*User userPrincipal = (User)authentication.getPrincipal();*/
		
		CustomUserDetails userPrincipal =
			    (CustomUserDetails) authentication.getPrincipal();

		var builder = Jwts.builder()
				.subject(authentication.getName())
				.issuedAt(new Date())
				.expiration(new Date((new Date()).getTime() + jwtExpirationMs))
				.claim("userId", userPrincipal.getUserId())
				.claim("authorities", getAuthoritiesInString(authentication.getAuthorities()));
		
		// Add studentId if present
		if (userPrincipal.getStudentId() != null) {
			builder.claim("studentId", userPrincipal.getStudentId());
		}
		
		// Add mentorId if present
		if (userPrincipal.getMentorId() != null) {
			builder.claim("mentorId", userPrincipal.getMentorId());
		}
		
		return builder.signWith(key, Jwts.SIG.HS256).compact();
	}
	
	//“Give me the login identifier stored in this token.”
	// which is the subject i.e email
	//(subject) = the principal the token belongs to
	//It is the canonical identifier of the user inside the token.
	public String getUserNameFromJwtToken(Claims claims) {
		return claims.getSubject();
	}
	
	public String getEmailFromJwtToken(String token) {
	    return Jwts.parser()
	               .verifyWith(key) // Use your existing key method
	               .build()
	               .parseSignedClaims(token)
	               .getPayload()
	               .getSubject();
	}
	
	public Claims validateJwtToken(String jwtToken) {
		
		Claims claims =  Jwts.parser()
				.verifyWith(key)
				.build()
				.parseSignedClaims(jwtToken)
				.getPayload();
		
		return claims;
				
	}
	
	
	private List<String> getAuthoritiesInString(Collection<? extends GrantedAuthority> authorities){
		
		return authorities.stream()
				.map(GrantedAuthority::getAuthority)
				.collect(Collectors.toList());
		
	}
	
	public List<GrantedAuthority> getAuthoritiesFromClaims(Claims claims){
		
		List<String> authorityNamesFromJwt = (List<String>) claims.get("authorities");
		
		List<GrantedAuthority> authorities = authorityNamesFromJwt.stream()
				.map(SimpleGrantedAuthority::new)
				.collect(Collectors.toList());
		
		authorities.forEach(System.out::println);
		return authorities;
	}
	
	/*
	 * public Authentication populateAuthenticationTokenFromJWT(String jwt) {
	 * 
	 * Claims payloadClaims = validateJwtToken(jwt);
	 * 
	 * String email = getUserNameFromJwtToken(payloadClaims);
	 * 
	 * List<GrantedAuthority> authorities = getAuthoritiesFromClaims(payloadClaims);
	 * 
	 * UsernamePasswordAuthenticationToken token = new
	 * UsernamePasswordAuthenticationToken(email,null, authorities);
	 * 
	 * System.out.println("is authenticated" +token.isAuthenticated()); return
	 * token;
	 * 
	 * }
	 */
	
	
}
