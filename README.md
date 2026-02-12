# Homegrown at Simeon

**Event RSVP & registration platform** featuring dual-flow guest management, a secure admin dashboard, and automated transactional emails. Built for real-world events with production deployment on Vercel.

---

## For Recruiters & Potential Clients

### One-Liner
Event RSVP and registration platform featuring dual-flow guest management (players vs. non-players), a secure admin dashboard, and automated transactional emails.

### What This Project Demonstrates
- **Full-stack development** — End-to-end TypeScript, from frontend forms to database writes
- **Production deployment** — Serverless on Vercel with PostgreSQL, tested in a real event context
- **Security & UX** — Session-based auth, parameterized queries, accessible forms with inline feedback (no `alert()`)
- **Email integration** — Resend for confirmations and admin notifications, with rate limiting and retries
- **Admin tooling** — Protected dashboard, CRUD operations, CSV export, check-in management

---

## Purpose & Problems Solved

### The Problem
Event organizers needed a single place to:
- Collect **player** RSVPs (apparel sizes, jersey numbers, emergency contacts)
- Collect **non-player** RSVPs (ticket counts, optional guest details)
- Send confirmations and notify organizers in real time
- Manage attendees, toggle check-in, and export data for logistics

### The Solution
A purpose-built web app that:
- Presents the event brand and drives users to RSVP
- Handles two distinct flows with tailored forms and validation
- Sends confirmation emails to attendees and HTML notifications to admins
- Provides a password-protected admin dashboard for viewing, filtering, checking in, and exporting entries

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Astro 5, TypeScript (strict), Tailwind CSS, Lucide icons |
| **Backend / API** | Astro server-side routes (API routes), serverless on Vercel |
| **Database** | PostgreSQL with connection pooling (`pg`), serverless-optimized pool settings |
| **Auth** | Session cookies (httpOnly, secure in prod), bcrypt for admin passwords, optional env fallback |
| **Email** | Resend (transactional email): confirmations to attendees, HTML notifications to admins |
| **Hosting** | Vercel (serverless) |
| **Dev / Tooling** | Node 18–22, dotenv, npm scripts for DB init and admin setup |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Vercel (Serverless)                      │
├─────────────────────────────────────────────────────────────────┤
│  Astro Pages          │  API Routes (src/pages/api/)             │
│  - index.astro        │  - signup.ts, non-player-signup.ts       │
│  - invitation/*       │  - check-jersey.ts                       │
│  - players/*          │  - login.ts, logout.ts                   │
│  - admin.astro        │  - admin/entries/*, admin/non-player-*   │
│  - login.astro        │                                          │
├────────────────────────┴─────────────────────────────────────────┤
│  lib/                                                             │
│  - database.ts (PostgreSQL pool, CRUD, schema init)               │
│  - email.ts (Resend: confirmations, admin notifications)          │
│  - auth.ts (session cookies, bcrypt verification)                 │
├───────────────────────────────────────────────────────────────────┤
│  PostgreSQL (submissions, non_player_submissions, admins)         │
└───────────────────────────────────────────────────────────────────┘
```

### Data Model
- **submissions** — Player RSVPs (contact info, sizes, jersey number, emergency contact)
- **non_player_submissions** — Non-player RSVPs (contact info, ticket count, additional guests)
- **admins** — Username + bcrypt password hash for dashboard access

### API Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/signup` | POST | Player registration |
| `/api/non-player-signup` | POST | Non-player RSVP |
| `/api/check-jersey` | GET | Jersey number availability |
| `/api/login` | POST | Admin authentication |
| `/api/logout` | POST | Admin logout |
| `/api/admin/entries` | GET | List player entries (protected) |
| `/api/admin/entries/[id]` | PATCH, DELETE | Update/delete player entry |
| `/api/admin/entries/export` | GET | CSV export (players) |
| `/api/admin/non-player-entries` | GET | List non-player entries |
| `/api/admin/non-player-entries/[id]` | PATCH, DELETE | Update/delete non-player entry |
| `/api/admin/non-player-entries/export-non-players` | GET | CSV export (non-players) |

---

## Features Delivered

- **Dual RSVP flows** — Separate player form (sizes, jersey, emergency contact) and non-player form (tickets + optional guests)
- **Jersey number handling** — Optional jersey number with uniqueness check via `/api/check-jersey`
- **Admin dashboard** — Auth-protected; list player and non-player entries, check-in toggles, CSV export, delete
- **Email** — Confirmation to attendee; HTML notifications to configurable admin lists (general, player-only, non-player-only)
- **Responsive UI** — Tailwind-based layout, custom fonts (e.g. Prohibition), branded assets
- **Serverless-ready** — Connection pooling and timeouts tuned for Vercel serverless

---

## Quick Start

1. Copy this project to your new repo
2. Run `npm run setup` to initialize the project
3. Copy `env.example` to `.env` and configure:
   - `DATABASE_URL` — PostgreSQL connection string
   - `RESEND_API_KEY` — Resend API key (starts with `re_`)
   - `ADMIN_USERNAME`, `ADMIN_PASSWORD` — Admin credentials (or use `npm run setup-admin` after DB init)
   - `ADMIN_EMAIL_1`–`4` — Admin notification addresses
   - `FROM_EMAIL`, `FROM_NAME`, `SITE_URL` — Email sender and site URL
4. Run `npm run init-db` to initialize database schema
5. Run `npm run dev` to start the development server

### Scripts
- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run preview` — Preview production build
- `npm run setup` — Initialize project structure
- `npm run init-db` — Initialize database schema
- `npm run setup-admin` — Create admin user in database
- `npm run manage-admins` — List/add/remove admins

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `RESEND_API_KEY` | Resend API key (required for email) |
| `ADMIN_USERNAME` | Admin username (fallback if no DB admin) |
| `ADMIN_PASSWORD` | Admin password (fallback if no DB admin) |
| `SESSION_SECRET` | Session cookie signing (use strong random string in prod) |
| `ADMIN_EMAIL_1`–`4` | General admin notification emails |
| `ADMIN_EMAIL_PLAYER_1`–`4` | Player-only notification emails |
| `ADMIN_EMAIL_NON_PLAYER_1`–`4` | Non-player-only notification emails |
| `FROM_EMAIL` | Sender email for transactional emails |
| `FROM_NAME` | Sender name |
| `SITE_URL` | Full site URL (for email links and images) |

---

## Deployment

Deploy to Vercel with zero configuration. Set all environment variables in the Vercel dashboard before deploying.

---

## Troubleshooting

### Vercel Deployment Issues
- **Error**: "Cannot find module '/var/task/dist/server/entry.mjs'"
- **Solution**:
  1. Ensure `@astrojs/vercel` adapter is installed (not `@astrojs/vercel/serverless`)
  2. Verify `output: 'server'` is set in `astro.config.mjs`
  3. Check Vercel project settings → General → Build & Development Settings
  4. Ensure "Framework Preset" is set to Astro
  5. Build Command: `npm run build`; Output Directory: empty

### Database Connection Issues
- **Error**: "Cannot read properties of undefined (reading 'searchParams')"
- **Solution**: Check `DATABASE_URL` format and SSL configuration

### Email Service Issues
- **Error**: "RESEND_API_KEY appears to be invalid"
- **Solution**: Ensure API key starts with `re_` and is set in environment variables

### bcrypt in Serverless
When using dynamic imports with bcryptjs in Astro/Vercel, always use `bcrypt.default.compare()` and `bcrypt.default.hash()`.

---

## Customization

- Update form fields in `src/lib/database.ts`
- Modify email templates in `src/lib/email.ts`
- Customize styling in `src/components/` and `src/pages/`
- Add new pages in `src/pages/`

---

## Project Structure

```
src/
├── components/       # Reusable Astro components (ContactForm, NonPlayerForm)
├── layouts/          # Layout.astro base wrapper
├── lib/              # database.ts, email.ts, auth.ts
├── pages/
│   ├── api/          # API routes (signup, login, admin CRUD, export)
│   ├── invitation/   # RSVP invitation pages
│   ├── players/      # Player RSVP flow
│   ├── admin.astro   # Protected admin dashboard
│   └── index.astro   # Landing page
└── styles/           # Global styles
```

---

## Security & Code Quality

- **Parameterized queries** — No string concatenation for SQL
- **Secrets in env** — No secrets in client-side code
- **Secure cookies** — httpOnly, secure in production
- **bcrypt** — Password hashing for admin accounts
- **TypeScript strict mode** — Shared types, no `any`
- **Accessibility** — Semantic HTML, `aria-live` for form feedback, focus management
