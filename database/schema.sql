-- ==============================================================================
-- SMART COLLEGE ERS (Education Record System) - SUPABASE MASTER DATABASE SETUP
-- Paste this entire script into Supabase: Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. CLEAN START: Remove any conflicting old tables
DROP TABLE IF EXISTS public.student_marks CASCADE;
DROP TABLE IF EXISTS public.announcements CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.faculty CASCADE;

-- 2. CREATE TABLES

-- A. STUDENTS TABLE (User ID = Roll Number, Password = Roll Number)
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pin TEXT UNIQUE NOT NULL,                          -- e.g. '22481A4201'
    name TEXT NOT NULL,                                -- e.g. 'Alexander Vance'
    email TEXT UNIQUE NOT NULL,                        -- e.g. 'student.vance@college.edu'
    department TEXT NOT NULL DEFAULT 'Computer Science & Engineering',
    semester INTEGER NOT NULL DEFAULT 5,
    section TEXT NOT NULL DEFAULT 'Section B',
    attendance NUMERIC(4,1) NOT NULL DEFAULT 86.5,
    cgpa NUMERIC(4,2) NOT NULL DEFAULT 8.92,
    password TEXT NOT NULL,                            -- Roll number as password
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- B. FACULTY TABLE
CREATE TABLE public.faculty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id TEXT UNIQUE NOT NULL,                  -- e.g. 'FAC-CSE-001'
    name TEXT NOT NULL,                               -- e.g. 'Dr. Marcus Vance'
    email TEXT UNIQUE NOT NULL,                       -- e.g. 'm.vance@engineering.college.edu'
    department TEXT NOT NULL DEFAULT 'Computer Science & Engineering',
    designation TEXT NOT NULL DEFAULT 'Head of Department',
    password TEXT NOT NULL DEFAULT 'password123',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- C. SUBJECT MARKS & ATTENDANCE TABLE
CREATE TABLE public.student_marks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_pin TEXT NOT NULL REFERENCES public.students(pin) ON DELETE CASCADE,
    semester INTEGER NOT NULL,                         -- 1 to 6
    code TEXT NOT NULL,                                -- e.g. 'CS501'
    title TEXT NOT NULL,                               -- e.g. 'Advanced Operating Systems'
    attended_classes NUMERIC(4,1) DEFAULT 42,
    total_classes NUMERIC(4,1) DEFAULT 46,
    ut1 NUMERIC(4,1) DEFAULT 23.5,                     -- Unit Test 1 (max 25)
    ut2 NUMERIC(4,1) DEFAULT 24.0,                     -- Unit Test 2 (max 25)
    lab NUMERIC(4,1) DEFAULT 24.5,                     -- Lab / Practical (max 25)
    end_sem NUMERIC(4,1) DEFAULT 92.0,                 -- End Sem Exam (max 100)
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- D. CIRCULAR ANNOUNCEMENTS TABLE
CREATE TABLE public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,                            -- 'Department Announcements' or 'University Announcements'
    title TEXT NOT NULL,
    target TEXT DEFAULT 'All Students',
    matter TEXT NOT NULL,
    author TEXT NOT NULL DEFAULT 'Dr. Marcus Vance (Head of Department)',
    date TEXT NOT NULL DEFAULT 'Today',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. GRANT TABLE PERMISSIONS TO POSTGREST ROLES (anon, authenticated, service_role)
-- Fixes "Database error: permission denied for table students"
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.students TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.faculty TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.student_marks TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.announcements TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public full access on students" ON public.students;
CREATE POLICY "Public full access on students" ON public.students FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on faculty" ON public.faculty;
CREATE POLICY "Public full access on faculty" ON public.faculty FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on student_marks" ON public.student_marks;
CREATE POLICY "Public full access on student_marks" ON public.student_marks FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on announcements" ON public.announcements;
CREATE POLICY "Public full access on announcements" ON public.announcements FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- 5. INITIAL SEED DATA

