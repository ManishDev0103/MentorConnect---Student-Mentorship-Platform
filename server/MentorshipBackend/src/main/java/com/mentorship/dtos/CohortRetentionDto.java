package com.mentorship.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CohortRetentionDto {
    private String cohort;           // e.g., "Jan 2024"
    private int totalUsers;          // Total users in this cohort
    private String month1Retention;  // "100%" - first month (always 100%)
    private String month2Retention;  // Retention in 2nd month
    private String month3Retention;  // Retention in 3rd month
    private String month4Retention;  // Retention in 4th month
}
