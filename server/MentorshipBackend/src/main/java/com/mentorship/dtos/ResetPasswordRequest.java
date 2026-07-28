package com.mentorship.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import com.mentorship.validation.ValidPassword;

@Getter
@Setter
public class ResetPasswordRequest {

    @NotBlank
    private String token;

    @NotBlank
    @Size(min = 8, max = 20)
    @ValidPassword
    private String newPassword;

    @NotBlank
    private String confirmPassword;
}
