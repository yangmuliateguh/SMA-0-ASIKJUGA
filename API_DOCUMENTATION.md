# SMA 0 ASIKJUGA - API Documentation

**Version:** 2.0  
**Last Updated:** 25 April 2026  
**Base URL:** `http://localhost:3000/api/v1`  

---

## 🔐 Authentication

### POST /auth/login

Login untuk mendapatkan JWT token.

**Request:**
```json
{
  "email": "admin@sma0asikjuga.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "admin@sma0asikjuga.com",
      "role": "ADMIN"
    }
  }
}
```

**Errors:**  
`401` – Invalid email or password  
`403` – Already logged in from another device (single login enforced)

---

### POST /auth/register

Buat user baru (hanya ADMIN). Membuat User + Student/Teacher dalam satu transaksi.

**Headers:** `Authorization: Bearer <admin_token>`

**Request (Student):**
```json
{
  "email": "siswa@test.com",
  "password": "siswa123",
  "role": "STUDENT",
  "name": "Budi Siswa",
  "nisn": "1234567890",
  "classId": "uuid-class"
}
```

**Request (Teacher):**
```json
{
  "email": "guru@test.com",
  "password": "guru123",
  "role": "TEACHER",
  "name": "Pak Guru",
  "nip": "123456789012345678"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { "id": "uuid", "email": "...", "role": "..." },
    "student": { "id": "uuid", "name": "...", "nisn": "..." } // atau teacher
  }
}
```

**Errors:**  
`400` – Email/NISN/NIP already exists, missing required fields  
`401` – Not authenticated

---

### POST /auth/logout

Invalidasi token dan clear session (logout).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 👨‍🎓 Students

### GET /students

Daftar siswa aktif (soft-deleted excluded). filterable by name & class.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page (max 100) |
| name | string | – | Filter by name (case-insensitive) |
| classId | uuid | – | Filter by class UUID |

**Response (200):**
```json
{
  "success": true,
  "message": "Students retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Budi",
      "nisn": "1234567890",
      "class": { "id": "uuid", "name": "10-IPA-1", "gradeLevel": 10 }
    }
  ],
  "meta": {
    "currentPage": 1,
    "limit": 10,
    "totalItems": 20,
    "totalPages": 2
  }
}
```

---

### GET /students/:id

Detail siswa beserta grades, class, user email.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Student retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "Budi",
    "nisn": "1234567890",
    "class": { "id": "uuid", "name": "10-IPA-1", "gradeLevel": 10 },
    "user": { "email": "budi@test.com" },
    "grades": [
      {
        "id": "uuid",
        "score": 85,
        "semester": 1,
        "academicYear": "2025/2026",
        "subject": { "name": "Matematika" },
        "teacher": { "name": "Pak Guru" }
      }
    ]
  }
}
```

**Errors:** `404` – Student not found / already deleted

---

### DELETE /students/:id

Soft delete siswa ( ADMIN only ). Sets `isDeleted = true`.

**Headers:** `Authorization: Bearer <admin_token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Student deleted successfully"
}
```

**Errors:** `404` – Student not found / already deleted

---

### PUT /students/:id

Update data siswa ( ADMIN only ). Validates NISN uniqueness & class existence.

**Headers:** `Authorization: Bearer <admin_token>`

**Body:** (all fields optional, at least one required)
```json
{
  "name": "Budi Updated",
  "nisn": "9876543210",
  "classId": "uuid-class-baru"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Student updated successfully",
  "data": { "id": "uuid", "name": "...", "nisn": "...", "classId": "..." }
}
```

**Errors:**  
`400` – NISN already in use, class not found  
`404` – Student not found / is deleted

---

## 👨‍🏫 Teachers

### GET /teachers

Daftar guru ( ADMIN only ).

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |
| name | string | – | Filter by name (case-insensitive) |

**Response (200):**
```json
{
  "success": true,
  "message": "Teachers retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Pak Guru",
      "nip": "123456789012345678",
      "email": "guru@test.com"
    }
  ],
  "meta": { "currentPage": 1, "limit": 10, "totalItems": 5, "totalPages": 1 }
}
```

---

### GET /teachers/:id

Detail guru dengan 20 grades terbaru.

**Headers:** `Authorization: Bearer <admin_token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Teacher retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "Pak Guru",
    "nip": "123456789012345678",
    "email": "guru@test.com",
    "grades": [
      {
        "id": "uuid",
        "score": 85,
        "semester": 1,
        "academicYear": "2025/2026",
        "student": { "name": "Siswa A", "nisn": "123" },
        "subject": { "name": "Matematika" }
      }
    ]
  }
}
```

---

### DELETE /teachers/:id

Hapus guru permanen ( ADMIN only ). Hanya bisa jika guru tidak memiliki grades.

**Headers:** `Authorization: Bearer <admin_token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Teacher deleted successfully"
}
```

**Errors:**  
`404` – Teacher not found  
`400` – Teacher has existing grades (cannot delete)

---

### PUT /teachers/:id

Update data guru ( ADMIN only ). Validates NIP uniqueness if changed.

**Headers:** `Authorization: Bearer <admin_token>`

**Body:** (all fields optional, at least one required)
```json
{
  "name": "Guru Baru",
  "nip": "987654321098765432"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Teacher updated successfully",
  "data": { "id": "uuid", "name": "...", "nip": "...", "userId": "..." }
}
```

**Errors:** `400` – NIP already exists

---

## 🏫 Classes

### GET /classes

Daftar kelas dengan jumlah siswa.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |

**Response (200):**
```json
{
  "success": true,
  "message": "Classes retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "name": "10-IPA-1",
      "gradeLevel": 10,
      "studentCount": 15
    }
  ],
  "meta": { "currentPage": 1, "limit": 10, "totalItems": 3, "totalPages": 1 }
}
```

---

### GET /classes/:id

Detail kelas beserta daftar siswa (non-deleted).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Class retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "10-IPA-1",
    "gradeLevel": 10,
    "students": [
      { "id": "uuid", "name": "Siswa A", "nisn": "1234567890" }
    ]
  }
}
```

