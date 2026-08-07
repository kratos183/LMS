# 🎓 SkillStream — Full-Stack AI-Powered E-Learning Platform

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://lms-tau-silk-12.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Cloudflare R2](https://img.shields.io/badge/Cloudflare_R2-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://www.cloudflare.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

A production-grade, multi-tenant E-Learning Management System (LMS) engineered with **Next.js 16 (App Router)**, **React 19**, **Supabase (PostgreSQL)**, **Tailwind CSS v4**, **Cloudflare R2 / Cloudinary Object Storage**, and an integrated **AI Study Assistant**.

🌐 **Live Application**: [https://lms-tau-silk-12.vercel.app/](https://lms-tau-silk-12.vercel.app/)

---

## 🌟 Key Features

### 🛡️ 1. Edge Middleware Role-Based Access Control (RBAC)
* **Automated Route Protection**: Built on Next.js Edge Middleware (`proxy.js`) to parse authentication tokens and role cookies before page rendering.
* **Multi-Persona Separation**: Seamlessly isolates `/Admin-Dashboard`, `/Instructor-Dashboard`, and `/Student-Dashboard` workspace boundaries.
* **Unauthorized & Dynamic Redirects**: Unauthenticated users are redirected to login with fallback parameters, while role mismatches trigger dynamic unauthorized pages.

### 👑 2. Comprehensive Admin Control Panel
* **User & Role Administration**: Instant user lookup and dynamic role promotion/demotion (Student $\leftrightarrow$ Instructor $\leftrightarrow$ Admin) powered by secure Supabase Service Role APIs (`/api/admin/set-role`).
* **Instructor Verification Workflow**: Centralized approval queue for onboarding new educators.
* **Content & Platform Management**: Full oversight of published courses, blogs, categories, coupons, review moderation, and platform security configurations.

### 🎨 3. Instructor Studio & Course Builder
* **Interactive Curriculum Builder**: Flexible modular editor for creating course structures, modules, and lessons.
* **Direct Cloud Media Uploads**: Dual storage integration supporting **Cloudflare R2** and **Cloudinary** using presigned signatures (`/api/upload/r2`, `/api/upload/cloudinary`) for fast client-side video uploads without server bottleneck.
* **Financial & Student Analytics**: Track revenue metrics, course enrollment numbers, course reviews, Q&A threads, and broadcast announcements.

### 🎓 4. Interactive Student Dashboard & AI Companion
* **Personalized Learning Player**: Seamless video streaming with module progress tracking, course completion indicators, and "Continue Watching" shelf.
* **Embedded AI Study Assistant**: Built-in interactive AI chatbot designed to answer questions about course lessons on demand.
* **Certificates & Achievements**: Instant certificate generation and download upon course completion, wishlist management, and assignment tracking.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router), React 19, Server & Client Components |
| **Styling** | Tailwind CSS v4, Lucide React Icons |
| **Database & Auth** | Supabase (PostgreSQL), Supabase Auth (JWT & Cookie Sync), Service Role Client |
| **Cloud Storage** | Cloudflare R2 Object Storage, Cloudinary API (Presigned Upload Signature Workflow) |
| **Routing Guard** | Next.js Edge Middleware (`proxy.js`) |
| **AI Integration** | Context-Aware AI Learning Assistant |
| **Deployment** | Vercel Platform |

---

## 🏗️ System Architecture

