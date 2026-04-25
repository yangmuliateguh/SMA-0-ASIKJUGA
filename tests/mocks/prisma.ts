import { Role } from '@prisma/client';

export const mockStudents = [
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

export const mockTeachers = [
  {
    id: 'teacher-1',
    userId: 'user-teacher-1',
    name: 'Pak Ahmad',
    nip: '123456789',
    user: { id: 'user-teacher-1', email: 'ahmad@school.id', password: 'hashed', role: Role.TEACHER },
  },
];

export const mockUsers = [
  {
    id: 'user-admin-1',
    email: 'admin@school.id',
    password: '$2b$10$mockhashedpassword',
    role: Role.ADMIN,
  },
  {
    id: 'user-teacher-1',
    email: 'ahmad@school.id',
    password: '$2b$10$mockhashedpassword',
    role: Role.TEACHER,
  },
  {
    id: 'user-student-1',
    email: 'budi@school.id',
    password: '$2b$10$mockhashedpassword',
    role: Role.STUDENT,
  },
];

export const mockClasses = [
  { id: 'class-1', name: 'X IPA 1', gradeLevel: 10 },
  { id: 'class-2', name: 'X IPA 2', gradeLevel: 10 },
];

export const mockSubjects = [
  { id: 'subject-1', name: 'Matematika' },
  { id: 'subject-2', name: 'Bahasa Indonesia' },
];

export const mockGrades = [
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
    student: mockStudents[0],
    subject: mockSubjects[0],
    teacher: mockTeachers[0],
  },
];

export const createMockPrisma = () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findFirst: jest.fn(),
  },
  student: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  teacher: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  grade: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  subject: {
    findUnique: jest.fn(),
  },
  class: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn((callback: any) => callback({
    user: {
      create: jest.fn().mockResolvedValue({ id: 'new-user-id', email: 'test@test.com' }),
      findUnique: jest.fn(),
    },
    student: {
      create: jest.fn().mockResolvedValue({ id: 'new-student-id' }),
      findUnique: jest.fn(),
    },
    teacher: {
      create: jest.fn().mockResolvedValue({ id: 'new-teacher-id' }),
      findUnique: jest.fn(),
    },
  })),
});

export const resetMocks = (mockPrisma: ReturnType<typeof createMockPrisma>) => {
  Object.values(mockPrisma).forEach((model: any) => {
    if (model && typeof model === 'object') {
      Object.values(model).forEach((method: any) => {
        if (method && typeof method === 'function' && 'mockReset' in method) {
          method.mockReset();
        }
      });
    }
  });
  });
};