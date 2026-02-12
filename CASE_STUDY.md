# Homegrown at Simeon — Developer Case Study

**Role:** Developer  
**Project type:** Event RSVP & registration web app  
**Context:** Event RSVP and registration platform featuring dual-flow guest management, a secure admin dashboard, and automated transactional emails.

---

## Project overview

A full‑stack invitation and registration site that:

- Presents the event brand (Homegrown at Simeon) and drives users to RSVP
- Collects **player** RSVPs (contact info, sizes, jersey number, emergency contact)
- Collects **non‑player** RSVPs (contact info, ticket count, optional additional guests)
- Sends confirmation and admin notification emails
- Provides a password‑protected admin dashboard to view entries, toggle check‑in, and export data

Built for a real event with clear UX requirements (inline success/error, loading states, no `alert()`), accessibility, and production deployment on Vercel.

---

## Technical details & links

### Tech stack

| Category | Technologies & tools |
|----------|----------------------|
| **Frontend** | Astro 5, TypeScript (strict), Tailwind CSS, Lucide icons |
| **Backend / API** | Astro server-side routes (API routes), serverless on Vercel |
| **Database** | PostgreSQL with connection pooling (`pg`), serverless‑friendly pool settings |
| **Auth** | Session cookies (httpOnly, secure in prod), bcrypt for admin passwords, optional env fallback |
| **Email** | Resend (transactional email): confirmations to attendees, HTML notifications to admins |
| **Hosting & deployment** | Vercel (serverless), optional prebuilt deploy via `deploy.sh` |
| **Dev / tooling** | Node 18–22, dotenv, npm scripts for DB init and admin setup |

*No Google Analytics or Shopify in this project; add to this table if you integrate them later.*

### Links (fill in with your actual URLs)

- **Project / case study:** [Live site or case study URL]
- **GitHub:** [Repository URL]
- **Admin / login:** `/login` (not public; link only if you want to mention “admin area” in the case study)

---

## Services provided

- **Full‑stack web development** — Astro frontend + API routes, TypeScript end‑to‑end  
- **Database design & implementation** — PostgreSQL schema (players, non‑players, admins), migrations, parameterized queries  
- **Authentication & authorization** — Admin login, session handling, protected admin routes and API endpoints  
- **Form handling & validation** — Player and non‑player RSVP forms with inline success/error and loading states  
- **Email integration** — Resend for confirmation emails and admin notifications (HTML templates, rate limiting, retries)  
- **Admin dashboard** — View/filter entries, check‑in toggles, CSV export (players and non‑players), delete entries  
- **API design** — RESTful endpoints for signup, check‑jersey, login/logout, CRUD and export for admin  
- **Deployment & DevOps** — Vercel serverless setup, env configuration, deploy scripting and troubleshooting  
- **Accessibility & UX** — Semantic HTML, ARIA where needed, focus and `aria-live` for form feedback, no `alert()` for user feedback  
- **Security** — No secrets in client code, parameterized DB queries, secure cookies, bcrypt for passwords  

---

## Features delivered (summary for CV / portfolio)

- **Dual flows:** Separate player RSVP (sizes, jersey number, emergency contact) and non‑player RSVP (tickets + optional guest details)  
- **Jersey number handling:** Optional jersey number with uniqueness check via `/api/check-jersey`  
- **Admin dashboard:** Auth‑protected; list player and non‑player entries, check‑in toggles, CSV export, delete  
- **Email:** Confirmation to attendee; HTML notifications to configurable admin lists (general, player‑only, non‑player‑only)  
- **Responsive UI:** Tailwind-based layout, custom fonts (e.g. Prohibition), branded assets  
- **Serverless‑ready:** Connection pooling and timeouts tuned for Vercel serverless  

---

## What to highlight in a tech case study

### Problem & goal

- Event needed a single place to collect player and non‑player RSVPs, send confirmations, and give organizers one dashboard to manage attendees and check‑in.

### Approach

- Chose Astro for fast, minimal JS and easy API routes; PostgreSQL for structured data; Resend for reliable transactional email; Vercel for zero‑config serverless deploy.

### Technical decisions

- **Astro + serverless:** Kept frontend light and used server-side routes for all mutations and auth.  
- **PostgreSQL:** One DB for submissions, non‑player submissions, and admins; schema migrations via init scripts.  
- **Resend + retries:** Rate limiting and retry logic for admin multi‑recipient emails.  
- **Session-based admin auth:** Cookie-based sessions with secure flags in production; no over‑engineered auth stack.

### Challenges & solutions

- **Serverless DB:** Tuned pool size and timeouts so serverless functions don’t exhaust connections.  
- **Email deliverability:** Used Resend’s API correctly, HTML templates that work in common clients, and staggered sends to avoid rate limits.  
- **Vercel build/runtime:** Resolved entry/module issues via Astro Vercel adapter, correct `output: 'server'`, and optional prebuilt deploy.

### Results (fill in with real numbers if you have them)

- [ ] X player RSVPs and Y non‑player RSVPs processed  
- [ ] Emails delivered reliably for confirmations and admin alerts  
- [ ] Admin team used the dashboard for check‑in and exports  

### Optional extras for the case study page

- **Code quality:** TypeScript strict mode, shared types between frontend and API, no `any`.  
- **Security:** Parameterized queries only, secrets in env, secure cookies, bcrypt.  
- **Accessibility:** Form UX with `aria-live`, focus management, semantic structure.  
- **Maintainability:** Clear separation (pages, API, `lib` for DB/auth/email), project rules in `.cursorrules` for consistency.

---

## Copy‑paste checklist for CV / portfolio

- [ ] **Tech stack:** Astro, TypeScript, Tailwind, PostgreSQL, Resend, Vercel  
- [ ] **Project link:** [your live URL or case study page]  
- [ ] **GitHub:** [repo URL]  
- [ ] **Services:** Full‑stack development, database design, auth, form & email integration, admin dashboard, deployment  
- [ ] **One-liner:** “Event RSVP and registration platform featuring dual-flow guest management, a secure admin dashboard, and automated transactional emails.”

Use the sections above as needed: “Technical details & links” and “Services provided” map directly to your CV case study fields; the rest supports a longer case study or interview talking points.
