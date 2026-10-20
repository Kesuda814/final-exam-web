# How to Test the App

## Student Information

- **Student Name:** Kesuda
- **Student ID:** (6736640)

## Test Credentials

Seeded users (all with password `password123`):

| Role    | Username  | Email               | Password    |
| ------- | --------- | ------------------- | ----------- |
| Teacher | teacher1  | teacher1@exam.com   | password123 |
| Teacher | teacher2  | teacher2@exam.com   | password123 |
| Teacher | teacher3  | teacher3@exam.com   | password123 |
| Student | student1  | student1@exam.com   | password123 |
| Student | student2  | student2@exam.com   | password123 |
| Student | student3  | student3@exam.com   | password123 |

## Prerequisites

- Node.js (v18+)
- A MongoDB Atlas connection string

## How to Run & Test

### 1. Backend Setup (`next-backend/`)

1. `cd next-backend`
2. `npm install`
3. Create `.env.local` with:

   ```
   MONGODB_URI=your_mongodb_connection_string
   DB_NAME=examDB
   JWT_SECRET=your_long_random_secret
   ```
4. Seed the test users: `node scripts/seed.js`
5. Start the backend: `npm run dev` (runs on http://localhost:3000)

### 2. Frontend Setup (`react-frontend/`)

1. `cd react-frontend`
2. `npm install`
3. Create `.env` with:

   ```
   VITE_API_URL=http://localhost:3000
   ```
4. Start the frontend: `npm run dev` (opens on http://localhost:5173)

### 3. Testing Walkthrough

1. Open the frontend URL and login as `teacher1` / `password123`.
2. **Teacher:** create a course (name, duration, topics, price, max students), edit it, view enrolled students, delete it.
3. Login as `student1` / `password123`.
4. **Student:** browse courses (cancelled courses are hidden), search by course/teacher name, enroll in an Open course, view "My Enrollments".
5. Verify the business rules:
   - A student cannot create/edit/delete courses (403 from the API).
   - A student cannot enroll twice in the same course (409).
   - A student cannot enroll when the course is full or not Open (409/400).
   - A teacher cannot delete a course that has enrolled students (409).
   - A teacher can only manage their own courses (403 otherwise).
6. Logout and login as the other role to confirm the role-based routing.