---

### POST /classes

Buat kelas baru ( ADMIN only ). Name dan gradeLevel harus konsisten.

**Validation Rules:**
- `name`: Must match `/^\d{2}-[A-Za-z]+-\d+$/` → `10-IPA-1`
- `gradeLevel`: Integer between 10 and 12
- Additionally, the two-digit prefix in `name` must equal `gradeLevel` (e.g., `10-IPA-1` requires `gradeLevel: 10`)

**Headers:** `Authorization: Bearer <admin_token>`

**Request:**
```json
{
  "name": "10-IPA-1",
  "gradeLevel": 10
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Class created successfully",
  "data": { "id": "uuid", "name": "10-IPA-1", "gradeLevel": 10 }
}
```

**Errors:**  
`400` – Class name already exists, format invalid, grade prefix mismatch

---

### PUT /classes/:id

Update kelas ( ADMIN only ). Validasi sama seperti POST.

**Headers:** `Authorization: Bearer <admin_token>`

**Request:**
```json
{
  "name": "11-IPS-2",
  "gradeLevel": 11
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Class updated successfully",
  "data": { "id": "uuid", "name": "11-IPS-2", "gradeLevel": 11 }
}
```

---

### DELETE /classes/:id

Hapus kelas ( ADMIN only ). Gagal jika masih ada siswa aktif.

**Headers:** `Authorization: Bearer <admin_token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Class deleted successfully"
}
```

**Errors:** `400` – Class has active students

---

## 📚 Subjects

### GET /subjects

Daftar mata pelajaran.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:** `page`, `limit`

**Response (200):**
```json
{
  "success": true,
  "message": "Subjects retrieved successfully",
  "data": [
    { "id": "uuid", "name": "Matematika" }
  ],
  "meta": { "currentPage": 1, "limit": 10, "totalItems": 5, "totalPages": 1 }
}
```

---

### GET /subjects/:id

