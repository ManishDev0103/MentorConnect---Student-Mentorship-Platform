package com.mentorship.dtos;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import com.mentorship.validation.ValidPassword;

@Getter
@Setter
public class StudentSignupRequest {

	 @NotBlank
	    @Size(max = 30)
	    private String firstName;

	    @Size(max = 30)
	    private String lastName;

	    @Email
	    @NotBlank
	    private String email;

	    @NotBlank
	    @Size(min = 8, max = 20)
	    @ValidPassword
	    private String password;

	    private LocalDate dob;

	    private String address;

	    @Size(max = 14)
	    private String phoneNo;

	    @NotBlank
	    private String targetDomain;

	    private String qualification;

