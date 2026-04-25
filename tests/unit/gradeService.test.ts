import * as gradeService from '../../src/services/gradeService';
import prisma from '../../src/config/db';

const mockStudent = {
  id: 'student-1',
  userId: 'user-student-1',
  name: 'Budi Santoso',
  nisn: '1234567890',
  classId: 'class-1',
  isDeleted: false,
};

const mockSubject = {
  id: 'subject-1',
  name: 'Matematika',
};

const mockTeacher = {
  id: 'teacher-1',
  userId: 'user-teacher-1',
  name: 'Pak Ahmad',
  nip: '123456789',
};

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
    student: mockStudent,
    subject: mockSubject,
    teacher: {
      id: 'teacher-1',
      name: 'Pak Ahmad',
      nip: '123456789',
    },
  },
];

describe('GradeService', () => {
  let findUniqueStudentSpy: jest.SpyInstance;
  let findUniqueSubjectSpy: jest.SpyInstance;
  let createGradeSpy: jest.SpyInstance;
  let findManyGradesSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    findUniqueStudentSpy = jest.spyOn(prisma.student, 'findUnique');
    findUniqueSubjectSpy = jest.spyOn(prisma.subject, 'findUnique');
    createGradeSpy = jest.spyOn(prisma.grade, 'create');
    findManyGradesSpy = jest.spyOn(prisma.grade, 'findMany');
  });

  describe('createGradeService', () => {
    it('should create grade successfully', async () => {
      findUniqueStudentSpy.mockResolvedValueOnce(mockStudent);
      findUniqueSubjectSpy.mockResolvedValueOnce(mockSubject);
      createGradeSpy.mockResolvedValueOnce({
        id: 'grade-new',
        ...mockGrades[0],
      });

      const result = await gradeService.createGradeService({
        studentId: 'student-1',
        subjectId: 'subject-1',
        score: 85,
        semester: 1,
        academicYear: '2025/2026',
        teacherId: 'teacher-1',
      });

      expect(createGradeSpy).toHaveBeenCalledWith({
        data: {
          studentId: 'student-1',
          subjectId: 'subject-1',
          teacherId: 'teacher-1',
          score: 85,
          semester: 1,
          academicYear: '2025/2026',
        },
      });
      expect(result.score).toBe(85);
    });

    it('should throw error when student not found', async () => {
      findUniqueStudentSpy.mockResolvedValueOnce(null);

      await expect(
        gradeService.createGradeService({
          studentId: 'nonexistent-student',
          subjectId: 'subject-1',
          score: 85,
          semester: 1,
          academicYear: '2025/2026',
          teacherId: 'teacher-1',
        })
      ).rejects.toThrow('Student not found');
    });

    it('should throw error when student is deleted', async () => {
      findUniqueStudentSpy.mockResolvedValueOnce({
        ...mockStudent,
        isDeleted: true,
      });

      await expect(
        gradeService.createGradeService({
          studentId: 'student-1',
          subjectId: 'subject-1',
          score: 85,
          semester: 1,
          academicYear: '2025/2026',
          teacherId: 'teacher-1',
        })
      ).rejects.toThrow('Cannot add grade to deleted student');
    });

    it('should throw error when subject not found', async () => {
      findUniqueStudentSpy.mockResolvedValueOnce(mockStudent);
      findUniqueSubjectSpy.mockResolvedValueOnce(null);

      await expect(
        gradeService.createGradeService({
          studentId: 'student-1',
          subjectId: 'nonexistent-subject',
          score: 85,
          semester: 1,
          academicYear: '2025/2026',
          teacherId: 'teacher-1',
        })
      ).rejects.toThrow('Subject not found');
    });

    it('should reject score below 0', async () => {
      findUniqueStudentSpy.mockResolvedValueOnce(mockStudent);
      findUniqueSubjectSpy.mockResolvedValueOnce(mockSubject);

      await expect(
        gradeService.createGradeService({
          studentId: 'student-1',
          subjectId: 'subject-1',
          score: -1,
          semester: 1,
          academicYear: '2025/2026',
          teacherId: 'teacher-1',
        })
      ).rejects.toThrow('-score: Number must be greater than or equal to 0');
    });

    it('should reject score above 100', async () => {
      findUniqueStudentSpy.mockResolvedValueOnce(mockStudent);
      findUniqueSubjectSpy.mockResolvedValueOnce(mockSubject);

      await expect(
        gradeService.createGradeService({
          studentId: 'student-1',
          subjectId: 'subject-1',
          score: 101,
          semester: 1,
          academicYear: '2025/2026',
          teacherId: 'teacher-1',
        })
      ).rejects.toThrow('score: Number must be less than or equal to 100');
    });
  });

  describe('getMyGradesService', () => {
    it('should return grades for student', async () => {
      findUniqueStudentSpy.mockResolvedValueOnce(mockStudent);
      findManyGradesSpy.mockResolvedValueOnce(mockGrades);

      const result = await gradeService.getMyGradesService('user-student-1');

      expect(findUniqueStudentSpy).toHaveBeenCalledWith({
        where: { userId: 'user-student-1' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].score).toBe(85);
    });

    it('should throw error when student profile not found', async () => {
      findUniqueStudentSpy.mockResolvedValueOnce(null);

      await expect(
        gradeService.getMyGradesService('nonexistent-user')
      ).rejects.toThrow('Student profile not found');
    });
  });
});