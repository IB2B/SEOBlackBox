# SEOBlackBox

**SEO Blog Content Management & Automation Platform**

SEOBlackBox is an internal tool for managing the complete lifecycle of SEO blog content — from keyword input to automated generation, review, and publishing. It integrates with [Baserow](https://baserow.io) as its backend database and supports multi-project, multi-language content operations.

---

## Table of Contents

- [Concept & Purpose](#concept--purpose)
- [How to Use the Tool](#how-to-use-the-tool)
  - [Login](#1-login)
  - [Dashboard Overview](#2-dashboard-overview)
  - [Creating a Blog](#3-creating-a-blog)
  - [Blog Generation Pipeline](#4-blog-generation-pipeline)
  - [Editing & Reviewing Blogs](#5-editing--reviewing-blogs)
  - [Publishing](#6-publishing)
  - [Projects Management](#7-projects-management)
  - [Bulk Keywords Import](#8-bulk-keywords-import)
  - [Notifications](#9-notifications)
- [Technical Documentation](#technical-documentation)
  - [Tech Stack](#tech-stack)
  - [Project Structure](#project-structure)
  - [Getting Started (Development)](#getting-started-development)
  - [Environment Variables](#environment-variables)
  - [Authentication System](#authentication-system)
  - [Database Schema (Baserow)](#database-schema-baserow)
  - [API Reference](#api-reference)
  - [Blog Status Workflow](#blog-status-workflow)
  - [Key Architecture Decisions](#key-architecture-decisions)
  - [Security](#security)
  - [Deployment](#deployment)

---

## Concept & Purpose

SEOBlackBox is built to solve a core problem in SEO content operations: **managing high-volume blog generation across multiple projects, languages, and markets from a single interface**.

The typical workflow looks like this:

```
Keyword Input → Auto Pilot → SERP Analysis → Title → Permalink → Meta Description
    → Introduction → TOC → TL;DR → Conclusion → Full Article → Review → Publish
```

Each blog goes through an automated pipeline of generation steps. The platform tracks where every blog is in this pipeline, lets you review and edit content at any stage, and pushes it to publishing when ready.

**Who is it for?**
- SEO teams managing content across multiple websites
- Content managers who need visibility into generation progress
- Editors who review and polish AI-generated SEO content

**What problems does it solve?**
- Tracks hundreds of blogs across different generation stages
- Provides a dashboard with real-time statistics per project
- Allows inline editing of all blog fields (title, meta, body, images)
- Supports 8 languages and 7 target countries
- Sends browser notifications when blogs are ready for review

---

## How to Use the Tool

### 1. Login

Navigate to the app URL. You will be redirected to the login page if not authenticated.

- Enter your **email** and **password**
- Credentials are verified against the Baserow users table
- A session cookie is created (valid for 7 days)
- You are redirected to the dashboard

### 2. Dashboard Overview

The dashboard is the home screen after login. It provides:

- **Greeting** with the current user's name
- **Stats Cards** showing blog counts by status (Parking, Auto Pilot, Full, Publish, Completed, etc.)
- **Tracking Tabs** to filter by time period: Today, Yesterday, This Week, This Month
- **Recent Blogs** list with quick-access links
- **Project Selector** in the sidebar to filter all data by project

Use the **sidebar** to navigate between sections:
| Section | Purpose |
|---------|---------|
| Dashboard | Overview & statistics |
| Blogs | Full blog list with search & filters |
| Keywords | Keyword management |
| Projects | Project overview |

### 3. Creating a Blog

Go to **Blogs → New Blog** or click the "New Blog" button.

Fill in the required fields:

| Field | Description |
|-------|-------------|
| **Keyword** | The target SEO keyword for the blog |
| **Project** | Which website/project this blog belongs to |
| **Language** | Content language (English, Italian, French, German, Arabic, Spanish, Polish, Turkish) |
| **Country** | Target market (US, Italy, France, Germany, Spain, Morocco, Austria) |
| **NTOC** | Number of Table of Contents sections (3-10) |

Once created, the blog enters the **Parking** status and waits to be moved to **Auto Pilot** for automated generation.

### 4. Blog Generation Pipeline

Blogs progress through these stages automatically once set to **Auto Pilot**:

```
PARKING ──(user sets Auto Pilot)──→ Auto Pilot
    → SERP        (search engine results analysis)
    → Title       (title generation)
    → Permalink   (URL slug generation)
    → Meta Description
    → Introduction
    → TOC         (table of contents)
    → TL;DR       (summary)
    → Conclusion
    → Full        (complete article assembled)
```

The **Generation Progress** bar on each blog shows which step is currently active.

After reaching **Full**, the blog is ready for human review.

### 5. Editing & Reviewing Blogs

From the **Blogs** page, click any blog to view it, or click **Edit** to modify it.

The edit page provides:

- **Rich Text Editor** (TipTap) for the main body content
- **Section-by-section editing**: Introduction, TL;DR, 7 content sections, FAQ, Conclusion
- **Metadata fields**: Title, Permalink, Meta Description
- **Image management**: 4 image upload fields + image URL field
- **Auto-save** to Baserow on field changes
- **Live Preview** of the compiled blog body

**Editable fields include:**
- Title, Permalink, Meta Description
- Introduction, TL;DR, Conclusion
- Section 1-7 (individual content sections)
- FAQ
- Image fields (img1, img2, img3, img4)
- Image URLs

### 6. Publishing

When a blog is ready:

1. Review the content in the edit/preview page
2. Change the status to **Publish** using the status selector
3. The blog moves into the publishing pipeline
4. Once processed, status changes to **Completed**

**User-editable statuses** (the ones you can manually set):
- **Parking** — Blog is on hold
- **Auto Pilot** — Start automated generation
- **Publish** — Mark for publishing
- **Wait** — Pause processing

### 7. Projects Management

The platform supports multiple projects (websites):

| Project | Description |
|---------|-------------|
| Intelligent B2B | B2B marketing content |
| Letsportogether | Sports community |
| Fabio Marenghi | Personal brand |
| One Travel Lover | Travel blog |
| ATOMA | Tech content |
| HARLOCK | Content platform |
| 999kmh | Automotive |
| mindenergy | Energy sector |
| belotti | Brand content |
| Techstyle | Tech & style |

Use the **project selector** in the sidebar to filter the entire dashboard and blog list by project.

### 8. Bulk Keywords Import

Go to **Keywords** to import keywords in bulk:

- Paste a list of keywords (one per line)
- Select the target project, language, and country
- All keywords are created as new blog entries in **Parking** status
- Move them to **Auto Pilot** when ready for generation

### 9. Notifications

SEOBlackBox supports **browser push notifications**:

- Click the notification bell icon in the header to enable/disable
- You will be notified when:
  - A blog finishes generation (reaches **Full** status)
  - A blog is published
  - Errors occur during processing

---

## Technical Documentation

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5.3 |
| **UI** | React 18, Tailwind CSS 3.4, Shadcn/ui |
| **Rich Text** | TipTap 2.2 (with image, link, placeholder extensions) |
| **Auth** | JWT (jose library), bcryptjs |
| **Data Fetching** | SWR 2.4 (stale-while-revalidate) |
| **Backend/DB** | Baserow (self-hosted, REST API) |
| **Notifications** | Browser Notification API, Sonner (toasts) |
| **Security** | DOMPurify (XSS), rate limiting, input validation |
| **Markdown** | Marked 17.0 |
| **Deployment** | Netlify (with @netlify/plugin-nextjs) |

### Project Structure

```
SEOBlackBox/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/login/             # Login page
│   │   ├── (dashboard)/              # Protected routes (layout with sidebar)
│   │   │   ├── page.tsx              # Dashboard home
│   │   │   ├── blogs/
│   │   │   │   ├── page.tsx          # Blog list
│   │   │   │   ├── new/page.tsx      # Create blog
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # View blog
│   │   │   │       └── edit/page.tsx # Edit blog
│   │   │   ├── keywords/page.tsx     # Keywords page
│   │   │   ├── projects/page.tsx     # Projects page
│   │   │   └── layout.tsx            # Dashboard layout (sidebar + header)
│   │   ├── api/                      # API route handlers
│   │   │   ├── auth/                 # login, logout, me
│   │   │   ├── blogs/               # CRUD + status + recent
│   │   │   ├── tracking/            # Dashboard analytics
│   │   │   ├── stats/               # Blog statistics
│   │   │   ├── projects/            # Project list
│   │   │   ├── keywords/bulk/       # Bulk keyword import
│   │   │   ├── cron/process-parking/ # Background job processing
│   │   │   └── image-proxy/         # Image caching proxy
│   │   ├── globals.css              # Global styles
│   │   └── layout.tsx               # Root layout
│   ├── components/
│   │   ├── auth/                    # LoginForm
│   │   ├── blogs/                   # BlogEditor, BlogTable, BlogPreview, etc.
│   │   ├── dashboard/               # Header, Sidebar, StatsCards, etc.
│   │   ├── notifications/           # NotificationProvider, NotificationToggle
│   │   └── ui/                      # Shadcn/ui base components
│   ├── lib/
│   │   ├── baserow.ts               # Baserow API client (BaserowClient class)
│   │   ├── auth.ts                  # Auth utilities
│   │   ├── jwt.ts                   # JWT token sign/verify
│   │   ├── env.ts                   # Environment variable validation
│   │   ├── cookies.ts               # Cookie management
│   │   ├── constants.ts             # Statuses, projects, languages, routes
│   │   ├── notifications.ts         # Browser notification helpers
│   │   ├── validation.ts            # Input validation schemas
│   │   ├── sanitize.ts              # XSS prevention (DOMPurify)
│   │   ├── rate-limit.ts            # IP-based rate limiting
│   │   ├── bodyCompiler.ts          # Compiles blog sections into full BODY
│   │   ├── logger.ts                # Secure logging utility
│   │   └── utils.ts                 # General utilities (cn, etc.)
│   ├── hooks/
│   │   ├── useAuth.ts               # Auth state hook
│   │   ├── useApi.ts                # API call hook
│   │   ├── useSWR.ts                # SWR data fetching hook
│   │   ├── useBlogStream.ts         # Real-time blog update hook
│   │   └── useNotifications.ts      # Notification management hook
│   ├── context/
│   │   └── SidebarContext.tsx        # Sidebar open/close state
│   ├── types/
│   │   └── index.ts                 # TypeScript interfaces & types
│   └── middleware.ts                # Auth middleware (JWT validation)
├── .env.example                     # Environment variable template
├── next.config.js                   # Next.js config (images, security headers)
├── tailwind.config.ts               # Tailwind config (custom theme)
├── tsconfig.json                    # TypeScript config
├── netlify.toml                     # Netlify deployment config
└── package.json                     # Dependencies & scripts
```

### Getting Started (Development)

**Prerequisites:**
- Node.js 18+
- npm or yarn
- A Baserow instance with the required tables set up

**Steps:**

```bash
# 1. Clone the repository
git clone <repo-url>
cd SEOBlackBox

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values (see Environment Variables section)

# 4. Run the development server
npm run dev

# 5. Open in browser
# http://localhost:3000
```

**Available scripts:**

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

### Environment Variables

Create a `.env.local` file from `.env.example`:

```env
# Baserow Configuration
BASEROW_API_URL=https://your-baserow-instance.com    # Baserow API base URL
BASEROW_API_TOKEN=your_api_token                     # Baserow API authentication token
BASEROW_BLOGS_TABLE_ID=1234                          # Table ID for blogs
BASEROW_USERS_TABLE_ID=5678                          # Table ID for users

# JWT Configuration
JWT_SECRET=your_secret_key_at_least_32_chars_long    # Secret for signing JWT tokens
JWT_EXPIRES_IN=7d                                    # Token expiration (default: 7d)

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000             # Public app URL
```

| Variable | Required | Description |
|----------|----------|-------------|
| `BASEROW_API_URL` | Yes | Your Baserow instance URL |
| `BASEROW_API_TOKEN` | Yes | API token from Baserow settings |
| `BASEROW_BLOGS_TABLE_ID` | Yes | Numeric table ID for the blogs table |
| `BASEROW_USERS_TABLE_ID` | Yes | Numeric table ID for the users table |
| `JWT_SECRET` | Yes | Minimum 32-character secret for JWT signing |
| `JWT_EXPIRES_IN` | No | Token lifetime (default: `7d`) |
| `NEXT_PUBLIC_APP_URL` | Yes | Public URL where the app is accessible |

### Authentication System

**Flow:**

```
Client                    Server                    Baserow
  │                         │                         │
  ├─ POST /api/auth/login ─→│                         │
  │   {email, password}     │─── Query users table ──→│
  │                         │←── User record ─────────│
  │                         │                         │
  │                         │ Verify password (bcrypt)
  │                         │ Generate JWT (jose)
  │                         │ Set HttpOnly cookie
  │                         │                         │
  │←── 200 {user} ─────────│                         │
  │                         │                         │
  ├─ GET /api/blogs ───────→│                         │
  │   (cookie attached)     │ Middleware validates JWT │
  │                         │ Extracts user ID/email  │
  │                         │ Sets x-user-id header   │
  │                         │─── Fetch blogs ────────→│
  │←── 200 {blogs} ────────│←── Blog data ───────────│
```

**Key details:**
- Passwords are hashed with **bcryptjs** (salt rounds: 10)
- JWTs are signed with **HS256** algorithm via the **jose** library
- Tokens are stored in **HttpOnly, Secure, SameSite=Lax** cookies
- The Next.js **middleware** (`src/middleware.ts`) runs on every request to protected routes
- Rate limiting: **5 login attempts per minute** per IP address

### Database Schema (Baserow)

**Blogs Table** (ID: configurable via env):

| Field | Type | Description |
|-------|------|-------------|
| `Keyword` | Text | Target SEO keyword |
| `STEPS` | Single Select | Current status/step in pipeline |
| `Project` | Single Select | Associated project |
| `Language` | Text | Content language |
| `Country` | Text | Target country |
| `Title` | Long Text | Blog title |
| `Permalink` | Text | URL slug |
| `Meta description` | Long Text | SEO meta description |
| `BODY` | Long Text | Compiled full blog body (HTML) |
| `Introduction` | Long Text | Introduction section |
| `TLDR` | Long Text | TL;DR summary |
| `Conclusion` | Long Text | Conclusion section |
| `Section 1-7` | Long Text | Individual content sections |
| `FAQ` | Long Text | FAQ section |
| `TOC` | Long Text | Table of contents |
| `NTOC` | Number | Number of TOC sections |
| `img1-img4` | File | Image uploads |
| `Image URL` | Long Text | Image URLs (comma-separated) |
| `SERP` | Long Text | SERP analysis data |

**Users Table** (ID: configurable via env):

| Field | Type | Description |
|-------|------|-------------|
| `email` | Email | User email address |
| `password_hash` | Text | bcrypt-hashed password |
| `name` | Text | Display name |
| `created_at` | Date | Account creation date |

### API Reference

All API endpoints require authentication (JWT cookie) unless noted.

#### Authentication

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/login` | `{email, password}` | Login and receive JWT cookie |
| `POST` | `/api/auth/logout` | — | Clear auth cookie |
| `GET` | `/api/auth/me` | — | Get current user info |

#### Blogs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/blogs` | List blogs (supports `?page=`, `?search=`, `?status=`, `?project=`) |
| `POST` | `/api/blogs` | Create a new blog |
| `GET` | `/api/blogs/:id` | Get a single blog by ID |
| `PUT` | `/api/blogs/:id` | Update a blog (partial updates supported) |
| `DELETE` | `/api/blogs/:id` | Delete a blog |
| `PATCH` | `/api/blogs/:id/status` | Update blog status only |
| `GET` | `/api/blogs/recent` | Get recently updated blogs |

**Query parameters for `GET /api/blogs`:**

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1, 25 items per page) |
| `search` | string | Search by keyword |
| `status` | string | Filter by status ID |
| `project` | string | Filter by project ID |

#### Dashboard & Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tracking` | Dashboard tracking data (supports `?period=` filter) |
| `GET` | `/api/stats` | Blog count statistics by status |
| `GET` | `/api/projects` | List all projects |

#### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/keywords/bulk` | Bulk import keywords as new blogs |
| `GET` | `/api/image-proxy` | Proxy and cache external images |
| `POST` | `/api/cron/process-parking` | Background job to process parking blogs |

**Response format:**

All API responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

On error:

```json
{
  "success": false,
  "data": null,
  "error": "Error description"
}
```

### Blog Status Workflow

```
                    ┌─────────────────────────────────────────────┐
                    │           AUTOMATED PIPELINE                │
                    │                                             │
  PARKING ──→ Auto Pilot ──→ SERP ──→ Title ──→ Permalink       │
    ▲               │         ──→ Meta Description ──→ Intro     │
    │               │         ──→ TOC ──→ TL;DR ──→ Conclusion  │
    │               │         ──→ Full ─────────────────────────→│──→ PUBLISH ──→ COMPLETED
    │               │                                             │
    │               └─────────────────────────────────────────────┘
    │
  WAIT (pause)

  Additional statuses:
  ├── Positive / Neutral / Negative  (sentiment markers)
  ├── ATOMA                          (project-specific)
  └── HARLOCK                        (project-specific)
```

**User-controllable statuses:** PARKING, Auto Pilot, PUBLISH, WAIT

All other statuses are set automatically by the generation pipeline.

### Key Architecture Decisions

**1. Baserow as Backend**
- No custom backend server needed — Baserow provides the REST API and database
- The `BaserowClient` class (`src/lib/baserow.ts`) abstracts all database operations
- Data transformation happens in the API routes (Baserow format → app format)

**2. Next.js App Router**
- Server-side rendering for initial page loads
- API routes run as serverless functions
- Middleware handles authentication at the edge
- Route groups: `(auth)` for public routes, `(dashboard)` for protected routes

**3. SWR for Data Fetching**
- Client-side caching with `stale-while-revalidate` strategy
- 30-second auto-refresh interval on dashboard data
- 10-second deduplication to prevent concurrent duplicate requests
- Optimistic updates for status changes

**4. TipTap for Rich Text**
- Headings (H1-H3), bold, italic, lists, links, images, code blocks, blockquotes
- Read-only mode for preview components
- Custom toolbar with formatting controls

**5. Body Compilation**
- Individual sections (Intro, TL;DR, Sections 1-7, FAQ, Conclusion) are stored separately
- The `bodyCompiler` (`src/lib/bodyCompiler.ts`) merges them into the final `BODY` field
- This allows editing individual sections while maintaining the full compiled article

### Security

The application implements multiple security layers:

| Feature | Implementation |
|---------|---------------|
| **Authentication** | JWT tokens in HttpOnly cookies |
| **Password Storage** | bcrypt hashing (10 salt rounds) |
| **XSS Prevention** | DOMPurify sanitization on all rendered HTML |
| **Rate Limiting** | IP-based limits (5/min on auth, configurable on other endpoints) |
| **Input Validation** | Schema-based validation on all blog fields with max length enforcement |
| **CSRF Protection** | SameSite cookie attribute + origin validation |
| **Security Headers** | CSP, X-Frame-Options, HSTS, Referrer-Policy, Permissions-Policy |
| **Secure Logging** | Sensitive data stripped from logs |
| **Environment Validation** | Required env vars validated at startup |

### Deployment

**Netlify (primary):**

The project is configured for Netlify deployment with `netlify.toml`:

```bash
# Build and deploy
npm run build
# Netlify handles the rest via @netlify/plugin-nextjs
```

**Vercel (alternative):**

A `vercel.json` is included for Vercel deployment as a fallback option.

**Production checklist:**
- [ ] Set all environment variables in the hosting platform
- [ ] Ensure `JWT_SECRET` is a strong, unique 32+ character string
- [ ] Set `NEXT_PUBLIC_APP_URL` to the production domain
- [ ] Verify Baserow instance is accessible from the deployment environment
- [ ] Enable HTTPS (required for secure cookies and notifications)

---

## Version History

| Version | Changes |
|---------|---------|
| V1.5 | Auto-save all fields to Baserow + push notifications on update |
| V1.4 | Feature improvements |
| V1.3 | Feature improvements |
| V1.2 | Feature improvements |
| V1.0 | Initial release |
