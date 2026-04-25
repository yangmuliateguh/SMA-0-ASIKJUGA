import { Role } from '@prisma/client';

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

const mockTeachers = [
  {
    id: 'teacher-1',
    userId: 'user-teacher-1',
    name: 'Pak Ahmad',
    nip: '123456789',
  },
];

const mockUsers = [
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
    student: mockStudents[0],
    subject: mockSubjects[0],
    teacher: mockTeachers[0],
  },
];

type MockFn = ReturnType<typeof jest.fn>;
type PrismaMock = {
  user: {
    findUnique: MockFn;
    create: MockFn;
  };
  student: {
    findMany: MockFn;
    findUnique: MockFn;
    create: MockFn;
    update: MockFn;
  };
  teacher: {
    findUnique: MockFn;
    create: MockFn;
  };
  grade: {
    findMany: MockFn;
    create: MockFn;
  };
  subject: {
    findUnique: MockFn;
  };
  $transaction: MockFn;
};

const prismaMock: PrismaMock = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  student: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
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
  $transaction: jest.fn(),
};

prismaMock.user.findUnique.mockImplementation(({ where }: { where: { email?: string; id?: string } }) => {
  if (where?.email) {
    const user = mockUsers.find(u => u.email === where.email);
    return Promise.resolve(user || null);
  }
  if (where?.id) {
    const user = mockUsers.find(u => u.id === where.id);
    return Promise.resolve(user || null);
  }
  return Promise.resolve(null);
});

prismaMock.student.findMany.mockImplementation(() => {
  return Promise.resolve(mockStudents.filter(s => !s.isDeleted));
});

prismaMock.student.findUnique.mockImplementation(({ where }: { where: { id?: string; nisn?: string; userId?: string } }) => {
  if (where?.id) {
    const student = mockStudents.find(s => s.id === where.id);
    return Promise.resolve(student || null);
  }
  if (where?.nisn) {
    const student = mockStudents.find(s => s.nisn === where.nisn);
    return Promise.resolve(student || null);
  }
  if (where?.userId) {
    const student = mockStudents.find(s => s.userId === where.userId);
    return Promise.resolve(student || null);
  }
  return Promise.resolve(null);
});

prismaMock.student.update.mockImplementation(({ where, data }: any) => {
  const student = mockStudents.find(s => s.id === where.id);
  return Promise.resolve({ ...student, ...data });
});

prismaMock.teacher.findUnique.mockImplementation(({ where }: { where: { nip?: string; id?: string } }) => {
  if (where?.nip) {
    const teacher = mockTeachers.find(t => t.nip === where.nip);
    return Promise.resolve(teacher || null);
  }
  return Promise.resolve(null);
});

prismaMock.subject.findUnique.mockImplementation(({ where }: { where: { id?: string } }) => {
  if (where?.id) {
    const subject = mockSubjects.find(s => s.id === where.id);
    return Promise.resolve(subject || null);
  }
  return Promise.resolve(null);
});

prismaMock.grade.create.mockImplementation((data: any) => {
  return Promise.resolve({
    id: 'grade-new',
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
});

prismaMock.grade.findMany.mockImplementation(() => {
  return Promise.resolve(mockGrades);
});

prismaMock.$transaction.mockImplementation((callback: any) => callback({
  user: {
    create: jest.fn().mockResolvedValue({ id: 'new-user-id', email: 'test@test.com' }),
  },
  student: {
    create: jest.fn().mockResolvedValue({ id: 'new-student-id' }),
  },
  teacher: {
    create: jest.fn().mockResolvedValue({ id: 'new-teacher-id' }),
  },
}));

export default prismaMock;