/**
 * Smart College ERS - Login Interactivity & Form Submission Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const studentTab = document.getElementById('studentTab');
  const facultyTab = document.getElementById('facultyTab');
  const identityLabel = document.getElementById('identityLabel');
  const identityHint = document.getElementById('identityHint');
  const identityInput = document.getElementById('identityInput');
  const identityIcon = document.getElementById('identityIcon');
  const passwordInput = document.getElementById('passwordInput');
  const togglePassword = document.getElementById('togglePassword');
  const eyeIcon = document.getElementById('eyeIcon');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const roleNotice = document.getElementById('roleNotice');
  const quickSwitch = document.getElementById('quickSwitchTrigger');
  const loginForm = document.getElementById('loginForm');

  // Menu Elements
  const menuBtn = document.getElementById('menuBtn');
  const menuDropdown = document.getElementById('menuDropdown');
  const lightThemeBtn = document.getElementById('lightThemeBtn');
  const darkThemeBtn = document.getElementById('darkThemeBtn');
  const themeStatusBadge = document.getElementById('themeStatusBadge');
  const dbStatusBadge = document.getElementById('dbStatusBadge');

  const passwordGuidance = document.getElementById('passwordGuidance');
  const facultyRegisterPrompt = document.getElementById('facultyRegisterPrompt');

  let currentRole = 'student';
  let isPasswordVisible = false;

  // 1. Theme Management (persisted in localStorage)
  const savedTheme = localStorage.getItem('ers_theme') || 'light';
  applyTheme(savedTheme);

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      if (themeStatusBadge) themeStatusBadge.textContent = 'Active';
    } else {
      document.body.classList.remove('dark-mode');
      if (themeStatusBadge) themeStatusBadge.textContent = 'Active';
    }
    localStorage.setItem('ers_theme', theme);
  }

  if (lightThemeBtn) {
    lightThemeBtn.addEventListener('click', () => {
      applyTheme('light');
      menuDropdown.classList.add('hidden');
      showToast('Switched to Light Theme', 'info');
    });
  }

  if (darkThemeBtn) {
    darkThemeBtn.addEventListener('click', () => {
      applyTheme('dark');
      menuDropdown.classList.add('hidden');
      showToast('Switched to Dark Theme', 'info');
    });
  }

  // 2. Role Switcher
  function setRole(role) {
    currentRole = role;
    if (role === 'student') {
      studentTab.className = "flex-1 py-2 text-xs font-semibold rounded-md transition-all duration-150 text-white bg-[#1E3A8A] shadow-sm text-center";
      studentTab.setAttribute('aria-selected', 'true');
      facultyTab.className = "flex-1 py-2 text-xs font-semibold rounded-md transition-all duration-150 text-[#475569] hover:text-[#0F172A] bg-transparent text-center";
      facultyTab.setAttribute('aria-selected', 'false');

      identityLabel.textContent = "Student Roll Number";
      identityHint.textContent = "e.g. 22481A4201";
      identityInput.placeholder = "Enter your Roll Number (e.g. 22481A4201)";
      identityInput.value = "22481A4201";
      identityInput.type = "text";
      identityIcon.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="16" rx="2"/>
          <circle cx="9" cy="10" r="2"/>
          <path d="M15 8h2M15 12h2M7 16h10"/>
        </svg>
      `;
      passwordInput.placeholder = "Enter Roll Number as password";
      passwordInput.value = "22481A4201";
      if (passwordGuidance) {
        passwordGuidance.innerHTML = '<span class="text-[#1E3A8A] font-semibold">Notice:</span> User ID and password are both your Roll Number.';
      }
      if (facultyRegisterPrompt) {
        facultyRegisterPrompt.classList.add('hidden');
      }

      btnText.textContent = "Sign In as Student";
      roleNotice.textContent = "Need faculty console? Switch tab to login with institutional email";
      quickSwitch.textContent = "Switch";
    } else {
      facultyTab.className = "flex-1 py-2 text-xs font-semibold rounded-md transition-all duration-150 text-white bg-[#1E3A8A] shadow-sm text-center";
      facultyTab.setAttribute('aria-selected', 'true');
      studentTab.className = "flex-1 py-2 text-xs font-semibold rounded-md transition-all duration-150 text-[#475569] hover:text-[#0F172A] bg-transparent text-center";
      studentTab.setAttribute('aria-selected', 'false');

      identityLabel.textContent = "Institutional Email";
      identityHint.textContent = "e.g. m.vance@engineering.college.edu";
      identityInput.placeholder = "institutional.email@college.edu";
      identityInput.value = "m.vance@engineering.college.edu";
      identityInput.type = "email";
      identityIcon.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
        </svg>
      `;
      passwordInput.placeholder = "Enter institutional password";
      passwordInput.value = "password123";
      if (passwordGuidance) {
        passwordGuidance.innerHTML = '<span class="text-[#1E3A8A] font-semibold">Default:</span> Initial faculty password is password123.';
      }
      if (facultyRegisterPrompt) {
        facultyRegisterPrompt.classList.remove('hidden');
      }

      btnText.textContent = "Sign In as Faculty";
      roleNotice.textContent = "Student portal access? Switch back to student roll number";
      quickSwitch.textContent = "Student";
    }
  }

  // Check URL parameters for tab and email pre-fill
  const urlParams = new URLSearchParams(window.location.search);
  const requestedTab = urlParams.get('tab') || urlParams.get('role');
  const requestedEmail = urlParams.get('email');

  if (requestedTab === 'faculty') {
    setRole('faculty');
    if (requestedEmail) {
      identityInput.value = requestedEmail;
      passwordInput.value = '';
      passwordInput.focus();
    }
  } else {
    setRole('student');
  }

  studentTab.addEventListener('click', () => setRole('student'));
  facultyTab.addEventListener('click', () => setRole('faculty'));
  quickSwitch.addEventListener('click', () => {
    setRole(currentRole === 'student' ? 'faculty' : 'student');
  });

  // 3. Password visibility toggle
  togglePassword.addEventListener('click', () => {
    isPasswordVisible = !isPasswordVisible;
    passwordInput.type = isPasswordVisible ? 'text' : 'password';
    if (isPasswordVisible) {
      eyeIcon.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
      `;
    } else {
      eyeIcon.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      `;
    }
  });

  // 4. Popover Menu toggle (if present)
  if (menuBtn && menuDropdown) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      menuDropdown.classList.toggle('hidden');
    });
    document.addEventListener('click', () => {
      menuDropdown.classList.add('hidden');
    });
  }

  // 5. Database status check badge
  if (dbStatusBadge) {
    if (window.authService && window.authService.isConfigured) {
      dbStatusBadge.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span> Supabase Connected`;
      dbStatusBadge.className = "flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full";
    } else {
      dbStatusBadge.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span> Supabase Ready (Mock Mode)`;
      dbStatusBadge.className = "flex items-center text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full cursor-pointer";
      dbStatusBadge.title = "Configure your Supabase URL & Key in js/config.js";
    }
  }

  // 6. Handle Form Submission & Authentication
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const identifier = identityInput.value.trim();
    const password = passwordInput.value;

    if (!identifier) {
      showToast(currentRole === 'student' ? 'Please enter your Student PIN' : 'Please enter your Email', 'error');
      identityInput.focus();
      return;
    }

    if (!password) {
      showToast('Please enter your password', 'error');
      passwordInput.focus();
      return;
    }

    // Set Loading State
    setLoadingState(true);

    try {
      let result;
      if (currentRole === 'student') {
        result = await window.authService.loginStudent(identifier, password);
      } else {
        result = await window.authService.loginFaculty(identifier, password);
      }

      if (result.success) {
        showToast(`Welcome back, ${result.user.name}! Redirecting...`, 'success');
        
        // Redirect to respective dashboard
        setTimeout(() => {
          if (currentRole === 'student') {
            window.location.href = window.CONFIG.ROUTES.STUDENT_DASHBOARD;
          } else {
            window.location.href = window.CONFIG.ROUTES.FACULTY_DASHBOARD;
          }
        }, 1200);
      } else {
        showToast(result.message || 'Authentication failed. Please verify credentials.', 'error');
        setLoadingState(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      showToast('An unexpected error occurred during sign in.', 'error');
      setLoadingState(false);
    }
  });

  const btnContent = document.getElementById('btnContent');
  const btnLoading = document.getElementById('btnLoading');

  function setLoadingState(loading) {
    if (loading) {
      submitBtn.disabled = true;
      submitBtn.classList.add('opacity-90', 'cursor-not-allowed');
      if (btnContent) btnContent.classList.add('invisible');
      if (btnLoading) {
        btnLoading.classList.remove('hidden');
        btnLoading.classList.add('flex');
      }
    } else {
      submitBtn.disabled = false;
      submitBtn.classList.remove('opacity-90', 'cursor-not-allowed');
      if (btnLoading) {
        btnLoading.classList.add('hidden');
        btnLoading.classList.remove('flex');
      }
      if (btnContent) btnContent.classList.remove('invisible');
      if (btnText) {
        btnText.textContent = currentRole === 'student' ? 'Sign In as Student' : 'Sign In as Faculty';
      }
    }
  }

  // 7. Toast Notification Utility
  function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `ers-toast ers-toast-${type}`;

    let icon = `
      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    `;
    if (type === 'success') {
      icon = `
        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
      `;
    } else if (type === 'error') {
      icon = `
        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      `;
    }

    toast.innerHTML = `${icon}<span>${message}</span>`;
    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  window.showToast = showToast;
});