-- Seed Students (Roll Number = User ID, Password = Roll Number)
INSERT INTO public.students (pin, name, email, department, semester, section, attendance, cgpa, password)
VALUES
('22481A4201', 'Alexander Vance', 'student.vance@college.edu', 'Computer Science & Engineering', 5, 'Section B', 86.5, 8.92, '22481A4201'),
('22481A4202', 'Beatrice Miller', 'b.miller@college.edu', 'Computer Science & Engineering', 5, 'Section B', 92.0, 9.15, '22481A4202'),
('22481A4203', 'Charles Chen', 'c.chen@college.edu', 'Computer Science & Engineering', 5, 'Section B', 74.2, 7.80, '22481A4203'),
('22481A4204', 'Diana Prince', 'd.prince@college.edu', 'Computer Science & Engineering', 5, 'Section B', 88.5, 8.70, '22481A4204'),
('22481A4205', 'Ethan Hunt', 'e.hunt@college.edu', 'Computer Science & Engineering', 5, 'Section B', 95.0, 9.40, '22481A4205'),
('22481A4206', 'Fiona Gallagher', 'f.gallagher@college.edu', 'Computer Science & Engineering', 5, 'Section B', 81.0, 8.25, '22481A4206');

-- Seed Faculty
INSERT INTO public.faculty (faculty_id, name, email, department, designation, password)
VALUES
('FAC-CSE-001', 'Dr. Marcus Vance', 'm.vance@engineering.college.edu', 'Computer Science & Engineering', 'Head of Department', 'password123'),
('FAC-CSE-002', 'Dr. Sarah Lin', 's.lin@engineering.college.edu', 'Computer Science & Engineering', 'Associate Professor', 'password123');

-- Seed Semester 5 Courses for Alexander Vance (22481A4201)
INSERT INTO public.student_marks (student_pin, semester, code, title, attended_classes, total_classes, ut1, ut2, lab, end_sem)
VALUES
('22481A4201', 5, 'CS501', 'Advanced Operating Systems & Virtualization', 42, 46, 23.5, 24.0, 24.5, 92.0),
('22481A4201', 5, 'CS502', 'Web Technologies & Full Stack Architecture', 44, 48, 24.0, 23.5, 25.0, 94.0),
('22481A4201', 5, 'CS503', 'Compiler Design & Code Generation', 36, 42, 21.0, 22.0, 22.5, 84.0),
('22481A4201', 5, 'CS504', 'Cryptography & Network Security', 31, 42, 20.0, 21.0, 22.0, 80.0),
('22481A4201', 5, 'CS505', 'Artificial Intelligence & Expert Systems', 39, 44, 22.5, 23.0, 24.0, 88.0),
('22481A4201', 5, 'CS506', 'Distributed Cloud Computing Lab', 22, 24, 24.5, 25.0, 25.0, 96.0);

-- Seed Circular Announcements
INSERT INTO public.announcements (category, title, target, matter, author, date)
VALUES
('Department Announcements', 'Unit Test II Syllabus Freezing & Question Bank Upload', 'CSE - Semesters 3, 5 & 7', 'Chapters 3 and 4 have been finalized for Unit Test II. Recommended numerical problem sets and reference solutions are now indexed in the digital course catalog repository.', 'Dr. Marcus Vance (Head of Department)', 'Today at 09:30 AM'),
('Department Announcements', 'Submission Deadline Extension: Cryptography Project Milestone 1', 'CSE III Year - Section B', 'The submission deadline for SHA-256 implementation reports has been extended by 48 hours to Thursday 23:59 EST. Please upload your project repository links through the portal.', 'Prof. Marcus Thorne (Associate Chair)', 'Yesterday at 04:15 PM'),
('University Announcements', 'Fall Term Final Examination Schedule & Examination Center Allocation', 'All Engineering Branches', 'The University Registry has finalized the room allocations and date-sheets for all Engineering semester exams. Admittance requires valid student credentials and verified hall ticket.', 'Controller of Examinations', 'Oct 24, 2025'),
('University Announcements', 'Central Computing Facility (CCF) Server Maintenance', 'Campus-Wide', 'Scheduled firmware updates on campus blade servers will occur this Saturday from 22:00 to 02:00 EST. Institutional Wi-Fi will experience intermittent routing delays.', 'Campus IT Infrastructure Division', 'Oct 22, 2025');
