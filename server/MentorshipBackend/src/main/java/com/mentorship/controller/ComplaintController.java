package com.mentorship.controller;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mentorship.dtos.ComplaintDto;
import com.mentorship.dtos.CreateComplaintRequest;
import com.mentorship.security.SecurityUtils;
import com.mentorship.service.ComplaintService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ComplaintDto> createComplaint(
            @RequestBody @Valid CreateComplaintRequest request) {
        Long reporterId = SecurityUtils.getLoggedInUserId();
        ComplaintDto dto = complaintService.createComplaint(request, reporterId);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ComplaintDto>> getMyComplaints() {
        Long reporterId = SecurityUtils.getLoggedInUserId();
        return ResponseEntity.ok(complaintService.getComplaintsForReporter(reporterId));
    }
}
