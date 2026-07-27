package com.mentorship.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyRevenueDto {
    private String month;
    private double revenue;
    private long transactions;
    private double avgPerTransaction;
}
