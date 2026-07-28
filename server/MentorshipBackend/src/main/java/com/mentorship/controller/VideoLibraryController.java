package com.mentorship.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mentorship.dtos.ApiResponseDTO;
import com.mentorship.dtos.VideoLectureDTO;
import com.mentorship.service.VideoLibraryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class VideoLibraryController {

    private final VideoLibraryService videoLibraryService;

    @PostMapping("/mentor/videos")
    public ResponseEntity<ApiResponseDTO<VideoLectureDTO>> createVideo(@RequestParam Long mentorId,
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String subject,
            @RequestParam String videoUrl,
            @RequestParam(required = false) String thumbnailUrl,
            @RequestParam(required = false) String duration) {
        return ResponseEntity.ok(ApiResponseDTO.success("Video created", videoLibraryService.createVideo(mentorId, title, description, subject, videoUrl, thumbnailUrl, duration)));
    }

    @PutMapping("/mentor/videos/{id}")
    public ResponseEntity<ApiResponseDTO<VideoLectureDTO>> updateVideo(@PathVariable Long id,
            @RequestParam Long mentorId,
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String videoUrl,
            @RequestParam(required = false) String thumbnailUrl,
            @RequestParam(required = false) String duration) {
        return ResponseEntity.ok(ApiResponseDTO.success("Video updated", videoLibraryService.updateVideo(mentorId, id, title, description, subject, videoUrl, thumbnailUrl, duration)));
    }

    @DeleteMapping("/mentor/videos/{id}")
    public ResponseEntity<ApiResponseDTO<Void>> deleteVideo(@PathVariable Long id, @RequestParam Long mentorId) {
        videoLibraryService.deleteVideo(mentorId, id);
        return ResponseEntity.ok(ApiResponseDTO.success("Video deleted", null));
    }

    @GetMapping("/videos")
    public ResponseEntity<ApiResponseDTO<List<VideoLectureDTO>>> getVideos() {
        return ResponseEntity.ok(ApiResponseDTO.success(videoLibraryService.getVideos()));
    }

    @GetMapping("/videos/{id}")
    public ResponseEntity<ApiResponseDTO<VideoLectureDTO>> getVideo(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponseDTO.success(videoLibraryService.getVideo(id)));
    }

    @GetMapping("/mentor/videos/{mentorId}")
    public ResponseEntity<ApiResponseDTO<List<VideoLectureDTO>>> getMentorVideos(@PathVariable Long mentorId) {
        return ResponseEntity.ok(ApiResponseDTO.success(videoLibraryService.getMentorVideos(mentorId)));
    }
}
