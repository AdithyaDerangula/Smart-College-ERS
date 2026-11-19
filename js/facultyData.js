/**
 * Smart College ERS - Unified Faculty & Student Data Service
 * Live Supabase synchronization for Students, Marks, and Circular Announcements
 * with resilient local caching and instantaneous zero-lag UI updates.
 */

(function () {
  const STORAGE_KEY_STUDENTS = 'ers_faculty_students_list';
  const STORAGE_KEY_MARKS = 'ers_faculty_student_marks';
  const STORAGE_KEY_ANNOUNCEMENTS = 'ers_faculty_announcements_list';
  const STORAGE_KEY_FACULTY = 'ers_faculty_registered_list';

  // Initial Seed Students (User ID = Roll Number, Password = Roll Number)
  const defaultStudents = [
    {
      pin: "22481A4201",
      name: "Alexander Vance",
      department: "Computer Science & Engineering",
      semester: 5,
      section: "Section B",
      email: "student.vance@college.edu",
      attendance: 86.5,
      cgpa: 8.92,
      password: "22481A4201"
    },
    {
      pin: "22481A4202",
      name: "Beatrice Miller",
      department: "Computer Science & Engineering",
      semester: 5,
      section: "Section B",
      email: "b.miller@college.edu",
      attendance: 92.0,
      cgpa: 9.15,
      password: "22481A4202"
    },
    {
      pin: "22481A4203",
      name: "Charles Chen",
      department: "Computer Science & Engineering",
      semester: 5,
      section: "Section B",
      email: "c.chen@college.edu",
      attendance: 74.2,
      cgpa: 7.80,
      password: "22481A4203"
    },
    {
      pin: "22481A4204",
      name: "Diana Prince",
      department: "Computer Science & Engineering",
      semester: 5,
      section: "Section B",
      email: "d.prince@college.edu",
      attendance: 88.5,
      cgpa: 8.70,
      password: "22481A4204"
    },
    {
      pin: "22481A4205",
      name: "Ethan Hunt",
      department: "Computer Science & Engineering",
      semester: 5,
      section: "Section B",
      email: "e.hunt@college.edu",
      attendance: 95.0,
      cgpa: 9.40,
      password: "22481A4205"
    },
    {
      pin: "22481A4206",
      name: "Fiona Gallagher",
      department: "Computer Science & Engineering",
      semester: 5,
      section: "Section B",
      email: "f.gallagher@college.edu",
      attendance: 81.0,
      cgpa: 8.25,
      password: "22481A4206"
    }
  ];

  // Initial Seed Faculty Accounts
  const defaultFaculty = [
    {
      name: "Dr. Marcus Vance",
      email: "m.vance@engineering.college.edu",
      department: "Computer Science & Engineering",
      designation: "Head of Department",
      faculty_id: "FAC-CSE-001",
      password: "password123"
    },
    {
      name: "Dr. Sarah Lin",
      email: "s.lin@engineering.college.edu",
      department: "Computer Science & Engineering",
      designation: "Associate Professor",
      faculty_id: "FAC-CSE-002",
      password: "password123"
    }
  ];

  // Default Course Templates by Semester
  const defaultCourseTemplates = {
    1: [
      { code: "MA101", title: "Linear Algebra & Calculus", totalClasses: 45, attendedClasses: 40, ut1: 23, ut2: 22, lab: 24, end: 88 },
      { code: "PH101", title: "Applied Physics", totalClasses: 45, attendedClasses: 39, ut1: 22, ut2: 23, lab: 23, end: 84 },
      { code: "CS101", title: "Problem Solving & C Programming", totalClasses: 50, attendedClasses: 47, ut1: 24, ut2: 24, lab: 25, end: 92 },
      { code: "EE101", title: "Basic Electrical Engineering", totalClasses: 40, attendedClasses: 35, ut1: 21, ut2: 20, lab: 22, end: 81 },
      { code: "EN101", title: "Technical English Communication", totalClasses: 35, attendedClasses: 32, ut1: 20, ut2: 21, lab: 23, end: 79 }
    ],
    2: [
      { code: "MA201", title: "Differential Equations & Numerical Methods", totalClasses: 45, attendedClasses: 41, ut1: 23, ut2: 24, lab: 23, end: 87 },
      { code: "CS201", title: "Data Structures using C++", totalClasses: 50, attendedClasses: 48, ut1: 24, ut2: 25, lab: 25, end: 94 },
      { code: "EC201", title: "Digital Logic & Computer Organization", totalClasses: 45, attendedClasses: 39, ut1: 22, ut2: 22, lab: 23, end: 85 },
      { code: "CH201", title: "Environmental Science & Chemistry", totalClasses: 40, attendedClasses: 36, ut1: 21, ut2: 22, lab: 22, end: 80 }
    ],
    3: [
      { code: "MA301", title: "Discrete Mathematical Structures", totalClasses: 45, attendedClasses: 39, ut1: 22, ut2: 21, lab: 23, end: 82 },
      { code: "CS301", title: "Object Oriented Programming via Java", totalClasses: 50, attendedClasses: 46, ut1: 24, ut2: 23, lab: 25, end: 90 },
      { code: "CS302", title: "Computer Architecture & Organization", totalClasses: 45, attendedClasses: 40, ut1: 21, ut2: 22, lab: 22, end: 84 },
      { code: "CS304", title: "Principles of Operating Systems", totalClasses: 45, attendedClasses: 41, ut1: 23, ut2: 23, lab: 24, end: 88 }
    ],
    4: [
      { code: "CS401", title: "Design & Analysis of Algorithms", totalClasses: 50, attendedClasses: 46, ut1: 24, ut2: 23, lab: 24, end: 91 },
      { code: "CS402", title: "Database Management Systems", totalClasses: 50, attendedClasses: 47, ut1: 24, ut2: 24, lab: 25, end: 93 },
      { code: "CS403", title: "Computer Networks & Protocols", totalClasses: 45, attendedClasses: 40, ut1: 23, ut2: 23, lab: 23, end: 87 },
      { code: "CS404", title: "Software Engineering Methodologies", totalClasses: 45, attendedClasses: 41, ut1: 22, ut2: 23, lab: 23, end: 86 }
    ],
    5: [
      { code: "CS501", title: "Advanced Operating Systems & Virtualization", totalClasses: 46, attendedClasses: 42, ut1: 23.5, ut2: 24.0, lab: 24.5, end: 92.0 },
      { code: "CS502", title: "Web Technologies & Full Stack Architecture", totalClasses: 48, attendedClasses: 44, ut1: 24.0, ut2: 23.5, lab: 25.0, end: 94.0 },
      { code: "CS503", title: "Compiler Design & Code Generation", totalClasses: 42, attendedClasses: 36, ut1: 21.0, ut2: 22.0, lab: 22.5, end: 84.0 },
      { code: "CS504", title: "Cryptography & Network Security", totalClasses: 42, attendedClasses: 31, ut1: 20.0, ut2: 21.0, lab: 22.0, end: 80.0 },
      { code: "CS505", title: "Artificial Intelligence & Expert Systems", totalClasses: 44, attendedClasses: 39, ut1: 22.5, ut2: 23.0, lab: 24.0, end: 88.0 },
      { code: "CS506", title: "Distributed Cloud Computing Lab", totalClasses: 24, attendedClasses: 22, ut1: 24.5, ut2: 25.0, lab: 25.0, end: 96.0 }
    ],
    6: [
      { code: "CS601", title: "Machine Learning & Pattern Recognition", totalClasses: 40, attendedClasses: 36, ut1: 23.0, ut2: 22.0, lab: 24.0, end: 89.0 },
      { code: "CS602", title: "Cloud Computing & DevOps Pipelines", totalClasses: 40, attendedClasses: 38, ut1: 24.0, ut2: 23.0, lab: 24.5, end: 92.0 },
      { code: "CS603", title: "Big Data Analytics & Hadoop Ecosystem", totalClasses: 38, attendedClasses: 33, ut1: 22.0, ut2: 21.0, lab: 23.0, end: 86.0 },
      { code: "CS604", title: "Mobile Application Development", totalClasses: 38, attendedClasses: 35, ut1: 23.5, ut2: 22.5, lab: 24.0, end: 90.0 }
    ]
  };

  // Initial Announcements
  const defaultAnnouncements = [
    {
      id: "ann-1",
      category: "Department Announcements",
      title: "Unit Test II Syllabus Freezing & Question Bank Upload",
      target: "CSE - Semesters 3, 5 & 7",
      matter: "Chapters 3 and 4 have been finalized for Unit Test II. Recommended numerical problem sets and reference solutions are now indexed in the digital course catalog repository.",
      author: "Dr. Marcus Vance (Head of Department)",
      date: "Today at 09:30 AM"
    },
    {
      id: "ann-2",
      category: "Department Announcements",
      title: "Submission Deadline Extension: Cryptography Project Milestone 1",
      target: "CSE III Year - Section B",
      matter: "The submission deadline for SHA-256 implementation reports has been extended by 48 hours to Thursday 23:59 EST. Please upload your project repository links through the portal.",
      author: "Prof. Marcus Thorne (Associate Chair)",
      date: "Yesterday at 04:15 PM"
    },
    {
      id: "ann-3",
      category: "University Announcements",
      title: "Fall Term Final Examination Schedule & Examination Center Allocation",
      target: "All Engineering Branches",
      matter: "The University Registry has finalized the room allocations and date-sheets for all Engineering semester exams. Admittance requires valid student credentials and verified hall ticket.",
      author: "Controller of Examinations",
      date: "Oct 24, 2025"
    },
    {
      id: "ann-4",
      category: "University Announcements",
      title: "Central Computing Facility (CCF) Server Maintenance",
      target: "Campus-Wide",
      matter: "Scheduled firmware updates on campus blade servers will occur this Saturday from 22:00 to 02:00 EST. Institutional Wi-Fi will experience intermittent routing delays.",
      author: "Campus IT Infrastructure Division",
      date: "Oct 22, 2025"
    }
  ];

  class FacultyDataManager {
    constructor() {
      this.initStorage();
      // Asynchronously fetch live data from Supabase if client is ready
      setTimeout(() => this.syncFromSupabase(), 100);
    }

    getSupabase() {
      return window.authService?.client || null;
    }

    initStorage() {
      if (!localStorage.getItem(STORAGE_KEY_STUDENTS)) {
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(defaultStudents));
      }
      if (!localStorage.getItem(STORAGE_KEY_FACULTY)) {
        localStorage.setItem(STORAGE_KEY_FACULTY, JSON.stringify(defaultFaculty));
      }
      if (!localStorage.getItem(STORAGE_KEY_ANNOUNCEMENTS)) {
        localStorage.setItem(STORAGE_KEY_ANNOUNCEMENTS, JSON.stringify(defaultAnnouncements));
      }
      if (!localStorage.getItem(STORAGE_KEY_MARKS)) {
        // Seed default marks for 22481A4201
        const initialMarksMap = {
          "22481A4201_5": defaultCourseTemplates[5]
        };
        localStorage.setItem(STORAGE_KEY_MARKS, JSON.stringify(initialMarksMap));
      }
    }

    async syncFromSupabase() {
      const client = this.getSupabase();
      if (!client) return;

      try {
        await Promise.all([
          this.fetchStudentsFromSupabase(),
          this.fetchAnnouncementsFromSupabase()
        ]);
      } catch (err) {
        console.warn("[FacultyData] Background sync from Supabase notice:", err);
      }
    }

    async fetchStudentsFromSupabase() {
      const client = this.getSupabase();
      if (!client) return this.getStudents();

      try {
        const { data, error } = await client
          .from('students')
          .select('*')
          .order('pin', { ascending: true });

        if (error) throw error;

        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(s => ({
            pin: s.pin,
            name: s.name,
            email: s.email,
            department: s.department,
            semester: s.semester,
            section: s.section,
            attendance: parseFloat(s.attendance) || 85.0,
            cgpa: parseFloat(s.cgpa) || 8.50,
            password: s.password || s.pin
          }));
          localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(mapped));
          this.notifyChange('students');
          return mapped;
        }
      } catch (err) {
        console.warn("Could not fetch students from Supabase:", err);
      }
      return this.getStudents();
    }

    async fetchAnnouncementsFromSupabase() {
      const client = this.getSupabase();
      if (!client) return this.getAnnouncements();

      try {
        const { data, error } = await client
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(a => ({
            id: a.id,
            category: a.category,
            title: a.title,
            target: a.target,
            matter: a.matter,
            author: a.author,
            date: a.date
          }));
          localStorage.setItem(STORAGE_KEY_ANNOUNCEMENTS, JSON.stringify(mapped));
          this.notifyChange('announcements');
          return mapped;
        }
      } catch (err) {
        console.warn("Could not fetch announcements from Supabase:", err);
      }
      return this.getAnnouncements();
    }

    // ================= STUDENT METHODS =================

    getStudents() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_STUDENTS);
        return raw ? JSON.parse(raw) : defaultStudents;
      } catch {
        return defaultStudents;
      }
    }

    getStudentByPin(pin) {
      if (!pin) return null;
      const cleanPin = pin.trim().toUpperCase();
      const students = this.getStudents();
      return students.find(s => s.pin.toUpperCase() === cleanPin) || null;
    }

    async addStudent(studentData) {
      const { pin, name, department, semester, section, email, attendance, cgpa } = studentData;

      if (!pin || !name) {
        return { success: false, message: "Roll Number and Student Name are strictly required." };
      }

      const cleanPin = pin.trim().toUpperCase();
      const cleanEmail = (email || `${cleanPin.toLowerCase()}@college.edu`).trim().toLowerCase();
      const semNum = parseInt(semester, 10) || 5;
      const attNum = parseFloat(attendance) || 85.0;
      const cgpaNum = parseFloat(cgpa) || 8.50;

      const newStudent = {
        pin: cleanPin,
        name: name.trim(),
        department: department || "Computer Science & Engineering",
        semester: semNum,
        section: section || "Section B",
        email: cleanEmail,
        attendance: attNum,
        cgpa: cgpaNum,
        password: cleanPin // User ID is Roll Number, and Password is the SAME Roll Number!
      };

      // 1. Live Insertion to Supabase
      const client = this.getSupabase();
      if (client) {
        try {
          console.log(`[Supabase] Inserting student into public.students table: ${cleanPin}`);
          const { data, error } = await client
            .from('students')
            .insert([{
              pin: newStudent.pin,
              name: newStudent.name,
              email: newStudent.email,
              department: newStudent.department,
              semester: newStudent.semester,
              section: newStudent.section,
              attendance: newStudent.attendance,
              cgpa: newStudent.cgpa,
              password: newStudent.password
            }])
            .select()
            .single();

          if (error) {
            console.error("Supabase student insert error:", error);
            if (error.code === '23505') {
              return { success: false, message: `A student with Roll Number ${cleanPin} or email ${cleanEmail} already exists.` };
            }
            return { success: false, message: `Database error: ${error.message}` };
          }

          // Also insert initial semester courses into public.student_marks table
          const templateCourses = defaultCourseTemplates[semNum] || defaultCourseTemplates[5];
          const marksRows = templateCourses.map(c => ({
            student_pin: cleanPin,
            semester: semNum,
            code: c.code,
            title: c.title,
            attended_classes: c.attendedClasses,
            total_classes: c.totalClasses,
            ut1: c.ut1,
            ut2: c.ut2,
            lab: c.lab,
            end_sem: c.end
          }));

          try {
            await client.from('student_marks').insert(marksRows);
          } catch (mErr) {
            console.warn("Could not insert initial marks template to Supabase:", mErr);
          }

        } catch (err) {
          console.error("Failed to insert student into live Supabase:", err);
          return { success: false, message: err.message };
        }
      }

      // 2. Update Local Cache
      const students = this.getStudents();
      const existingIdx = students.findIndex(s => s.pin.toUpperCase() === cleanPin);
      if (existingIdx >= 0) {
        students[existingIdx] = newStudent;
      } else {
        students.push(newStudent);
      }
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));

      // Also set local default marks
      this.initDefaultMarksForStudent(cleanPin, semNum);

      this.notifyChange('students');
      return { success: true, student: newStudent };
    }

    initDefaultMarksForStudent(pin, sem) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_MARKS);
        const marksMap = raw ? JSON.parse(raw) : {};
        const key = `${pin}_${sem}`;
        if (!marksMap[key]) {
          const template = defaultCourseTemplates[sem] || defaultCourseTemplates[5];
          marksMap[key] = JSON.parse(JSON.stringify(template));
          localStorage.setItem(STORAGE_KEY_MARKS, JSON.stringify(marksMap));
        }
      } catch (e) {
        // ignore
      }
    }

    // ================= MARKS METHODS =================

    getStudentMarks(pin, semester) {
      if (!pin) return [];
      const cleanPin = pin.trim().toUpperCase();
      const semKey = `${cleanPin}_${semester}`;

      try {
        const raw = localStorage.getItem(STORAGE_KEY_MARKS);
        const marksMap = raw ? JSON.parse(raw) : {};
        if (marksMap[semKey]) {
          return marksMap[semKey];
        }
      } catch (e) {
        // ignore
      }

      // Default course template
      const fallback = defaultCourseTemplates[semester] || defaultCourseTemplates[5];
      return JSON.parse(JSON.stringify(fallback));
    }

    async saveStudentMarks(pin, semester, subjects) {
      if (!pin || !subjects) return { success: false };
      const cleanPin = pin.trim().toUpperCase();
      const semNum = parseInt(semester, 10);
      const semKey = `${cleanPin}_${semNum}`;

      // Calculate attendance and CGPA
      let totalAttended = 0;
      let totalConducted = 0;
      let totalPoints = 0;
      let countedSubjects = 0;

      subjects.forEach(sub => {
        totalAttended += parseFloat(sub.attendedClasses) || 0;
        totalConducted += parseFloat(sub.totalClasses) || 0;

        const ut1 = parseFloat(sub.ut1) || 0;
        const ut2 = parseFloat(sub.ut2) || 0;
        const lab = parseFloat(sub.lab) || 0;
        const end = parseFloat(sub.end) || 0;
        const total = Math.min(100, Math.round(((ut1 + ut2) / 2) + (lab * 0.4) + (end * 0.65)));
        let pts = 8;
        if (total >= 90) pts = 10;
        else if (total >= 80) pts = 9;
        else if (total >= 70) pts = 8;
        else if (total >= 60) pts = 7;
        else if (total >= 50) pts = 6;
        else if (total >= 40) pts = 5;
        else pts = 0;
        totalPoints += pts;
        countedSubjects++;
      });

      const newAttendance = totalConducted > 0 
        ? parseFloat(((totalAttended / totalConducted) * 100).toFixed(1)) 
        : 85.0;

      const semGpa = countedSubjects > 0 ? (totalPoints / countedSubjects) : 8.5;

      // 1. Live Update in Supabase
      const client = this.getSupabase();
      if (client) {
        try {
          console.log(`[Supabase] Saving marks for student ${cleanPin} - Semester ${semNum}`);
          // Delete old marks for this semester
          await client
            .from('student_marks')
            .delete()
            .ilike('student_pin', cleanPin)
            .eq('semester', semNum);

          // Insert updated subjects
          const rowsToInsert = subjects.map(s => ({
            student_pin: cleanPin,
            semester: semNum,
            code: s.code || 'CS',
            title: s.title || 'Course',
            attended_classes: parseFloat(s.attendedClasses) || 0,
            total_classes: parseFloat(s.totalClasses) || 1,
            ut1: parseFloat(s.ut1) || 0,
            ut2: parseFloat(s.ut2) || 0,
            lab: parseFloat(s.lab) || 0,
            end_sem: parseFloat(s.end) || 0
          }));

          await client.from('student_marks').insert(rowsToInsert);

          // Update student attendance and cgpa in public.students table
          await client
            .from('students')
            .update({
              attendance: newAttendance,
              cgpa: parseFloat(semGpa.toFixed(2))
            })
            .ilike('pin', cleanPin);

        } catch (dbErr) {
          console.error("Live Supabase marks update error:", dbErr);
        }
      }

      // 2. Update Local Cache
      try {
        const raw = localStorage.getItem(STORAGE_KEY_MARKS);
        const marksMap = raw ? JSON.parse(raw) : {};
        marksMap[semKey] = subjects;
        localStorage.setItem(STORAGE_KEY_MARKS, JSON.stringify(marksMap));
      } catch (e) {
        console.error("Local marks cache write error:", e);
      }

      // Update student metrics in local cache
      const students = this.getStudents();
      const student = students.find(s => s.pin.toUpperCase() === cleanPin);
      if (student) {
        student.attendance = newAttendance;
        student.cgpa = parseFloat(semGpa.toFixed(2));
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));

        // ZERO-LAG SYNC: If the currently active logged-in session is this student, update immediately!
        try {
          const sessionRaw = localStorage.getItem('smart_college_ers_user');
          if (sessionRaw) {
            const sessionUser = JSON.parse(sessionRaw);
            if (sessionUser && sessionUser.pin && sessionUser.pin.toUpperCase() === cleanPin) {
              sessionUser.attendance = student.attendance;
              sessionUser.cgpa = student.cgpa;
              localStorage.setItem('smart_college_ers_user', JSON.stringify(sessionUser));
            }
          }
        } catch (e) {
          console.warn("Session auto-sync notice:", e);
        }
      }

      this.notifyChange('marks');
      return { success: true };
    }

    // ================= FACULTY ACCOUNT METHODS =================

    getFacultyAccounts() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_FACULTY);
        return raw ? JSON.parse(raw) : defaultFaculty;
      } catch {
        return defaultFaculty;
      }
    }

    getFacultyByEmail(email) {
      if (!email) return null;
      const cleanEmail = email.trim().toLowerCase();
      const accounts = this.getFacultyAccounts();
      return accounts.find(f => f.email.toLowerCase() === cleanEmail) || null;
    }

    addFacultyAccount({ name, email, department, designation, password }) {
      const cleanEmail = email.trim().toLowerCase();
      const accounts = this.getFacultyAccounts();

      if (accounts.some(f => f.email.toLowerCase() === cleanEmail)) {
        return { success: false, message: `A faculty account with email ${cleanEmail} is already registered.` };
      }

      const count = accounts.length + 1;
      const newFaculty = {
        name: name.trim(),
        email: cleanEmail,
        department: department || "Computer Science & Engineering",
        designation: designation || "Assistant Professor",
        faculty_id: `FAC-${(department || 'CSE').substring(0,3).toUpperCase()}-00${count}`,
        password: password || "password123"
      };

      accounts.push(newFaculty);
      localStorage.setItem(STORAGE_KEY_FACULTY, JSON.stringify(accounts));
      this.notifyChange('faculty');
      return { success: true, faculty: newFaculty };
    }

    // ================= ANNOUNCEMENTS METHODS =================

    getAnnouncements() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_ANNOUNCEMENTS);
        return raw ? JSON.parse(raw) : defaultAnnouncements;
      } catch {
        return defaultAnnouncements;
      }
    }

    async addAnnouncement({ category, title, target, matter, author }) {
      if (!title || !matter) {
        return { success: false, message: "Please fill in both announcement title and matter." };
      }

      // Precise Real-Time Date & Time Stamp
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const preciseTimestamp = `${formattedDate} • ${formattedTime}`;

      const newAnn = {
        id: `ann-${Date.now()}`,
        category: category || "Department Announcements",
        title: title.trim(),
        target: target?.trim() || "All Students",
        matter: matter.trim(),
        author: author || "Dr. Marcus Vance (Head of Department)",
        date: preciseTimestamp
      };

      // 1. Live Insertion to Supabase
      const client = this.getSupabase();
      if (client) {
        try {
          console.log(`[Supabase] Publishing circular announcement: ${newAnn.title}`);
          const { data, error } = await client
            .from('announcements')
            .insert([{
              category: newAnn.category,
              title: newAnn.title,
              target: newAnn.target,
              matter: newAnn.matter,
              author: newAnn.author,
              date: newAnn.date
            }])
            .select()
            .single();

          if (error) {
            console.error("Supabase announcement insert error:", error);
          } else if (data && data.id) {
            newAnn.id = data.id;
          }
        } catch (err) {
          console.warn("Could not insert announcement to live Supabase:", err);
        }
      }

      // 2. Update Local Cache
      const announcements = this.getAnnouncements();
      announcements.unshift(newAnn);
      localStorage.setItem(STORAGE_KEY_ANNOUNCEMENTS, JSON.stringify(announcements));

      this.notifyChange('announcements');
      return { success: true, announcement: newAnn };
    }

    async deleteAnnouncement(id) {
      // 1. Live Deletion in Supabase
      const client = this.getSupabase();
      if (client) {
        try {
          await client.from('announcements').delete().eq('id', id);
        } catch (e) {
          console.warn("Supabase announcement delete notice:", e);
        }
      }

      // 2. Update Local Cache
      let announcements = this.getAnnouncements();
      announcements = announcements.filter(a => a.id !== id);
      localStorage.setItem(STORAGE_KEY_ANNOUNCEMENTS, JSON.stringify(announcements));
      this.notifyChange('announcements');
      return { success: true };
    }

    notifyChange(type) {
      try {
        localStorage.setItem('ers_last_sync_pulse', Date.now().toString());
        window.dispatchEvent(new CustomEvent('ers_data_sync', { detail: { type } }));
      } catch (e) {
        // ignore
      }
    }
  }

  window.facultyData = new FacultyDataManager();
})();
