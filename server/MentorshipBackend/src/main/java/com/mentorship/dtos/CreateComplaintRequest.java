package com.mentorship.dtos;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CreateComplaintRequest {
    private String title;
    private String description;
    private Long targetUserId;
}
