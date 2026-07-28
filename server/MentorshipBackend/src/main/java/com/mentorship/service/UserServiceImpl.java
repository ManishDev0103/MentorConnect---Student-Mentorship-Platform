package com.mentorship.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.apache.commons.io.IOUtils;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.mentorship.custom_exceptions.ApiException;
import com.mentorship.dtos.ChangePasswordRequest;
import com.mentorship.dtos.ResetPasswordRequest;
import com.mentorship.dtos.UserResp;
import com.mentorship.entities.PasswordResetToken;
import com.mentorship.entities.User;
import com.mentorship.repository.ResetTokenRepository;
import com.mentorship.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

	private final UserRepository userRepository;
	private final ModelMapper modelMapper;
	private final PasswordEncoder passwordEncoder;
	private final ResetTokenRepository resetTokenRepository;
	private final EmailService emailService;

	@Value("${app.upload.profile-images-dir:uploads/profile-images}")
	private String profileImagesDir;

	@Override
	public List<UserResp> getAllUsers() {

		return userRepository.findAll()
				.stream().map(user -> modelMapper.map(user, UserResp.class))
				.toList();
	}

	@Override
	public void uploadProfileImage(Long userId, MultipartFile imageFile) {
        User user = userRepository
                .findById(userId).orElseThrow(() -> new ApiException("User Not Found..!"));

        if (imageFile.isEmpty()) {
            throw new ApiException("Image file is Empty..!");
        }
        if (!imageFile.getContentType().startsWith("image/")) {
            throw new ApiException("Only image files are allowed");
        }
        if (imageFile.getSize() > 2 * 1024 * 1024) {
            throw new ApiException("Image size must be less than 2MB");
        }

        try {
            Path uploadDir = Paths.get(profileImagesDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadDir);

            String extension = "";
            String originalFileName = imageFile.getOriginalFilename();
            if (originalFileName != null && originalFileName.contains(".")) {
                extension = originalFileName.substring(originalFileName.lastIndexOf('.'));
            }

            String fileName = userId + "_profile" + UUID.randomUUID() + extension;
            Path destination = uploadDir.resolve(fileName).normalize();
            Files.copy(imageFile.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

            user.setProfileImagePath(destination.toString());
            userRepository.save(user);
        } catch (IOException e) {
            throw new ApiException("Failed to upload image", e);
        }
    }

	@Override
	public User getUserById(Long userId) {
		return userRepository.findById(userId)
				.orElseThrow(() -> new ApiException("User Not Found"));
	}

	@Override
	public UserResp getUserRespById(Long userId) {
		User user = getUserById(userId);
		return modelMapper.map(user, UserResp.class);
	}

	@Override
	public void changePassword(Long userId, ChangePasswordRequest dto) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new ApiException("User not found"));

		if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
			throw new ApiException("Current password is incorrect");
		}

		if (passwordEncoder.matches(dto.getNewPassword(), user.getPassword())) {
			throw new ApiException("New password must be different");
		}

		if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
			throw new ApiException("Passwords do not match");
		}

		user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
		userRepository.save(user);
	}

	@Override
	public void deleteUserById(Long userId) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new ApiException("User not found"));
		user.setDeleted(true);
		userRepository.save(user);
	}

	@Override
	public void processForgotPassword(String email) {
		// TODO Auto-generated method stub

		userRepository.findByEmail(email).ifPresent(user -> {

			String token = UUID.randomUUID().toString();

			PasswordResetToken resetToken = new PasswordResetToken();
			resetToken.setToken(token);
			resetToken.setUser(user);
			resetToken.setExpiryTime(LocalDateTime.now().plusMinutes(15));

			resetTokenRepository.save(resetToken);

			emailService.sendPasswordResetEmail(user.getEmail(), token);
		});

	}

	@Override
	public void resetPassword(ResetPasswordRequest dto) {

		PasswordResetToken resetToken = resetTokenRepository.findByToken(dto.getToken())
				.orElseThrow(() -> new ApiException("Invalid or expired token"));

		if (resetToken.isUsed()
				|| resetToken.getExpiryTime().isBefore(LocalDateTime.now())) {
			throw new ApiException("Token expired or already used");
		}

		if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
			throw new ApiException("Passwords do not match");
		}

		User user = resetToken.getUser();
		user.setPassword(passwordEncoder.encode(dto.getNewPassword()));

		resetToken.setUsed(true);
	}

}
