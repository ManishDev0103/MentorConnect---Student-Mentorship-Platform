package com.mentorship.config;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import com.mentorship.security.CustomUserDetailsService;
import com.mentorship.security.JwtUtils;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SocketAuthHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtUtils jwtUtils;
    private final CustomUserDetailsService customUserDetailsService;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
            WebSocketHandler wsHandler, Map<String, Object> attributes) {
        String token = null;
        String authorization = request.getHeaders().getFirst("Authorization");
        if (authorization != null && authorization.startsWith("Bearer ")) {
            token = authorization.substring(7);
        }
        if (token == null) {
            String query = request.getURI().getQuery();
            if (query != null && !query.isBlank()) {
                for (String param : query.split("&")) {
                    if (param.startsWith("token=")) {
                        token = URLDecoder.decode(param.substring("token=".length()), StandardCharsets.UTF_8);
                        break;
                    }
                }
            }
        }

        if (token != null && !token.isBlank()) {
            try {
                String email = jwtUtils.getUserNameFromJwtToken(jwtUtils.validateJwtToken(token));
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (Exception ex) {
                return false;
            }
        }
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
            WebSocketHandler wsHandler, Exception exception) {
        // no-op
    }
}
