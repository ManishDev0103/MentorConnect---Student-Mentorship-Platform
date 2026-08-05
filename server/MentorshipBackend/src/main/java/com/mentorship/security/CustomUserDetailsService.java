package com.mentorship.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mentorship.entities.User;
import com.mentorship.repository.MentorRepository;
import com.mentorship.repository.StudentRepository;
import com.mentorship.repository.UserRepository;

import lombok.AllArgsConstructor;

@Service
@Transactional
@AllArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

	private final UserRepository userRepository;
	private final StudentRepository studentRepository;
	private final MentorRepository mentorRepository;

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new UsernameNotFoundException("Invalid email !!!"));
		
		// Fetch studentId if user is a student
		Long studentId = null;
		if (user.getUserRole().name().equals("STUDENT")) {
			studentId = studentRepository.findByUserDetails_UserId(user.getUserId())
					.map(student -> student.getStudentId())
					.orElse(null);
		}
		
		// Fetch mentorId if user is a mentor
		Long mentorId = null;
		if (user.getUserRole().name().equals("MENTOR")) {
			mentorId = mentorRepository.findByUserId(user.getUserId())
					.map(mentor -> mentor.getMentorId())
					.orElse(null);
		}
		
		return new CustomUserDetails(user, studentId, mentorId);
	}
	
	
}
