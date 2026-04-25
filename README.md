# SMA 0 ASIKJUGA - Backend API Documentation

**Version:** 2.0  
**Last Updated:** 25 April 2026  
**Project:** SMA 0 ASIKJUGA - School Management System Backend  
**License:** ISC

---

## Table of Contents

1. [Gambaran Umum & Arsitektur](#1-gambaran-umum--arsitektur)
2. [Role & RBAC](#2-role--rbac)
3. [Entitas Data & Business Rules](#3-entitas-data--business-rules)
4. [Tech Stack & Environment](#4-tech-stack--environment)
5. [Database Schema & ORM](#5-database-schema--orm)
6. [Struktur Folder](#6-struktur-folder)
7. [Authentication & Security](#7-authentication--security)
8. [API Endpoints](#8-api-endpoints)
9. [Error Handling](#9-error-handling)
10. [Soft Delete](#10-soft-delete)
11. [Installation & Setup](#11-installation--setup)
12. [Test Accounts](#12-test-accounts)
13. [Changelog](#13-changelog)

---

## 1. Gambaran Umum & Arsitektur

### 1.1 Overview

SMA 0 ASIKJUGA adalah sistem backend headless (RESTful API) untuk manajemen data akademik sekolah. Sistem ini menangani data secara terpusat agar dapat dikonsumsi oleh aplikasi Client (Web SPA, Mobile App, dll) secara fleksibel, aman, dan efisien.

### 1.2 Arsitektur Sistem

Menggunakan **Clean Architecture** dengan pola aliran:

```
Route → Middleware (Auth/Validation) → Controller → Service → Database (Prisma)
```

### 1.3 Request Lifecycle

1. Request masuk ke Route
2. Middleware validasi (JWT, Role, Zod schema)
3. Controller menangani HTTP request/response
4. Service menjalankan business logic
5. Prisma berinteraksi dengan PostgreSQL

---

## 2. Role & RBAC

### 2.1 Sistem Role

| Role | Deskripsi |
|------|-----------|
| `ADMIN` | Administrator - akses penuh ke semua resources |
| `TEACHER` | Guru - input nilai, lihat data siswa & kelas |
| `STUDENT` | Siswa - lihat nilai personal saja |

### 2.2 Aturan RBAC

- **ADMIN**: CRUD semua entitas (User, Student, Teacher, Class, Subject, Grade)
- **TEACHER**: Baca Student/Class/Subject, Create/Read Grade, Read Teacher profile
- **STUDENT**: Baca Class/Subject, Read Grade (hanya milik sendiri)

### 2.3 Implementasi

```typescript
// src/middlewares/roleMiddleware.ts
type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';
export const roleMiddleware = (allowedRoles: Role[]) => (req, res, next) => {
  const user = (req as AuthRequest).user;
  if (!allowedRoles.includes(user.role as Role)) {
    return res.status(403).json({ success: false, message: 'Insufficient permissions' });
  }
  next();
};
```

---

## 3. Entitas Data & Business Rules

### 3.1 Entitas Utama

| Entitas | Identifier | Keterangan |
|---------|------------|------------|
| `User` | `id` (UUID) | Akun login, password hash, role |
| `Student` | `nisn` | Nomor Induk Siswa Nasional, relasi User + Class |
| `Teacher` | `nip` | Nomor Induk Pegawai, relasi User |
| `Class` | `name` | Nama kelas (format: `10-IPA-1`) |
| `Subject` | `name` | Nama mata pelajaran |
| `Grade` | `id` | Nilai akademik (student + subject + teacher) |

### 3.2 Business Rules

#### a) Registrasi Sentralisasi
Pembuatan akun hanya bisa dilakukan oleh ADMIN. Tidak ada self-registration.

#### b) Single Login (Session Management)
Setiap user hanya boleh login dari satu perangkat sekaligus. Sistem melacak `tokenExpiresAt` di database. Jika user login dari perangkat baru, session lama otomatisinvalid.

#### c) Transaksi Database
Pendaftaran Student/Teacher menggunakan Prisma Transaction untuk konsistensi data User + profil.

#### d) Integritas Input Nilai
- Hanya TEACHER yang bisa input nilai
- `teacherId` diambil dari JWT (tidak dari body)
- Score harus 0–100

#### e) Privasi Nilai
STUDENT hanya dapat melihat nilai miliknya sendiri (berdasarkan `userId` dari JWT).

#### f) Soft Delete
Student tidak dihapus permanen; menggunakan flag `isDeleted = true`. Query otomatis filter `isDeleted: false`.

#### g) Format Kelas
Nama kelas harus mengikuti pola `GRADE-MAJOR-NUMBER` (contoh: `10-IPA-1`). `gradeLevel` harus 10–12 dan harus sesuai dengan prefix angka pada `name`.

#### h) Batasan Deleting Guru
Guru dapat dihapus hanya jika tidak memiliki grade terkait.

---

## 4. Tech Stack & Environment

### 4.1 Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| Runtime | Node.js |
| Bahasa | TypeScript (Strict) |
| Framework | Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT + Bcrypt |
| Validation | Zod |
| Logging | Winston + Morgan |
| Testing | Jest + Supertest |

### 4.2 Environment Variables

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/sma0asikjuga
JWT_SECRET=your-secret-key-minimum-32-characters
```

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Environment mode |
| `PORT` | No | `3000` | Server port |
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `JWT_SECRET` | Yes | min 32 chars | JWT signing secret |

### 4.3 Response Format

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Stack trace (dev only)"
}
```

**Paginated:**
```json
{
  "data": [ ... ],
  "meta": {
    "currentPage": 1,
    "limit": 10,
    "totalItems": 100,
    "totalPages": 10
  }
}
```

---

## 5. Database Schema & ORM

Lihat file terpisah **DATABASE.md** untuk dokumentasi lengkap regarding database schema, Prisma ORM configuration, relationships, migrations, dan query patterns.

---

## 6. Struktur Folder

```
src/
├── config/
│   ├── env.ts          # Environment validation
│   └── db.ts           # Prisma client instance
├── controllers/
│   ├── authController.ts
│   ├── studentController.ts
│   ├── gradeController.ts
│   ├── teacherController.ts
│   ├── classController.ts
│   └── subjectController.ts
├── middlewares/
│   ├── authMiddleware.ts      # JWT verification + session check
│   ├── roleMiddleware.ts      # RBAC
│   ├── errorHandler.ts        # Global error handler
│   ├── validator.ts           # Zod validation wrapper
│   └── rateLimiter.ts         # Rate limiting (login)
├── routes/
│   ├── authRoutes.ts
│   ├── studentRoutes.ts
│   ├── gradeRoutes.ts
│   ├── teacherRoutes.ts
│   ├── classRoutes.ts
│   ├── subjectRoutes.ts
│   └── index.ts
├── services/
│   ├── authService.ts
│   ├── studentService.ts
│   ├── gradeService.ts
│   ├── teacherService.ts
│   ├── classService.ts
│   └── subjectService.ts
├── utils/
│   ├── auth.ts         # JWT & bcrypt utilities
│   └── logger.ts       # Winston logger
├── validations/
│   └── authValidation.ts   # All Zod schemas
├── app.ts              # Express app & middleware wiring
└── server.ts           # HTTP listener
```

---

## 7. Authentication & Security

### 7.1 Login Flow

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@school.ac.id",
  "password": "password123"
}
```

Response contains JWT token:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": "...", "email": "...", "role": "ADMIN" }
  }
}
```

### 7.2 JWT Expiry & Single Login

- Token expires in **7 days** (`JWT_EXPIRES_IN=7d`)
- Server tracks active session via `User.tokenExpiresAt`
- On each request, `authMiddleware` validates that `tokenExpiresAt` is set and not expired
- If user logs in again from another device, previous session becomes invalid

### 7.3 Logout

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

Clears `tokenExpiresAt` on the user record, invalidating the token.

### 7.4 Password Hashing

Bcrypt with **10 salt rounds**.

### 7.5 Rate Limiting

Rate limiter applied to `/auth/login` to prevent brute force attacks.

---

## 8. API Endpoints

Base URL: `http://localhost:3000/api/v1`

### 8.1 Authentication

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | Public | Login (all roles) |
| POST | `/auth/register` | ADMIN | Create new user |
| POST | `/auth/logout` | Authenticated | Invalidate current session |

### 8.2 Students

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/students` | ADMIN, TEACHER | List all active students |
| GET | `/students/:id` | ADMIN, TEACHER | Get student detail |
| DELETE | `/students/:id` | ADMIN | Soft delete student |
| PUT | `/students/:id` | ADMIN | Update student (name, nisn, class) |

**Query Params (GET /students):** `page`, `limit`, `name`, `classId`

### 8.3 Teachers

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/teachers` | ADMIN | List all teachers |
| GET | `/teachers/:id` | ADMIN | Get teacher detail with grades |
| DELETE | `/teachers/:id` | ADMIN | Hard delete teacher (requires no grades) |
| PUT | `/teachers/:id` | ADMIN | Update teacher (name, nip) |

**Query Params:** `page`, `limit`, `name`

### 8.4 Classes

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/classes` | ADMIN, TEACHER, STUDENT | List classes |
| GET | `/classes/:id` | ADMIN, TEACHER, STUDENT | Class detail + students |
| POST | `/classes` | ADMIN | Create class (name must match gradeLevel) |
| PUT | `/classes/:id` | ADMIN | Update class |
| DELETE | `/classes/:id` | ADMIN | Delete class (only if no active students) |

**Validation:** `name` must be `^\d{2}-[A-Za-z]+-\d+$` and `gradeLevel` ∈ [10,12].

### 8.5 Subjects

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/subjects` | ADMIN, TEACHER, STUDENT | List subjects |
| GET | `/subjects/:id` | ADMIN, TEACHER, STUDENT | Subject detail |
| POST | `/subjects` | ADMIN | Create subject |
| PUT | `/subjects/:id` | ADMIN | Update subject |
| DELETE | `/subjects/:id` | ADMIN | Delete subject (requires no grades) |

### 8.6 Grades

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/grades` | ADMIN, TEACHER | List all grades (filterable) |
| POST | `/grades` | TEACHER | Create grade (teacherId from JWT) |
| GET | `/grades/my-grades` | STUDENT | List own grades |

**Query Params (GET /grades):** `page`, `limit`, `semester`, `academicYear`, `studentId`, `subjectId`  
**Body (POST /grades):** `studentId`, `subjectId`, `score` (0-100), `semester` (1|2), `academicYear` (`YYYY/YYYY`)

---

## 9. Error Handling

### 9.1 Global Error Handler

```typescript
// src/middlewares/errorHandler.ts
export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
```

### 9.2 Custom AppError

```typescript
export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}
```

### 9.3 Common Error Codes

| Code | Message | Fix |
|------|---------|-----|
| 400 | Email already exists | Use unique email |
| 400 | NISN already exists | Use unique NISN |
| 400 | NIP already exists | Use unique NIP |
| 400 | Invalid role | Use ADMIN/TEACHER/STUDENT |
| 400 | Student already deleted | Student is already soft-deleted |
| 400 | Cannot add grade to deleted student | Reactivate student first |
| 401 | Invalid email or password | Check credentials |
| 401 | Token expired or invalid session | Login again |
| 403 | Insufficient permissions | Check user role |
| 404 | Resource not found | Verify ID exists |
| 500 | Internal Server Error | Server-side failure |

---

## 10. Soft Delete

Student records are never physically deleted. Instead:

```typescript
// Service
export const deleteStudentService = async (studentId) => {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) throw new AppError('Student not found', 404);
  if (student.isDeleted) throw new AppError('Student already deleted', 400);
  return prisma.student.update({ where: { id: studentId }, data: { isDeleted: true } });
};

// GET list automatically filters
where: { isDeleted: false }
```

---

## 11. Installation & Setup

### 11.1 Prerequisites

- Node.js ≥ 18
- PostgreSQL ≥ 14
- npm or yarn

### 11.2 Install Dependencies

```bash
npm install
```

### 11.3 Environment Setup

Create `.env` in project root:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/sma0asikjuga
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
NODE_ENV=development
PORT=3000
```

### 11.4 Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database with sample data
npm run prisma:seed
```

### 11.5 Development

```bash
npm run dev          # Hot-reload server at http://localhost:3000
```

### 11.6 Build & Production

```bash
npm run build        # Compile TypeScript → dist/
npm run start        # Run production server
```

### 11.7 Testing

```bash
npm test             # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

---

## 12. Test Accounts

After running `npm run prisma:seed`, you can use these accounts:

| Role | Email | Password |
|------|-------|----------|
| ADMIN | admin@sma0asikjuga.com | password123 |
| TEACHER | (see seed output) | guru123 |
| STUDENT | (see seed output) | siswa123 |

---

## 13. Changelog

### v2.0.0 (25 April 2026)

- [x] Single login enforcement via `tokenExpiresAt`
- [x] JWT expiry tracking & server-side validation
- [x] Logout endpoint (`POST /auth/logout`)
- [x] Teacher delete (hard delete with grade existence check)
- [x] Student update (`PUT /students/:id`)
- [x] Teacher update (`PUT /teachers/:id`)
- [x] Class name format validation (`GRADE-MAJOR-NUMBER`, e.g., `10-IPA-1`)
- [x] Class grade level restricted to 10–12
- [x] Grade creation: fixed `teacherId` to use `teacher.id` (from JWT `userId`)
- [x] Documentation consolidation: README as single source of truth

**Detailed release notes:** [Docs-25042026.md](./Docs-25042026.md)

---

### v1.0.0 (17 April 2026)

- Initial release: Auth, Student, Grade, Teacher (read-only), Class, Subject modules
- RBAC with ADMIN/TEACHER/STUDENT
- Soft delete for Student
- Prisma + PostgreSQL

**Full v1.0 documentation:** [Docs-17042026.md](./Docs-17042026.md)

---

### v0.2.0 (16 April 2026)

- Refined API specification and endpoint structure
- Updated business rules documentation
- Improved validation schema definitions

**Reference:** [Docs-16042026.md](./Docs-16042026.md)

---

### v0.1.0 (13 April 2026)

- Project blueprint & Clean Architecture planning
- Tech stack finalization
- Database schema design (Prisma)
- Development roadmap definition

**Reference:** [Docs-13042026.md](./Docs-13042026.md)

---

*End of documentation.*
