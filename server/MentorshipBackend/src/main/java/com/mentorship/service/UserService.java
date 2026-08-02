package com.mentorship.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.mentorship.dtos.ChangePasswordRequest;
import com.mentorship.dtos.EmailPreferenceRequest;
import com.mentorship.dtos.ResetPasswordRequest;
import com.mentorship.dtos.UserResp;
import com.mentorship.entities.User;

public interface UserService {
	List<UserResp> getAllUsers();

	void uploadProfileImage(Long userId, MultipartFile imageFile);

	User getUserById(Long userId);

	UserResp getUserRespById(Long userId);

	void changePassword(Long userId, ChangePasswordRequest dto);

	void deleteUserById(Long userId);

	void processForgotPassword(String emailOrPhone);

	void validateResetToken(String token);

	void resetPassword(ResetPasswordRequest dto);

	void updateEmailPreferences(Long userId, Boolean enabled);
}
