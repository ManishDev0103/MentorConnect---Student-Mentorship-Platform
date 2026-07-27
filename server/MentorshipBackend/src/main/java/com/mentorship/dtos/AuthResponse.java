package com.mentorship.dtos;

import java.time.LocalDate;

import com.mentorship.entities.UserRole;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class AuthResponse {
	private String message;
	private String jwt;
}
