package com.mentorship.dtos;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminSignupRequest {

    @NotBlank
    @Size(max = 30)
    private String firstName;

    @Size(max = 30)
    private String lastName;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Size(min = 6, max = 20)
    private String password;

    private LocalDate dob;

    private String address;

    @Size(max = 14)
    private String phoneNo;
}
