package com.mentorship.service;

import com.mentorship.dtos.AdminSignupRequest;
import com.mentorship.dtos.ApiResponse;
import com.mentorship.dtos.MentorSignupRequest;
import com.mentorship.dtos.StudentSignupRequest;

public interface AuthService {
	ApiResponse registerStudent(StudentSignupRequest dto);

    ApiResponse registerMentor(MentorSignupRequest dto);
    
    ApiResponse registerAdmin(AdminSignupRequest dto);
}
