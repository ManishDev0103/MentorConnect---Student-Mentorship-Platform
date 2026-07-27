-- Fix resume column to support larger files (up to 4GB)
USE mentorship;

-- Alter the resume column to LONGBLOB
ALTER TABLE mentors MODIFY COLUMN resume LONGBLOB;

-- Verify the change
DESCRIBE mentors;
