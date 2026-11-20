-- Seed sample announcements only when the table is empty
INSERT INTO announcements (title, category, summary, content, image_url, published_at, is_published)
SELECT * FROM (VALUES
  (
    'Enrollment for A.Y. 2026-2027 is Now Open',
    'Enrollment',
    'Enrollment for A.Y. 2026-2027 is now officially open. Enroll now and secure your future!',
    E'Enrollment for Academic Year 2026-2027 is now officially open!\n\nWe are excited to welcome both new and returning students. Please prepare the following requirements:\n• Form 138 / Report Card\n• PSA Birth Certificate\n• Certificate of Good Moral Character\n• 2x2 ID pictures\n\nVisit the Registrar''s Office or use the online enrollment portal to complete your registration.',
    'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80',
    '2026-09-15T08:00:00Z'::timestamptz,
    TRUE
  ),
  (
    'College Intramurals Schedule',
    'Event',
    'Get ready for exciting games and activities in the upcoming college intramurals!',
    E'Get ready for our upcoming College Intramurals!\n\nStudents are invited to participate in the scheduled sports competitions and college activities.\n\nPlease wait for the official announcement of the event venue, team assignments, and complete schedule.',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba6851?w=800&q=80',
    '2026-09-10T08:00:00Z'::timestamptz,
    TRUE
  ),
  (
    'System Maintenance',
    'News',
    'System maintenance will improve performance. Thank you for your patience!',
    E'Scheduled System Maintenance\n\nThe College Management System will undergo maintenance to improve performance and reliability.\n\nExpected downtime: September 8, 2026 • 10:00 PM – 2:00 AM\n\nDuring this period, some modules may be temporarily unavailable.',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
    '2026-09-08T08:00:00Z'::timestamptz,
    TRUE
  )
) AS v(title, category, summary, content, image_url, published_at, is_published)
WHERE NOT EXISTS (SELECT 1 FROM announcements LIMIT 1);
