package com.mentorship.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateMCQSessionDTO {
    private Long studentId;
    private Integer sessionNumber;
    private String sessionTitle;
    private String description;
}
