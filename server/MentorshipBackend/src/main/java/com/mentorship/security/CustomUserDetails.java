package com.mentorship.security;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.mentorship.entities.User;
import com.mentorship.entities.UserStatus;

public class CustomUserDetails implements UserDetails {

	private final User user;
	private Long studentId;
	private Long mentorId;
	
	public CustomUserDetails(User user) {
        this.user = user;
    }
	
	public CustomUserDetails(User user, Long studentId, Long mentorId) {
        this.user = user;
        this.studentId = studentId;
        this.mentorId = mentorId;
    }
	
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return List.of(new SimpleGrantedAuthority("ROLE_"+ user.getUserRole().name()));
	}

	@Override
	public @Nullable String getPassword() {
		return user.getPassword();
	}

	@Override
	public String getUsername() {
		return user.getEmail();
	}
	
	public long getUserId() {
		return user.getUserId();
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		UserStatus status = user.getUserStatus();
		if (status == UserStatus.BANNED) {
			return false;
		}
		if (status == UserStatus.SUSPENDED) {
			LocalDateTime until = user.getRestrictionUntil();
			return until == null || until.isBefore(LocalDateTime.now());
		}
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		if (user.isDeleted()) {
			return false;
		}
		UserStatus status = user.getUserStatus();
		return status != UserStatus.BANNED;
	}
	
	public Long getStudentId() {
		return studentId;
	}
	
	public Long getMentorId() {
		return mentorId;
	}

}
