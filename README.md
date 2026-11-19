# Smart College ERS (Education Record System)

A web portal for college education record management featuring role-based authentication (Student vs. Faculty), modern institutional UI, and ready Supabase database integration.

---

## 📁 Project Structure

```text
Smart College ERS/
│
├── index.html                   # Institutional Login Page (Student & Faculty entry point)
├── css/
│   └── style.css                # Global theme, dark mode styles, custom toasts & animations
├── js/
│   ├── config.js                # Supabase URL & Key placeholders + route configurations
│   ├── supabaseClient.js        # Supabase client wrapper & role-based authentication service
│   └── login.js                 # Login UI controller (role switching, validation, toasts, theme)
├── pages/                       # The 4 other portal pages (ready to receive your code)
│   ├── home.html                # Campus Home Portal
│   ├── student-dashboard.html   # Student Academic Dashboard
│   ├── faculty-dashboard.html   # Faculty Administrative Dashboard
│   └── about.html               # About & Institutional Directory
├── database/
│   └── schema.sql               # Supabase PostgreSQL schema, RLS policies, tables & seed data
└── README.md                    # Setup and Supabase integration guide
```

---

## ⚡ Quick Start & Testing

1. Open `index.html` in any web browser.
2. The login page will automatically work in **Demo/Mock Mode** with preset institutional credentials:
   - **Student Login**:
     - **PIN**: `22481A4201`
     - **Password**: `password123`
     - *(Redirects to `pages/student-dashboard.html`)*
   - **Faculty Login**:
     - **Email**: `m.vance@engineering.college.edu`
     - **Password**: `password123`
     - *(Redirects to `pages/faculty-dashboard.html`)*

---

## 🗄️ Setting Up Supabase Database (When you are ready)

### Step 1: Run the Database Schema
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor** -> **New Query**.
3. Copy the entire contents of [`database/schema.sql`](database/schema.sql) and paste it into the editor.
4. Click **Run**.
   - This creates the `profiles`, `students`, `faculty`, and `audit_logs` tables with RLS and pre-seeded accounts.

### Step 2: Add your Supabase Credentials
Open [`js/config.js`](js/config.js) and replace the placeholders:
```javascript
const CONFIG = {
  SUPABASE_URL: "https://your-project-id.supabase.co",
  SUPABASE_ANON_KEY: "your-anon-public-key-here",
  ...
};
```

Once pasted, the badge on the login page header will automatically switch to **"Supabase Connected"** with live database queries and authentication!
