-- Add demo video columns to mentors table
ALTER TABLE mentors
  ADD COLUMN demo_video LONGBLOB,
  ADD COLUMN demo_video_file_name VARCHAR(255),
  ADD COLUMN demo_video_content_type VARCHAR(100),
  ADD COLUMN demo_video_description VARCHAR(500);
