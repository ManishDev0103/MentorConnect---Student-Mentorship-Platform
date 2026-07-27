package com.mentorship.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.mentorship.custom_exceptions.ApiException;

public class SecurityUtils {

	public static CustomUserDetails getLoggedInUser() {
        Authentication auth =
            SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            throw new ApiException("Unauthenticated");
        }

        return (CustomUserDetails) auth.getPrincipal();
    }

    public static Long getLoggedInUserId() {
        return getLoggedInUser().getUserId();
    }
}
