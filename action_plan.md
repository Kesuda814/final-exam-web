# CSX4107 Final Exam — Action Plan
**Project:** Online Course Service (Next.js backend + React Vite frontend + MongoDB)
**Root:** /Users/kesuda-/Desktop/Exam
**Starter repo:** https://github.com/pop2518hotmailcom/wad-final-2026-01.git
## Phase 0 — Setup
- [x] Clone starter repo into `/Users/kesuda-/Desktop/Exam` (keeps `next-backend/` + `react-frontend/` structure)
- [x] Inspect all `"codes go here"` placeholders in both apps (list every file to implement)
- [x] `npm install` in `next-backend/` (mongodb, bcrypt, jsonwebtoken, cookie)
- [x] `npm install` in `react-frontend/`
- [x] Create `next-backend/.env.local`: MONGODB_URI, DB_NAME (from PDF/default examDB), JWT_SECRET, ADMIN creds, CORS origin
- [x] Create `react-frontend/.env` pointing to backend URL (per starter convention)

### Phase 0 findings (placeholders to implement)
- Backend (comment markers): `api/auth/login`, `api/auth/logout`, `api/course`, `api/course/[course_id]`, `api/user`, `api/user/[user_id]`
- Frontend: `App.jsx` (Routes), `src/context/UserContext.jsx` (UserProvider body)
- Helpers provided: `verifyJWT` (cookie "token"), `getClientPromise`, `errorResponse/successResponse` (+CORS), `proxy.js` (identity headers, matcher empty)
- Versions: Next.js 16.3.1 (cookies() async), React 19, Vite, MUI v9, react-router 7 (HashRouter)
- CORS dev origin: http://localhost:5173

## Phase 0 — Setup
- [ ] Clone starter repo into `/Users/kesuda-/Desktop/Exam` (keeps `next-backend/` + `react-frontend/` structure)
- [ ] Inspect all `"codes go here"` placeholders in both apps (list every file to implement)
- [ ] `npm install` in `next-backend/` (mongodb, bcrypt, jsonwebtoken, cookie)
- [ ] `npm install` in `react-frontend/`
- [ ] Create `next-backend/.env.local`: MONGODB_URI, DB_NAME (from PDF/default examDB), JWT_SECRET, ADMIN creds, CORS origin
- [ ] Create `react-frontend/.env` pointing to backend URL (per starter convention)

## Phase 1 — Auth (3 pts)
- [ ] Implement `api/auth/login` (verify bcrypt, sign JWT, set HttpOnly cookie)
- [ ] Implement logout (clear cookie)
- [ ] Implement `lib/auth.js` helper: read + verify JWT from cookie; reject 401 when missing/invalid
- [ ] Seed 3 Teacher users + 3 Student users (hashed passwords) into DB
- [ ] Frontend: login page + UserContext wiring, `credentials: 'include'` on all fetches

## Phase 2 — Users & Roles (4 pts)
- [ ] Implement `api/user` routes (as required by starter structure) with role in JWT payload
- [ ] Enforce role checks server-side (Teacher vs Student) in course/enrollment routes

## Phase 3 — Teacher course management (5 pts)
- [ ] `api/course` POST: only authenticated Teacher can create (name, durationDays, topics[], price, maxStudent, status)
- [ ] `api/course` GET (own list) + `api/course/[course_id]` GET: details incl. enrolled students (own course only)
- [ ] PUT: update own course only (403 otherwise)
- [ ] DELETE: own course only, and only when no students enrolled (409 otherwise)
- [ ] Frontend: teacher course list, create form, detail view (with enrolled students), edit, delete

## Phase 4 — Enrollment & business rules (7 pts)
- [ ] Enroll endpoint: Student only; course status must be Open; seats < maxStudent; no duplicate enrollment (all enforced server-side)
- [ ] Student course list: all courses except Cancel; filter by course name OR teacher name (server-side query)
- [ ] Student "my enrollments" view
- [ ] Status behavior: Open = enrollable, Close = visible not enrollable, Cancel = hidden from students

## Phase 5 — Frontend integration & usability (3 pts)
- [ ] React pages/components wired to all API routes; role-based navigation
- [ ] Error/success messages for business-rule violations (e.g., course full, already enrolled)
- [ ] Fill root README.md: student name/ID, test credentials (3+3), how to run & test walkthrough

## Phase 6 — Deployment (2 pts)
- [ ] Deploy backend (Vercel) with env vars; deploy frontend (Vercel) with backend URL env var
- [ ] Verify end-to-end: login → create course → enroll → rules enforced on deployed URLs
- [ ] (Backup) Generate Dockerfile + docker-compose.yml as taught in class, in case Vercel fails

## Phase 7 — Submission
- [ ] Git commit + push backend and frontend repo links (PAT remote)
- [ ] Verify: both repo URLs, both deployed URLs, screen recording ready, README complete
