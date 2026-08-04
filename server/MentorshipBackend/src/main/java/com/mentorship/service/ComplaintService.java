package com.mentorship.service;

import java.util.List;

import com.mentorship.dtos.ComplaintDto;
import com.mentorship.dtos.CreateComplaintRequest;
import com.mentorship.dtos.UpdateComplaintStatusRequest;

public interface ComplaintService {
    ComplaintDto createComplaint(CreateComplaintRequest request, Long reporterUserId);
    List<ComplaintDto> getComplaintsForReporter(Long reporterUserId);
    List<ComplaintDto> getAllComplaints();
    ComplaintDto updateComplaintStatus(Long complaintId, UpdateComplaintStatusRequest request);
}
