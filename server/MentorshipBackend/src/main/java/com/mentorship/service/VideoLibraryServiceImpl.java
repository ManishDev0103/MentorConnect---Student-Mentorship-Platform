package com.mentorship.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mentorship.custom_exceptions.ApiException;
import com.mentorship.dtos.VideoLectureDTO;
import com.mentorship.entities.Mentor;
import com.mentorship.entities.VideoLecture;
import com.mentorship.repository.MentorRepository;
import com.mentorship.repository.VideoLectureRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class VideoLibraryServiceImpl implements VideoLibraryService {

    private final VideoLectureRepository videoLectureRepository;
    private final MentorRepository mentorRepository;

    @Override
    public VideoLectureDTO createVideo(Long mentorId, String title, String description, String subject, String videoUrl, String thumbnailUrl, String duration) {
        if (title == null || title.trim().isEmpty()) {
            throw new ApiException("Title is required");
        }
        if (videoUrl == null || videoUrl.trim().isEmpty()) {
            throw new ApiException("Video URL is required");
        }

        Mentor mentor = mentorRepository.findById(mentorId)
                .orElseThrow(() -> new ApiException("Mentor not found"));

        VideoLecture lecture = new VideoLecture();
        lecture.setMentor(mentor);
        lecture.setTitle(title.trim());
        lecture.setDescription(description != null ? description.trim() : null);
        lecture.setSubject(subject != null ? subject.trim() : null);
        lecture.setVideoUrl(videoUrl.trim());
        lecture.setThumbnailUrl(thumbnailUrl != null ? thumbnailUrl.trim() : null);
        lecture.setDuration(duration != null ? duration.trim() : null);

        return toDto(videoLectureRepository.save(lecture));
    }

    @Override
    public VideoLectureDTO updateVideo(Long mentorId, Long id, String title, String description, String subject, String videoUrl, String thumbnailUrl, String duration) {
        VideoLecture lecture = videoLectureRepository.findById(id)
                .orElseThrow(() -> new ApiException("Video lecture not found"));

        if (!lecture.getMentor().getMentorId().equals(mentorId)) {
            throw new ApiException("Unauthorized access");
        }

        if (title != null && !title.trim().isEmpty()) {
            lecture.setTitle(title.trim());
        }
        if (description != null) {
            lecture.setDescription(description.trim());
        }
        if (subject != null) {
            lecture.setSubject(subject.trim());
        }
        if (videoUrl != null) {
            lecture.setVideoUrl(videoUrl.trim());
        }
        if (thumbnailUrl != null) {
            lecture.setThumbnailUrl(thumbnailUrl.trim());
        }
        if (duration != null) {
            lecture.setDuration(duration.trim());
        }

        return toDto(videoLectureRepository.save(lecture));
    }

    @Override
    public void deleteVideo(Long mentorId, Long id) {
        VideoLecture lecture = videoLectureRepository.findById(id)
                .orElseThrow(() -> new ApiException("Video lecture not found"));

        if (!lecture.getMentor().getMentorId().equals(mentorId)) {
            throw new ApiException("Unauthorized access");
        }

        videoLectureRepository.delete(lecture);
    }

    @Override
    public List<VideoLectureDTO> getVideos() {
        return videoLectureRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public VideoLectureDTO getVideo(Long id) {
        return toDto(videoLectureRepository.findById(id)
                .orElseThrow(() -> new ApiException("Video lecture not found")));
    }

    @Override
    public List<VideoLectureDTO> getMentorVideos(Long mentorId) {
        return videoLectureRepository.findByMentor_MentorIdOrderByCreatedAtDesc(mentorId).stream().map(this::toDto).collect(Collectors.toList());
    }

    private VideoLectureDTO toDto(VideoLecture lecture) {
        return VideoLectureDTO.builder()
                .id(lecture.getId())
                .title(lecture.getTitle())
                .description(lecture.getDescription())
                .mentorId(lecture.getMentor().getMentorId())
                .mentorName(lecture.getMentor().getUserDetails().getFirstName() + " " + lecture.getMentor().getUserDetails().getLastName())
                .subject(lecture.getSubject())
                .videoUrl(lecture.getVideoUrl())
                .thumbnailUrl(lecture.getThumbnailUrl())
                .duration(lecture.getDuration())
                .createdAt(lecture.getCreatedAt())
                .updatedAt(lecture.getUpdatedAt())
                .uploadDate(lecture.getUploadDate())
                .build();
    }
}
