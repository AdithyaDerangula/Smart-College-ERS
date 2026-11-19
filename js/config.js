/**
 * Smart College ERS - Configuration File
 * 
 * Instructions:
 * When you have your Supabase credentials:
 * 1. Replace 'YOUR_SUPABASE_URL' with your Project URL (e.g. https://xyzcompany.supabase.co)
 * 2. Replace 'YOUR_SUPABASE_ANON_KEY' with your Project Anon / Public API Key
 */

const isInsidePagesFolder = typeof window !== 'undefined' && window.location.pathname.includes('/pages/');

const CONFIG = {
  SUPABASE_URL: "https://reaqehftqpgvpmghnsqc.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_ST9DWW0wpcCh8fx8IJdQdg_sicCd_OQ",

  // Application routing paths with context-aware relative paths
  ROUTES: {
    LOGIN: isInsidePagesFolder ? "../index.html" : "index.html",
    HOME: isInsidePagesFolder ? "home.html" : "pages/home.html",
    STUDENT_DASHBOARD: isInsidePagesFolder ? "student-dashboard.html" : "pages/student-dashboard.html",
    STUDENT_MARKS: isInsidePagesFolder ? "student-marks.html" : "pages/student-marks.html",
    FACULTY_DASHBOARD: isInsidePagesFolder ? "faculty-dashboard.html" : "pages/faculty-dashboard.html",
    FACULTY_STUDENTS: isInsidePagesFolder ? "faculty-students.html" : "pages/faculty-students.html",
    FACULTY_STUDENT_EDIT: isInsidePagesFolder ? "faculty-student-edit.html" : "pages/faculty-student-edit.html",
    FACULTY_ANNOUNCEMENTS: isInsidePagesFolder ? "faculty-announcements.html" : "pages/faculty-announcements.html",
    FACULTY_REGISTER: isInsidePagesFolder ? "faculty-register.html" : "pages/faculty-register.html",
    ABOUT: isInsidePagesFolder ? "about.html" : "pages/about.html"
  },

  // Fallback demo mock credentials when Supabase credentials have not yet been provided
  ENABLE_MOCK_FALLBACK: true,
  MOCK_ACCOUNTS: {
    student: {
      pin: "22481A4201",
      password: "password123",
      name: "Alexander Vance",
      department: "Computer Science & Engineering",
      email: "student.vance@college.edu"
    },
    faculty: {
      email: "m.vance@engineering.college.edu",
      password: "password123",
      name: "Dr. Marcus Vance",
      department: "Computer Science & Engineering",
      designation: "Head of Department"
    }
  }
};

window.CONFIG = CONFIG;
