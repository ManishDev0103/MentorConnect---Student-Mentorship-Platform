-- Add optional social media fields to mentors without affecting existing data
ALTER TABLE mentors
  ADD COLUMN github_url VARCHAR(255),
  ADD COLUMN twitter_url VARCHAR(255);
