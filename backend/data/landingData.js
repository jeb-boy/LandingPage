const college = {
  name: "IDSC",
  fullName: "Infotech Development System College",
  tagline: "Building better futures through quality education.",
  description: "Infotech Development System College is a leading educational institution committed to providing quality education and developing competent, innovation and responsible individuals.",
  address: "Natera St., Dunao, Ligao City, 4504",
  email: "idscollegesinc@gmail.com",
  phone: "09178812638",
  mission: "To provide quality education for personal and community development.",
  vision: "To produce skilled and responsible graduates who help their communities.",
  goals: [
    "Promote community development.",
    "Provide quality education.",
    "Develop future leaders.",
    "Encourage community involvement"
  ]
};

const modules = [
  {
    id: "registrar",
    name: "Registrar",
    description: "Student records & enrollment",
    path: "/registrar",
    icon: "user"
  },
  {
    id: "library",
    name: "Library",
    description: "Books & resources",
    path: "/library",
    icon: "book"
  },
  {
    id: "student-portal",
    name: "Student Portal",
    description: "Grades & student services",
    path: "/student-portal",
    icon: "graduation-cap"
  },
  {
    id: "finance",
    name: "Finance",
    description: "Tuition & payments",
    path: "/finance",
    icon: "wallet"
  },
  {
    id: "faculty",
    name: "Faculty",
    description: "Faculty portal & tools",
    path: "/faculty",
    icon: "users"
  },
  {
    id: "clinic",
    name: "Clinic",
    description: "Health services",
    path: "/clinic",
    icon: "heart"
  },
  {
    id: "inventory",
    name: "Inventory",
    description: "Supplies & equipment",
    path: "/inventory",
    icon: "boxes"
  }
];

const announcements = [
  {
    id: "ANN-001",
    title: "Enrollment for A.Y. 2026-2027 is now open",
    category: "Announcement",
    date: "2026-09-15",
    summary: "Enrollment for A.Y. 2026-2027 is now officially open. Enroll now and secure your future!",
    content: "Enrollment for Academic Year 2026-2027 is now officially open!\n\nWe are excited to welcome both new and returning students. Please prepare the following requirements:\n• Form 138 / Report Card\n• PSA Birth Certificate\n• Certificate of Good Moral Character\n• 2x2 ID pictures\n\nVisit the Registrar's Office or use the online enrollment portal to complete your registration. Limited slots available for some programs.\n\nFor more information, contact the Registrar's Office.",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80",
    featured: true,
    status: "Published"
  },
  {
    id: "ANN-002",
    title: "College Intramurals Schedule",
    category: "Event",
    date: "2026-09-10",
    summary: "Get ready for exciting games and activities in the upcoming college intramurals!",
    content: "Get ready for our upcoming College Intramurals!\n\nStudents are invited to participate in the scheduled sports competitions and college activities.\n\nPlease wait for the official announcement of the event venue, team assignments, and complete schedule.\n\nFor more information and updates, stay tuned to the college's official pages.",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80",
    featured: true,
    status: "Published"
  },
  {
    id: "ANN-003",
    title: "System Maintenance",
    category: "News",
    date: "2026-09-08",
    summary: "System maintenance will improve performance. Thank you for your patience!",
    content: "Scheduled System Maintenance\n\nThe College Management System will undergo maintenance to improve performance and reliability.\n\nExpected downtime: September 8, 2026 • 10:00 PM – 2:00 AM\n\nDuring this period, some modules may be temporarily unavailable. We apologize for any inconvenience and appreciate your understanding.\n\nThank you for your patience!",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80",
    featured: false,
    status: "Published"
  }
];

const featured = [
  {
    id: "FEATURE-001",
    title: "Welcome to INFOTECH DEVELOPMENT SYSTEM COLLEGE",
    description: "Building better futures through quality education.",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80",
    link: "/modules"
  }
];

module.exports = { college, modules, announcements, featured };
