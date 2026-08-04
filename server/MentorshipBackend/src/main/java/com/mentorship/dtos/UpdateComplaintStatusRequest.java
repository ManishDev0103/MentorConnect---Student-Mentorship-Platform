package com.mentorship.dtos;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UpdateComplaintStatusRequest {
    private String status;
    private String response;
}
