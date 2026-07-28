package com.mentorship.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmailPreferenceRequest {

    @NotNull
    private Boolean emailNotificationsEnabled;
}
