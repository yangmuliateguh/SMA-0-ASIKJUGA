# Database & ORM Documentation

**Project:** SMA 0 ASIKJUGA  
**ORM:** Prisma  
**Database:** PostgreSQL  
**Version:** 2.0 (25 April 2026)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Prisma Client Configuration](#2-prisma-client-configuration)
3. [Database Schema Deep Dive](#3-database-schema-deep-dive)
4. [Relationships](#4-relationships)
5. [Migrations](#5-migrations)
6. [Query Patterns](#6-query-patterns)
7. [Transactions](#7-transactions)
8. [Soft Delete Implementation](#8-soft-delete-implementation)
9. [Indexes & Constraints](#9-indexes--constraints)
10. [Best Practices](#10-best-practices)

---

## 1. Overview

Prisma is used as the ORM (Object-Relational Mapper) to interact with PostgreSQL. It provides type-safe database access, automatic migration generation, and a powerful query API.

### Core Models

| Model | Description |
|-------|-------------|
| `User` | Authentication & authorization (JWT subject) |
| `Student` | Student profile linked to User + Class |
| `Teacher` | Teacher profile linked to User |
| `Class` | Academic class (e.g., "10-IPA-1") |
| `Subject` | Course / subject master data |
| `Grade` | Academic grade/score transaction |

### Enums

```prisma
enum Role {
  ADMIN
  TEACHER
  STUDENT
}
```

---

## 2. Prisma Client Configuration

**File:** `src/config/db.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || '';

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export default prisma;
```

### Why `PrismaPg` Adapter?

Using `@prisma/adapter-pg` with a shared `pg` Pool enables better connection pooling and serverless compatibility. This is especially useful in environments like Vercel, Cloudflare, or any scenario where many short-lived connections are expected.

---

## 3. Database Schema Deep Dive

### Model: User

```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  password      String   // bcrypt hash
  role          Role     @default(STUDENT)
  tokenExpiresAt DateTime? // active session expiry timestamp
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  student       Student?
  teacher       Teacher?
}
```

**Fields:**
- `id`: UUID primary key
- `email`: Unique, used for login
- `password`: Bcrypt hash (salt rounds = 10)
- `role`: ADMIN / TEACHER / STUDENT
- `tokenExpiresAt`: Nullable. Set on login, cleared on logout. Used for single-session enforcement.
- `student` / `teacher`: Optional one-to-one relations

---

### Model: Student

```prisma
model Student {
  id        String  @id @default(uuid())
  userId    String  @unique
  name      String
  nisn      String  @unique
  classId   String
  isDeleted Boolean @default(false)
  grades    Grade[]
  class     Class   @relation(fields: [classId], references: [id])
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Key Points:**
- `isDeleted`: Soft delete flag (never physically deleted)
- `nisn`: Unique national student number
- `classId`: Foreign key to Class
- `onDelete: Cascade` on `userId`: If User is deleted, Student is also removed (though User deletion rarely happens)

---

### Model: Teacher

```prisma
model Teacher {
  id     String  @id @default(uuid())
  userId String  @unique
  name   String
  nip    String  @unique
  grades Grade[]
  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Key Points:**
- `nip`: Unique employee number
- `grades`: One-to-many relationship (one teacher teaches many grades)
- Hard delete permitted only when `grades.length === 0`

---

### Model: Class

```prisma
model Class {
  id         String    @id @default(uuid())
  name       String    @unique
  gradeLevel Int       // 10, 11, or 12
  students   Student[]
}
```

**Validation:**
- `name` pattern: `10-IPA-1` (two-digit grade, hyphen, major string, hyphen, class number)
- `gradeLevel` must match the two-digit prefix in `name` (e.g., `10-IPA-1` → `gradeLevel = 10`)
- `gradeLevel` must be 10, 11, or 12

---

### Model: Subject

```prisma
model Subject {
  id     String  @id @default(uuid())
  name   String  @unique
  grades Grade[]
}
```

Simple master data for subjects.

---

### Model: Grade

```prisma
model Grade {
  id           String   @id @default(uuid())
  studentId    String
  subjectId    String
  teacherId    String
  score        Float
  semester     Int      // 1 | 2
  academicYear String   // "2025/2026"
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  student Student @relation(fields: [studentId], references: [id])
  subject Subject @relation(fields: [subjectId], references: [id])
  teacher Teacher @relation(fields: [teacherId], references: [id])
}
```

**Composite Meaning:** A grade is a triple relationship: which student, which subject, and which teacher (during that semester/year).

**Constraints in code (Zod):**
- `score`: 0 – 100
- `semester`: 1 or 2
- `academicYear`: must match `/^\d{4}\/\d{4}$/`

---

## 4. Relationships

### One-to-One

| Relationship | Description |
|--------------|-------------|
| `User` ↔ `Student` | One user can have one student profile |
| `User` ↔ `Teacher` | One user can have one teacher profile |

Both are optional; a User may be ADMIN (no student/teacher record).

### One-to-Many

| From | To | Foreign Key |
|------|----|-------------|
| `Class` → `Student` | one class has many students | `Student.classId` |
| `Teacher` → `Grade` | one teacher teaches many grades | `Grade.teacherId` |
| `Subject` → `Grade` | one subject has many grades | `Grade.subjectId` |
| `Student` → `Grade` | one student has many grades | `Grade.studentId` |

---

## 5. Migrations

### Generating Migrations

```bash
# After modifying prisma/schema.prisma:
npx prisma migrate dev --name descriptive-name
```

This will:
1. Generate a new migration file in `prisma/migrations/`
2. Apply it to the development database
3. Regenerate Prisma Client

### Resetting Database (DEV ONLY)

```bash
npx prisma migrate reset --force
```

WARNING: Drops all data and reapplies all migrations.

### Production Deploy

```bash
npx prisma migrate deploy   # applies pending migrations, no interactive prompts
```

---

## 6. Query Patterns

### Find with Relations

```typescript
const student = await prisma.student.findUnique({
  where: { id: studentId },
  include: {
    class: true,
    user: { select: { email: true } },
    grades: {
      include: { subject: true, teacher: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    },
  },
});
```

### Paginated List with Count (Transaction)

```typescript
const [data, totalItems] = await prisma.$transaction([
  prisma.student.findMany({ where, skip, take, orderBy, include }),
  prisma.student.count({ where }),
]);
```

Using `$transaction` ensures the count and data are consistent.

### Filtering

```typescript
const where: any = { isDeleted: false };
if (name) where.name = { contains: name, mode: 'insensitive' };
if (classId) where.classId = classId;
```

### Update with Concurrency Check (Optional)

Not implemented yet, but can be added using `version` field or checking `updatedAt`.

---

## 7. Transactions

Critical operations use transactions to maintain data consistency.

### Example: Register Student

```typescript
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { email, password: hashed, role: 'STUDENT' },
  });

  const student = await tx.student.create({
    data: {
      userId: user.id,
      name,
      nisn,
      classId,
    },
  });

  return { user, student };
});
```

If either operation fails, both are rolled back automatically.

---

## 8. Soft Delete Implementation

Students are never physically deleted.

### GET List

```typescript
const where: any = { isDeleted: false };
// ... apply other filters
```

### GET by ID

```typescript
const student = await prisma.student.findUnique({ where: { id } });
if (!student || student.isDeleted) {
  throw new AppError('Student not found', 404);
}
```

### DELETE

```typescript
const updated = await prisma.student.update({
  where: { id },
  data: { isDeleted: true },
});
```

No `DELETE FROM` SQL is ever executed on the `Student` table.

---

## 9. Indexes & Constraints

### Unique Constraints

| Column | Index | Purpose |
|--------|-------|---------|
| `User.email` | `@unique` | Fast login lookup |
| `Student.nisn` | `@unique` | National identifier uniqueness |
| `Teacher.nip` | `@unique` | Employee number uniqueness |
| `Class.name` | `@unique` | Class name uniqueness |
| `Subject.name` | `@unique` | Subject name uniqueness |

### Foreign Keys & Cascades

| Foreign Key | On Delete | On Update |
|-------------|-----------|-----------|
| `Student.userId → User.id` | Cascade | Default |
| `Teacher.userId → User.id` | Cascade | Default |
| `Student.classId → Class.id` | Restrict (default) | Default |
| `Grade.studentId → Student.id` | Restrict | Default |
| `Grade.subjectId → Subject.id` | Restrict | Default |
| `Grade.teacherId → Teacher.id` | Restrict | Default |

**Important:** When deleting a Teacher, we manually check for referenced Grades before allowing deletion (Prisma does not have `ON DELETE SET NULL` configured for `teacherId` in Grade by default – we enforce at application layer).

---

## 10. Best Practices

### 10.1 Never Use Raw Queries Without Need

Prisma Client is type-safe. Only resort to `$queryRaw` when absolutely necessary (e.g., complex reporting).

### 10.2 Always Include Required Relations

When fetching entities, specify `include` explicitly to avoid under-fetching. Use `select` to limit fields when appropriate (e.g., `user: { select: { email: true } }`).

### 10.3 Use `$transaction` for Atomic Multi-Step Operations

Example: Creating a user + profile; or deleting a teacher after checking grades count.

### 10.4 Leverage Type Safety

All generated Prisma types are available:

```typescript
import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

type StudentWithRelations = Prisma.StudentInclude<{
  class: true;
  user: { select: { email: true } };
  grades: { include: { subject: true } };
}>;
```

### 10.5 Use `findFirst` vs `findUnique` Appropriately

- `findUnique`: when you query by a `@unique` or `@id` field (fast, uses PK/unique index)
- `findFirst`: when querying by non-unique fields or composite conditions

### 10.6 Soft Delete Pattern

Always add `isDeleted: false` to `where` in list queries. For single-record fetch, check `isDeleted` and return 404.

---

*End of Database & ORM documentation.*
