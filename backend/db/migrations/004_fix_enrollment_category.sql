
-- Fix the existing enrollment announcement category
UPDATE announcements
SET category = 'Announcement',
    updated_at = NOW()
WHERE title = 'Enrollment for A.Y. 2026-2027 is Now Open'
  AND category = 'Enrollment';
