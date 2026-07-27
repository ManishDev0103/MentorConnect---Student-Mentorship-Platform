package com.mentorship.dtos;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ApiResponse {

	private LocalDateTime timeStamp;
	
	private String message;
	
	private String status;

	public ApiResponse(String message, String status) {
		super();
		this.timeStamp = LocalDateTime.now();
		this.message = message;
		this.status = status;
	}
	
	
}