```
                               ┌───────────────────────────┐
                               │     Next.js 16 Client     │
                               │  (React 19 + Tailwind v4) │
                               └─────────────┬─────────────┘
                                             │
                                  Edge Middleware Guard
                                     (`proxy.js` RBAC)
                                             │
                        ┌────────────────────┼────────────────────┐
                        ▼                    ▼                    ▼
         ┌────────────────────────┐┌──────────────────┐┌────────────────────────┐
         │    Student Workspace   ││Instructor Studio ││  Admin Control Panel   │
         │ (/Student-Dashboard)   ││(/Instructor-Dash)││   (/Admin-Dashboard)   │
         └───────────┬────────────┘└─────────┬────────┘└───────────┬────────────┘
                     │                       │                     │
                     └───────────────────────┼─────────────────────┘
                                             │
                                     HTTP / API Routes
                                             │
               ┌─────────────────────────────┼─────────────────────────────┐
               ▼                             ▼                             ▼
  ┌─────────────────────────┐   ┌─────────────────────────┐   ┌─────────────────────────┐
  │   Supabase PostgreSQL   │   │  Cloudflare R2 Storage  │   │  AI Assistant Service   │
  │ (Users, Courses, Auth)  │   │  (Presigned Uploads)    │   │  (Interactive Q&A Engine)│
  └─────────────────────────┘   └─────────────────────────┘   └─────────────────────────┘
```

---

## 📂 Repository Structure

```
lms-online/
├── app/
│   ├── Admin-Dashboard/       # Admin Control Panel (User management, system stats)
│   ├── Instructor-Dashboard/  # Instructor Studio (Course builder, analytics, uploads)
│   ├── Student-Dashboard/     # Student Learning Portal (Video player, AI Assistant)
│   ├── api/                   # API Routes (auth, admin, courses, lessons, upload, blogs)
│   │   ├── admin/             # Admin set-role & user retrieval handlers
│   │   ├── auth/              # Auth login, logout, session verification
│   │   ├── courses/           # Course CRUD operations & query endpoints
│   │   └── upload/            # Cloudinary & Cloudflare R2 presigned signature APIs
│   ├── blog/                  # Blog listing & template pages
│   ├── component/             # Global Shared Navigation & Footer components
│   ├── courses/               # Public Course Catalog & Course detail views
│   ├── login-page/            # Dynamic Auth Login Page
│   └── unauthorized/          # Dynamic RBAC Access Denied Route
├── lib/                       # Supabase client configuration (`supabase.js`)
├── proxy.js                   # Next.js Edge Middleware for Role-Based Access Control
└── public/                    # Static Assets & Icons
```

---

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites
* **Node.js** v18.0 or higher
* **npm**, **yarn**, or **pnpm**
* A **Supabase** Project (URL and Anon Key)
* **Cloudflare R2** or **Cloudinary** credentials (for media upload functionality)

### 1. Clone the Repository
```bash
git clone https://github.com/kratos183/LMS.git
cd lms-online
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Cloudinary Upload Credentials
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Cloudflare R2 Object Storage
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_r2_bucket_name

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to test the platform locally.

---

## 📡 API Reference Overview

| Endpoint | Method | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `/api/auth/me` | `GET` | Retrieve current authenticated user session | Authenticated |
| `/api/auth/logout` | `POST` | Clear auth cookies & terminate session | Authenticated |
| `/api/admin/users` | `GET` | Fetch all users for administration | Admin |
| `/api/admin/set-role` | `POST` | Modify user role (Student / Instructor / Admin) | Admin |
| `/api/courses` | `GET / POST` | Fetch published courses or create new course | Public / Instructor |
| `/api/upload/r2` | `POST` | Generate Cloudflare R2 presigned upload URL | Instructor / Admin |
| `/api/upload/cloudinary` | `POST` | Generate signed upload parameters for Cloudinary | Instructor / Admin |
| `/api/blogs` | `GET / POST` | Retrieve or create platform blog posts | Public / Admin |

---

## 🌐 Deployment

This application is deployed on Vercel:

1. Push your code to your GitHub repository.
2. Import the repository in [Vercel](https://vercel.com).
3. Add all environment variables from `.env.local` into **Project Settings $\rightarrow$ Environment Variables**.
4. Deploy!

🚀 **Live Link**: [https://lms-tau-silk-12.vercel.app/](https://lms-tau-silk-12.vercel.app/)

---

## 📄 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

## 👨‍💻 Author

Developed by **Kratos183** — Feel free to star ⭐ the repository or submit a Pull Request!
