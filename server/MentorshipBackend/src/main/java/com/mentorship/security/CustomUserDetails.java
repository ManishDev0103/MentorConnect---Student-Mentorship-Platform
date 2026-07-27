package com.mentorship.security;

import java.util.Collection;
import java.util.List;

import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.mentorship.entities.User;

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
		// TODO Auto-generated method stub
		return List.of(new SimpleGrantedAuthority("ROLE_"+ user.getUserRole().name()));
	}

	@Override
	public @Nullable String getPassword() {
		// TODO Auto-generated method stub
		return user.getPassword();
	}

	@Override
	public String getUsername() {
		// TODO Auto-generated method stub
		return user.getEmail();
	}
	
	public long getUserId() {
		return user.getUserId();
	}
	
	public Long getStudentId() {
		return studentId;
	}
	
	public Long getMentorId() {
		return mentorId;
	}

}
