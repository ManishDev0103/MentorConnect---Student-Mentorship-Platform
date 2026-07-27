package com.mentorship.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ActivityStreakDto {
    private Long userId;
    private String name;
    private String type; // MENTOR or STUDENT
    private long consecutiveDays;
    private String lastActivityDate;
}
