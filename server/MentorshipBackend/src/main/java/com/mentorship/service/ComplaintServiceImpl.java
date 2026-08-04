package com.mentorship.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mentorship.custom_exceptions.ApiException;
import com.mentorship.dtos.ComplaintDto;
import com.mentorship.dtos.CreateComplaintRequest;
import com.mentorship.dtos.UpdateComplaintStatusRequest;
import com.mentorship.entities.Complaint;
import com.mentorship.entities.ComplaintStatus;
import com.mentorship.entities.User;
import com.mentorship.repository.ComplaintRepository;
import com.mentorship.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class ComplaintServiceImpl implements ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    @Override
    public ComplaintDto createComplaint(CreateComplaintRequest request, Long reporterUserId) {
        if (request == null || request.getTitle() == null || request.getTitle().isBlank()) {
            throw new ApiException("Complaint title is required");
        }
        if (request.getDescription() == null || request.getDescription().isBlank()) {
            throw new ApiException("Complaint description is required");
        }

        User reporter = userRepository.findById(reporterUserId)
                .orElseThrow(() -> new ApiException("Reporting user not found"));

        Complaint complaint = new Complaint();
        complaint.setTitle(request.getTitle().trim());
        complaint.setDescription(request.getDescription().trim());
        complaint.setReporter(reporter);
        complaint.setStatus(ComplaintStatus.OPEN);

        if (request.getTargetUserId() != null) {
            userRepository.findById(request.getTargetUserId()).ifPresent(complaint::setTargetUser);
        }

        Complaint result = complaintRepository.save(complaint);
        return mapToDto(result);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComplaintDto> getComplaintsForReporter(Long reporterUserId) {
        return complaintRepository.findByReporter_UserId(reporterUserId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComplaintDto> getAllComplaints() {
        return complaintRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public ComplaintDto updateComplaintStatus(Long complaintId, UpdateComplaintStatusRequest request) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ApiException("Complaint not found"));

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            try {
                ComplaintStatus status = ComplaintStatus.valueOf(request.getStatus().trim().toUpperCase());
                complaint.setStatus(status);
            } catch (IllegalArgumentException ex) {
                throw new ApiException("Invalid complaint status");
            }
        }

        if (request.getResponse() != null) {
            complaint.setResponse(request.getResponse().trim());
        }

        Complaint updated = complaintRepository.save(complaint);
        return mapToDto(updated);
    }

    private ComplaintDto mapToDto(Complaint complaint) {
        ComplaintDto dto = new ComplaintDto();
        dto.setComplaintId(complaint.getComplaintId());
        dto.setTitle(complaint.getTitle());
        dto.setDescription(complaint.getDescription());
        dto.setStatus(complaint.getStatus() != null ? complaint.getStatus().name() : null);
        dto.setResponse(complaint.getResponse());

        if (complaint.getReporter() != null) {
            dto.setReporterId(complaint.getReporter().getUserId());
            dto.setReporterName(
                    complaint.getReporter().getFirstName() + " " + complaint.getReporter().getLastName());
        }

        if (complaint.getTargetUser() != null) {
            dto.setTargetUserId(complaint.getTargetUser().getUserId());
            dto.setTargetUserName(
                    complaint.getTargetUser().getFirstName() + " " + complaint.getTargetUser().getLastName());
        }

        dto.setCreatedAt(complaint.getCreatedAt());
        dto.setUpdatedAt(complaint.getUpdatedAt());
        return dto;
    }
}
