package com.mentorship.dtos;

import java.time.LocalDate;

import com.mentorship.entities.UserRole;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class UserResp {
	private Long userId;
	private String firstName;	
	private String lastName;	
	private String email;
	private LocalDate dob;
	private UserRole userRole;
	private String phoneNo;
	private String address;
	private Boolean emailNotificationsEnabled;
}
