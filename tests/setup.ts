import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

const mockStudents = [
  {
    id: 'student-1',
    userId: 'user-student-1',
    name: 'Budi Santoso',
    nisn: '1234567890',
    classId: 'class-1',
    isDeleted: false,
    class: { id: 'class-1', name: 'X IPA 1', gradeLevel: 10 },
  },
  {
    id: 'student-2',
    userId: 'user-student-2',
    name: 'Ani Wijaya',
    nisn: '1234567891',
    classId: 'class-1',
    isDeleted: false,
    class: { id: 'class-1', name: 'X IPA 1', gradeLevel: 10 },
  },
];

const mockUsers = [
  {
    id: 'user-admin-1',
    email: 'admin@school.id',
    password: '$2b$10$hashedpassword',
    role: 'ADMIN' as const,
  },
  {
    id: 'user-teacher-1',
    email: 'ahmad@school.id',
    password: '$2b$10$hashedpassword',
    role: 'TEACHER' as const,
  },
  {
    id: 'user-student-1',
    email: 'budi@school.id',
    password: '$2b$10$hashedpassword',
    role: 'STUDENT' as const,
  },
];

const mockSubjects = [
  { id: 'subject-1', name: 'Matematika' },
  { id: 'subject-2', name: 'Bahasa Indonesia' },
];

const mockGrades = [
  {
    id: 'grade-1',
    studentId: 'student-1',
    subjectId: 'subject-1',
    teacherId: 'teacher-1',
    score: 85,
    semester: 1,
    academicYear: '2025/2026',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockTeachers = [
  { id: 'teacher-1', userId: 'user-teacher-1', name: 'Pak Ahmad', nip: '123456789' },
];

global.mockPrismaData = {
  students: mockStudents,
  users: mockUsers,
  subjects: mockSubjects,
  grades: mockGrades,
  teachers: mockTeachers,
};

afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
});