package com.mentorship.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.mentorship.dtos.VideoLectureDTO;

public interface VideoLibraryService {
    VideoLectureDTO createVideo(Long mentorId, String title, String description, String subject, String videoUrl, String thumbnailUrl, String duration);
    VideoLectureDTO updateVideo(Long mentorId, Long id, String title, String description, String subject, String videoUrl, String thumbnailUrl, String duration);
    void deleteVideo(Long mentorId, Long id);
    List<VideoLectureDTO> getVideos();
    VideoLectureDTO getVideo(Long id);
    List<VideoLectureDTO> getMentorVideos(Long mentorId);
}
