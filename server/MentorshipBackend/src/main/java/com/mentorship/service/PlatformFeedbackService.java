package com.mentorship.service;

import java.util.List;

import com.mentorship.dtos.FeedbackDTO;

public interface PlatformFeedbackService {
    List<FeedbackDTO> getRecentPlatformFeedback(Integer limit);
}