Detail mata pelajaran dengan grades terkait.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Subject retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "Matematika",
    "grades": [
      {
        "id": "uuid",
        "score": 85,
        "student": { "name": "Siswa A", "nisn": "123" },
        "teacher": { "name": "Pak Guru" }
      }
    ]
  }
}
```

---

### POST /subjects

Buat mata pelajaran ( ADMIN only ).

**Headers:** `Authorization: Bearer <admin_token>`

**Request:**
```json
{
  "name": "Ekonomi"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Subject created successfully",
  "data": { "id": "uuid", "name": "Ekonomi" }
}
```

---

### PUT /subjects/:id

Update mata pelajaran ( ADMIN only ).

**Headers:** `Authorization: Bearer <admin_token>`

**Request:**
```json
{
  "name": "Ekonomi Internasional"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Subject updated successfully",
  "data": { "id": "uuid", "name": "Ekonomi Internasional" }
}
```

---

### DELETE /subjects/:id

Hapus mata pelajaran ( ADMIN only ). Gagal jika masih ada grade terkait.

**Headers:** `Authorization: Bearer <admin_token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Subject deleted successfully"
}
```

**Errors:** `400` – Subject has associated grades

---

## 📊 Grades

### GET /grades

Daftar semua nilai ( ADMIN & TEACHER ). Mendukung filter.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| semester | number (1\|2) | Filter by semester |
| academicYear | string (`YYYY/YYYY`) | Filter by academic year |
| studentId | uuid | Filter by student |
| subjectId | uuid | Filter by subject |

**Request:**
```
GET /api/v1/grades?semester=1&academicYear=2025/2026&subjectId=uuid
```

**Response (200):**
```json
{
  "success": true,
  "message": "All grades retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "score": 85,
      "semester": 1,
      "academicYear": "2025/2026",
      "student": { "id": "uuid", "name": "Siswa A", "nisn": "123" },
      "subject": { "name": "Matematika" },
      "teacher": { "id": "uuid", "name": "Pak Guru", "nip": "123" }
    }
  ],
  "meta": { "currentPage": 1, "limit": 10, "totalItems": 50, "totalPages": 5 }
}
```

---

### POST /grades

Buat nilai baru ( TEACHER only ). `teacherId` diambil otomatis dari JWT.

**Headers:** `Authorization: Bearer <teacher_token>`

**Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| studentId | uuid | Yes | UUID siswa |
| subjectId | uuid | Yes | UUID mata pelajaran |
| score | number | Yes | 0 – 100 |
| semester | number | Yes | 1 atau 2 |
| academicYear | string | Yes | Format: `YYYY/YYYY` |

**Request:**
```json
{
  "studentId": "uuid-siswa",
  "subjectId": "uuid-mapel",
  "score": 85,
  "semester": 1,
  "academicYear": "2025/2026"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Grade created successfully",
  "data": {
    "id": "uuid",
    "studentId": "uuid-siswa",
    "subjectId": "uuid-mapel",
    "teacherId": "uuid-guru-dari-jwt",
    "score": 85,
    "semester": 1,
    "academicYear": "2025/2026"
  }
}
```

**Errors:**  
`404` – Student or Subject not found  
`400` – Student is deleted, score out of range  
`403` – Not a teacher

---

### GET /grades/my-grades

Nilai milik sendiri ( STUDENT only ). Filter by semester & academicYear optional.

**Headers:** `Authorization: Bearer <student_token>`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| semester | number (1\|2) | Optional filter |
| academicYear | string | Optional filter |

**Request:**
```
GET /api/v1/grades/my-grades?semester=1&academicYear=2025/2026
```

**Response (200):**
```json
{
  "success": true,
  "message": "Grades retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "score": 85,
      "semester": 1,
      "academicYear": "2025/2026",
      "subject": { "name": "Matematika" },
      "teacher": { "id": "uuid", "name": "Pak Guru", "nip": "123" }
    }
  ],
  "meta": { "currentPage": 1, "limit": 10, "totalItems": 5, "totalPages": 1 }
}
```

**Errors:** `404` – Student profile not found

---

## Appendix

### Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/auth/login` | 5 attempts per 15 minutes |

### Pagination Defaults

- Default `limit` = 10
- Max `limit` = 100
- `page` starts at 1

### UUID Format

All resource IDs are UUIDs (version 4).

### Academic Year Format

Must be exactly `YYYY/YYYY`, e.g., `2025/2026`.

### Soft Delete Behavior

- `GET /students` automatically excludes `isDeleted: true`
- `GET /students/:id` returns 404 if student is deleted
- `DELETE /students/:id` sets `isDeleted = true` (idempotent – returns success even if already deleted)

---

*End of API Documentation*
