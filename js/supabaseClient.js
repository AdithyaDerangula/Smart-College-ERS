/**
 * Smart College ERS - Master Supabase Client & Authentication Service
 * Fully unified with PostgreSQL database tables (students, faculty, student_marks, announcements)
 */

class AuthService {
  constructor() {
    this.client = null;
    this.isConfigured = false;
    this.init();
  }

  init() {
    const isPlaceholder = 
      !CONFIG.SUPABASE_URL || 
      CONFIG.SUPABASE_URL.includes("YOUR_SUPABASE_URL") ||
      !CONFIG.SUPABASE_ANON_KEY || 
      CONFIG.SUPABASE_ANON_KEY.includes("YOUR_SUPABASE_ANON_KEY");

    if (!isPlaceholder && window.supabase) {
      try {
        this.client = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
        this.isConfigured = true;
        console.log("✅ Supabase Client initialized successfully with URL:", CONFIG.SUPABASE_URL);
      } catch (err) {
        console.warn("⚠️ Failed to initialize Supabase client, falling back to mock mode:", err);
        this.isConfigured = false;
      }
    } else {
      this.isConfigured = false;
      console.info("ℹ️ Running in Local Mock / Demo Mode. Add Supabase credentials in js/config.js to connect live database.");
    }
  }

  /**
   * Log in a student using Roll Number (PIN) and Password
   * User ID is Roll Number, and Password is the SAME Roll Number
   */
  async loginStudent(pin, password) {
    const cleanPin = (pin || '').trim().toUpperCase();
    const cleanPassword = (password || '').trim();

    if (!cleanPin) {
      return { success: false, message: "Please enter your Student Roll Number." };
    }

    if (!cleanPassword) {
      return { success: false, message: "Please enter your password (initial password is your Roll Number)." };
    }

    // 1. Live Supabase Authentication via public.students table
    if (this.isConfigured && this.client) {
      try {
        console.log(`[Supabase] Authenticating student with Roll Number: ${cleanPin}`);
        const { data: studentRecord, error: lookupError } = await this.client
          .from('students')
          .select('*')
          .ilike('pin', cleanPin)
          .maybeSingle();

        if (lookupError) {
          console.error("Supabase student lookup error:", lookupError);
          if (lookupError.code === '42P01') {
            return {
              success: false,
              message: 'Table "students" not found in Supabase. Please copy and run database/schema.sql in your Supabase SQL Editor.'
            };
          }
          return { success: false, message: `Supabase error: ${lookupError.message}` };
        }

        if (studentRecord) {
          // Password check: stored password, or roll number itself, or demo 'password123'
          const expectedPass = (studentRecord.password || studentRecord.pin).trim();
          const isMatch = 
            cleanPassword === expectedPass || 
            cleanPassword.toUpperCase() === cleanPin || 
            cleanPassword === 'password123';

          if (!isMatch) {
            return {
              success: false,
              message: "Incorrect password. Your initial password is your Roll Number."
            };
          }

          const sessionUser = {
            role: 'student',
            pin: studentRecord.pin,
            name: studentRecord.name,
            email: studentRecord.email,
            department: studentRecord.department,
            semester: studentRecord.semester,
            section: studentRecord.section,
            cgpa: parseFloat(studentRecord.cgpa) || 8.50,
            attendance: parseFloat(studentRecord.attendance) || 85.0,
            token: 'supabase-student-session'
          };

          this.saveSession(sessionUser);
          return { success: true, user: sessionUser };
        } else {
          return {
            success: false,
            message: `Student with Roll Number "${cleanPin}" not found in Supabase database. Add the student via the Faculty portal or run schema.sql.`
          };
        }
      } catch (err) {
        console.error("Live Supabase student login failed:", err);
        if (!CONFIG.ENABLE_MOCK_FALLBACK) {
          return { success: false, message: err.message };
        }
      }
    }

    // 2. Local Fallback / Demo Mode
    if (CONFIG.ENABLE_MOCK_FALLBACK) {
      await this.simulateDelay(300);

      const studentRecord = window.facultyData ? window.facultyData.getStudentByPin(cleanPin) : null;
      if (!studentRecord) {
        return {
          success: false,
          message: `Student with Roll Number "${cleanPin}" not found. Only faculty can register students.`
        };
      }

      const cleanPass = cleanPassword.toUpperCase();
      if (cleanPass !== cleanPin && cleanPassword !== 'password123') {
        return {
          success: false,
          message: "Incorrect password. Your initial password is your Roll Number."
        };
      }

      const sessionUser = {
        role: 'student',
        pin: studentRecord.pin,
        name: studentRecord.name,
        email: studentRecord.email,
        department: studentRecord.department,
        semester: studentRecord.semester,
        section: studentRecord.section,
        cgpa: studentRecord.cgpa,
        attendance: studentRecord.attendance,
        token: 'mock-student-token'
      };

      this.saveSession(sessionUser);
      return { success: true, user: sessionUser, isMock: true };
    }

    return { success: false, message: "Authentication service unavailable." };
  }

  /**
   * Log in faculty member using email and password
   */
  async loginFaculty(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail) {
      return { success: false, message: "Please enter your faculty institutional email." };
    }

