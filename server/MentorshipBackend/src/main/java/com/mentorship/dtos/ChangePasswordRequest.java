package com.mentorship.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangePasswordRequest {

	 @NotBlank
	    private String currentPassword;

	    @NotBlank
	    @Size(min = 8, max = 20)
	    private String newPassword;

	    @NotBlank
	    private String confirmPassword;
}
