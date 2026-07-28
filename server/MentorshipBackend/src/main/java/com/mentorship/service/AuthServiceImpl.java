package com.mentorship.service;

import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mentorship.custom_exceptions.ApiException;
import com.mentorship.dtos.AdminSignupRequest;
import com.mentorship.dtos.ApiResponse;
import com.mentorship.dtos.MentorSignupRequest;
import com.mentorship.dtos.StudentSignupRequest;
import com.mentorship.entities.Mentor;
import com.mentorship.entities.Student;
import com.mentorship.entities.User;
import com.mentorship.entities.UserRole;
import com.mentorship.entities.VerificationStatus;
import com.mentorship.repository.MentorRepository;
import com.mentorship.repository.StudentRepository;
import com.mentorship.repository.UserRepository;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@AllArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService{

	private final UserRepository userRepository;
	private final StudentRepository studentRepository;
	private final MentorRepository mentorRepository;
	private final PasswordEncoder passwordEncoder;
	private final ModelMapper modelMapper;
	
	@Override
    public ApiResponse registerStudent(StudentSignupRequest dto) {
		log.info("Registering student with email: {}", dto.getEmail());
		
		try {
			if(userRepository.existsByEmail(dto.getEmail())) {
				throw new ApiException("Email already registered");
			}
			
			User user = modelMapper.map(dto, User.class);
			
			// Ensure phone number is null if empty (to avoid unique constraint violation)
			if (user.getPhoneNo() != null && user.getPhoneNo().trim().isEmpty()) {
				user.setPhoneNo(null);
			}
			
			user.setUserRole(UserRole.STUDENT);
			user.setPassword(passwordEncoder.encode(dto.getPassword()));
			
			Student student = new Student();
			student.setUserDetails(user);
			student.setTargetDomain(dto.getTargetDomain());
			student.setQualification(dto.getQualification());
			
			studentRepository.save(student);
			log.info("Student registered successfully with email: {}", dto.getEmail());
			return new ApiResponse("Student registered successfully", null);
		} catch (ApiException e) {
			log.error("ApiException during student registration: {}", e.getMessage());
			throw e;
		} catch (Exception e) {
			log.error("Exception during student registration for email: {}", dto.getEmail(), e);
			throw new ApiException("Student registration failed: " + e.getMessage());
		}
	}

	@Override
	public ApiResponse registerMentor(MentorSignupRequest dto) {
		log.info("Registering mentor with email: {}", dto.getEmail());
		
		try {
			if (userRepository.existsByEmail(dto.getEmail())) {
	            throw new ApiException("Email already registered");
	        }

	        // 2. Map DTO → User entity
	        User user = modelMapper.map(dto, User.class);
	        log.info("Mapped user from DTO - firstName: {}, lastName: {}, email: {}", 
	        	user.getFirstName(), user.getLastName(), user.getEmail());

	        // Ensure phone number is null if empty (to avoid unique constraint violation)
	        if (user.getPhoneNo() != null && user.getPhoneNo().trim().isEmpty()) {
	        	user.setPhoneNo(null);
	        }

	        // 3. Set role & encrypt password
	        user.setUserRole(UserRole.MENTOR);
	        user.setPassword(passwordEncoder.encode(dto.getPassword()));
	        log.info("Set user role to MENTOR and encrypted password");

	        // 4. Create Mentor entity
	        Mentor mentor = new Mentor();
	        mentor.setUserDetails(user);
        String specialization = dto.getSpecialization();
        if (specialization != null && specialization.equalsIgnoreCase("Other")
                && dto.getCustomSpecialization() != null && !dto.getCustomSpecialization().isBlank()) {
            specialization = dto.getCustomSpecialization();
        }
        mentor.setSpecialization(specialization);
        mentor.setCustomSpecialization(dto.getCustomSpecialization());
        mentor.setExperience(dto.getExperience());
        mentor.setRatePerSession(dto.getRatePerSession() != null ? dto.getRatePerSession() : 0.0);
        mentor.setDiscountPercent(dto.getDiscountPercent() != null ? dto.getDiscountPercent() : 0.0);
	        mentor.setOrganization(dto.getOrganization());
	        mentor.setProfessionalBio(dto.getProfessionalBio());
	        mentor.setLinkedinUrl(dto.getLinkedinUrl());
	        mentor.setPortfolioUrl(dto.getPortfolioUrl());
	        mentor.setVerifiedBy(null);
	        
	        log.info("Created mentor entity with specialization: {}, experience: {}, rate: {}", 
	        	mentor.getSpecialization(), mentor.getExperience(), mentor.getRatePerSession());

	        // 5. Save mentor (cascade saves User)
	        Mentor savedMentor = mentorRepository.save(mentor);
	        log.info("Mentor registered successfully with email: {}, mentorId: {}, userId: {}", 
	        	dto.getEmail(), savedMentor.getMentorId(), savedMentor.getUserDetails().getUserId());

	        return new ApiResponse("Mentor registered successfully. Awaiting verification.", null);
		} catch (ApiException e) {
			log.error("ApiException during mentor registration: {}", e.getMessage());
			throw e;
		} catch (Exception e) {
			log.error("Exception during mentor registration for email: {}", dto.getEmail(), e);
			throw new ApiException("Mentor registration failed: " + e.getMessage());
		}
	}

	@Override
	public ApiResponse registerAdmin(AdminSignupRequest dto) {
		log.info("Registering admin with email: {}", dto.getEmail());
		try {
			// Check if email already exists
			if (userRepository.existsByEmail(dto.getEmail())) {
				log.warn("Admin registration failed - email already exists: {}", dto.getEmail());
				throw new ApiException("Email already exists");
			}
			
			// Create User entity with ADMIN role
			User admin = new User();
			admin.setFirstName(dto.getFirstName());
			admin.setLastName(dto.getLastName());
			admin.setEmail(dto.getEmail());
			admin.setPassword(passwordEncoder.encode(dto.getPassword()));
			admin.setDob(dto.getDob());
			admin.setAddress(dto.getAddress());
			admin.setPhoneNo(dto.getPhoneNo() != null && !dto.getPhoneNo().isEmpty() 
				? dto.getPhoneNo() : null);
			admin.setUserRole(UserRole.ADMIN);
			
			// Save directly to userRepository
			User savedAdmin = userRepository.save(admin);
			log.info("Admin registered successfully with email: {}, userId: {}", 
				dto.getEmail(), savedAdmin.getUserId());
			
			return new ApiResponse("Admin registered successfully!", null);
		} catch (ApiException e) {
			log.error("ApiException during admin registration: {}", e.getMessage());
			throw e;
		} catch (Exception e) {
			log.error("Exception during admin registration for email: {}", dto.getEmail(), e);
			throw new ApiException("Admin registration failed: " + e.getMessage());
		}
	}
}
