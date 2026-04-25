import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT']),
  name: z.string().min(1, 'Name is required'),
  nisn: z.string().optional(),
  nip: z.string().optional(),
  classId: z.string().uuid('Invalid classId format').optional(),
});

export const createGradeSchema = z.object({
  studentId: z.string().uuid('Invalid studentId format'),
  subjectId: z.string().uuid('Invalid subjectId format'),
  score: z.number().min(0, 'Score cannot be less than 0').max(100, 'Score cannot be more than 100'),
  semester: z.number().int().min(1).max(2, 'Semester must be 1 or 2'),
  academicYear: z.string().regex(/^\d{4}\/\d{4}$/, 'Academic year must be in format YYYY/YYYY'),
});

export const studentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  name: z.string().optional(),
  classId: z.string().uuid('Invalid classId format').optional(),
});

export const gradeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  semester: z.coerce.number().int().min(1).max(2).optional(),
  academicYear: z.string().regex(/^\d{4}\/\d{4}$/, 'Academic year must be in format YYYY/YYYY').optional(),
  studentId: z.string().uuid('Invalid studentId format').optional(),
  subjectId: z.string().uuid('Invalid subjectId format').optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type CreateGradeInput = z.infer<typeof createGradeSchema>;
export type StudentQueryInput = z.infer<typeof studentQuerySchema>;
export type GradeQueryInput = z.infer<typeof gradeQuerySchema>;

export const classSchema = z.object({
  name: z.string().min(1, 'Class name is required').regex(
    /^\d{2}-[A-Za-z]+-\d+$/,
    'Class name must be in format GRADE-MAJOR-NUMBER (e.g., 10-IPA-1)'
  ),
  gradeLevel: z.number().int().min(10).max(12, 'Grade level must be between 10 and 12'),
}).refine(data => {
  const match = data.name.match(/^(\d{2})-([A-Za-z]+)-(\d+)$/);
  if (!match) return false;
  const gradeFromName = parseInt(match[1], 10);
  return gradeFromName === data.gradeLevel;
}, {
  message: 'Class name grade prefix must match gradeLevel',
  path: ['name'],
});

export const subjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
});

export const teacherQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  name: z.string().optional(),
});

export const classQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const subjectQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const updateStudentSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  nisn: z.string().optional(),
  classId: z.string().uuid('Invalid classId format').optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

export const updateTeacherSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  nip: z.string().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});