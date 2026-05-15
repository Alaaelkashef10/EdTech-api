# EdTech API

A RESTful back-end API for an online learning platform built with **Node.js**, **Express**, and **MongoDB**.  
The system supports two roles — **instructors** who create and manage courses, and **students** who enroll and track their progress.
---
## 👥 User Seeding Cardinalities

| Role        | Count | Example Credentials                  |
|-------------|-------|--------------------------------------|
| Super Admin | 1     | `admin@admin.com / 123456`           |
| Admins      | 5     | `adminX@domain.com / 123456`         |
| Instructors | 50    | `instructorX@domain.com / 123456`    |
| Students    | 100   | `studentX@domain.com / 123456`       |

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Authentication](#authentication)

---

## Features

- User registration and login with **JWT authentication**
- Role-based access control (Instructor / Student)
- CRUD operations for **Courses** and **Lessons**
- Student **enrollment** system
- Per-lesson **progress tracking** with completion percentage
- Input validation with `express-validator`
- Centralized error handling

---

## Tech Stack

| Layer        | Technology              |
|--------------|-------------------------|
| Runtime      | Node.js                 |
| Framework    | Express.js v5           |
| Database     | MongoDB + Mongoose      |
| Auth         | JSON Web Tokens (JWT)   |
| Passwords    | bcryptjs                |
| Validation   | express-validator       |

---

## Project Structure

```
edtech-api/
├── server.js               # Entry point – connects DB and starts server
├── src/
│   ├── app.js              # Express app setup and route mounting
│   ├── config/
│   │   └── db.js           # MongoDB connection
│   ├── controllers/        # Business logic for each resource
│   │   ├── user.controller.js
│   │   ├── course.controller.js
│   │   ├── lesson.controller.js
│   │   └── progress.controller.js
│   ├── middleware/
│   │   ├── auth.js         # JWT verification (protect)
│   │   ├── role.js         # Role-based access guard
│   │   ├── validate.js     # express-validator error handler
│   │   ├── validateId.js   # MongoDB ObjectId format check
│   │   └── error.js        # Global error handler
│   ├── models/             # Mongoose schemas
│   │   ├── user.model.js
│   │   ├── course.model.js
│   │   ├── lesson.model.js
│   │   └── progress.model.js
│   ├── routes/             # Route definitions
│   │   ├── user.routes.js
│   │   ├── course.routes.js
│   │   ├── lesson.routes.js
│   │   └── progress.routes.js
│   ├── validators/         # Input validation rules
│   │   ├── user.validators.js
│   │   ├── course.validators.js
│   │   ├── lesson.validators.js
│   │   └── progress.validators.js
│   └── utils/
│       ├── asyncHandler.js # Wraps async controllers to forward errors
│       └── AppError.js     # Custom operational error class
└── public/                 # Static front-end files
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB running locally (or a MongoDB Atlas URI)

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd edtech-api

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your values

# 4. Start the development server
npm run dev

# Or for production
npm start
```

The server will start on `http://localhost:5000`.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

| Variable     | Description                              | Example                          |
|--------------|------------------------------------------|----------------------------------|
| `PORT`       | Port the server listens on               | `5000`                           |
| `MONGO_URI`  | MongoDB connection string                | `mongodb://localhost:27017/edtech`|
| `JWT_SECRET` | Secret key used to sign JWTs            | `a_long_random_string`           |
| `JWT_EXPIRE` | JWT expiry duration                     | `30d`                            |

---

## API Reference

All responses follow this shape:

```json
{ "success": true, "data": ... }
{ "success": false, "message": "..." }
```

### Users

| Method | Endpoint             | Access  | Description              |
|--------|----------------------|---------|--------------------------|
| POST   | `/api/users/register`| Public  | Register a new user      |
| POST   | `/api/users/login`   | Public  | Login and get a JWT      |
| GET    | `/api/users/me`      | Private | Get your own profile     |

**Register body:**
```json
{
  "username": "John",
  "email": "john@example.com",
  "password": "secret123",
  "is_instructor": false
}
```

---

### Courses

| Method | Endpoint                        | Access             | Description                      |
|--------|---------------------------------|--------------------|----------------------------------|
| GET    | `/api/courses`                  | Public             | List all courses                 |
| GET    | `/api/courses/:courseId`        | Public             | Get a single course              |
| POST   | `/api/courses`                  | Private/Instructor | Create a course                  |
| POST   | `/api/courses/:courseId/enroll` | Private/Student    | Enroll in a course               |
| GET    | `/api/courses/me/courses`       | Private            | Get courses you are enrolled in  |

---

### Lessons

| Method | Endpoint                              | Access             | Description                       |
|--------|---------------------------------------|--------------------|-----------------------------------|
| GET    | `/api/courses/:courseId/lessons`      | Private            | List lessons (content locked if not enrolled) |
| POST   | `/api/courses/:courseId/lessons`      | Private/Instructor | Add a lesson to a course          |

---

### Progress

| Method | Endpoint                                          | Access  | Description                            |
|--------|---------------------------------------------------|---------|----------------------------------------|
| GET    | `/api/courses/:courseId/progress`                 | Private | View progress (students: own; instructor: all) |
| POST   | `/api/courses/:courseId/progress/:lessonId`       | Private | Mark a lesson complete / incomplete    |

**Update progress body:**
```json
{ "completed": true }
```

---

## Authentication

Protected routes require a JWT in the `Authorization` header:

```
Authorization: Bearer <your_token>
```

You get a token from `/api/users/register` or `/api/users/login`.
