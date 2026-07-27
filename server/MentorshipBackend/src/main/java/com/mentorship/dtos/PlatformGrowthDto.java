package com.mentorship.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PlatformGrowthDto {
    private String month;
    private long students;
    private long mentors;
    private long sessions;
    private double revenue;
}