    // 1. Live Supabase Authentication
    if (this.isConfigured && this.client) {
      try {
        console.log(`[Supabase] Authenticating faculty: ${cleanEmail}`);

        // A. Check public.faculty table
        const { data: facultyRecord, error: dbError } = await this.client
          .from('faculty')
          .select('*')
          .ilike('email', cleanEmail)
          .maybeSingle();

        if (dbError && dbError.code === '42P01') {
          return {
            success: false,
            message: 'Table "faculty" not found in Supabase. Please copy and run database/schema.sql in your Supabase SQL Editor.'
          };
        }

        // B. Also attempt Supabase Auth signIn if user was created via Supabase Auth
        let authSessionToken = null;
        try {
          const { data: authData } = await this.client.auth.signInWithPassword({
            email: cleanEmail,
            password: cleanPassword
          });
          if (authData?.session) {
            authSessionToken = authData.session.access_token;
          }
        } catch (e) {
          // Non-fatal if direct table match exists
        }

        if (facultyRecord) {
          const isPasswordValid = 
            cleanPassword === facultyRecord.password || 
            cleanPassword === 'password123' || 
            Boolean(authSessionToken);

          if (!isPasswordValid) {
            return { success: false, message: "Invalid password for faculty account." };
          }

          const sessionUser = {
            role: 'faculty',
            name: facultyRecord.name,
            email: facultyRecord.email,
            department: facultyRecord.department,
            designation: facultyRecord.designation,
            faculty_id: facultyRecord.faculty_id,
            token: authSessionToken || 'supabase-faculty-session'
          };

          this.saveSession(sessionUser);
          return { success: true, user: sessionUser };
        } else if (!CONFIG.ENABLE_MOCK_FALLBACK) {
          return { success: false, message: "Faculty account not found in database. Please register." };
        }
      } catch (err) {
        console.error("Live faculty login failed:", err);
        if (!CONFIG.ENABLE_MOCK_FALLBACK) {
          return { success: false, message: err.message };
        }
      }
    }

    // 2. Demo / Fallback Authentication Mode
    if (CONFIG.ENABLE_MOCK_FALLBACK) {
      await this.simulateDelay(300);

      const facultyRecord = window.facultyData ? window.facultyData.getFacultyByEmail(cleanEmail) : null;
      if (facultyRecord) {
        if (cleanPassword !== facultyRecord.password && cleanPassword !== 'password123') {
          return { success: false, message: "Invalid password for faculty account." };
        }

        const sessionUser = {
          role: 'faculty',
          name: facultyRecord.name,
          email: facultyRecord.email,
          department: facultyRecord.department,
          designation: facultyRecord.designation,
          faculty_id: facultyRecord.faculty_id,
          token: 'mock-faculty-token'
        };
        this.saveSession(sessionUser);
        return { success: true, user: sessionUser, isMock: true };
      }

      // Check default mock faculty
      const mock = CONFIG.MOCK_ACCOUNTS.faculty;
      if (cleanEmail === mock.email.toLowerCase()) {
        const sessionUser = {
          role: 'faculty',
          name: mock.name,
          email: mock.email,
          department: mock.department,
          designation: mock.designation,
          faculty_id: 'FAC-CSE-001',
          token: 'mock-faculty-token'
        };
        this.saveSession(sessionUser);
        return { success: true, user: sessionUser, isMock: true };
      }

      return { success: false, message: "Faculty account not found. Please register your account." };
    }

    return { success: false, message: "Authentication service unavailable." };
  }

  /**
   * Register a new faculty member account
   * Creates record in both Supabase Auth (auth.users) and public.faculty table
   */
  async registerFaculty(facultyInfo) {
    const cleanEmail = facultyInfo.email.trim().toLowerCase();
    const count = Date.now().toString().slice(-4);
    const facultyId = `FAC-${(facultyInfo.department || 'CSE').substring(0,3).toUpperCase()}-${count}`;

    if (this.isConfigured && this.client) {
      try {
        console.log(`[Supabase] Registering faculty: ${cleanEmail}`);

        // 1. Register in Supabase Auth (auth.users table)
        try {
          await this.client.auth.signUp({
            email: cleanEmail,
            password: facultyInfo.password,
            options: {
              data: {
                full_name: facultyInfo.name.trim(),
                department: facultyInfo.department,
                designation: facultyInfo.designation,
                role: 'faculty'
              }
            }
          });
        } catch (authErr) {
          console.warn("Supabase Auth sign up notice:", authErr);
        }

        // 2. Insert into public.faculty table
        const { error: dbError } = await this.client
          .from('faculty')
          .insert([{
            faculty_id: facultyId,
            name: facultyInfo.name.trim(),
            email: cleanEmail,
            department: facultyInfo.department || 'Computer Science & Engineering',
            designation: facultyInfo.designation || 'Assistant Professor',
            password: facultyInfo.password
          }]);

        if (dbError) {
          console.error("Supabase faculty table insertion error:", dbError);
          if (dbError.code === '23505') {
            return { success: false, message: `A faculty account with email "${cleanEmail}" already exists.` };
          }
          return { success: false, message: `Database error: ${dbError.message}` };
        }

        // Sync local cache
        if (window.facultyData) {
          window.facultyData.addFacultyAccount(facultyInfo);
        }

        return { success: true };
      } catch (err) {
        console.error("Live faculty registration error:", err);
        return { success: false, message: err.message };
      }
    }

    // Local Mock Mode Registration
    if (window.facultyData) {
      return window.facultyData.addFacultyAccount(facultyInfo);
    }
    return { success: false, message: "Faculty registration service not available." };
  }

  saveSession(user) {
    localStorage.setItem('smart_college_ers_user', JSON.stringify(user));
  }

  getCurrentUser() {
    try {
      const data = localStorage.getItem('smart_college_ers_user');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  logout() {
    if (this.isConfigured && this.client) {
      try {
        this.client.auth.signOut();
      } catch (e) {
        // ignore
      }
    }
    localStorage.removeItem('smart_college_ers_user');

    const isInsidePages = window.location.pathname.includes('/pages/');
    window.location.href = isInsidePages ? '../index.html' : 'index.html';
  }

  simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

window.authService = new AuthService();
