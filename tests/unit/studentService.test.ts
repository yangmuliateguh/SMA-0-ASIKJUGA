import * as studentService from '../../src/services/studentService';
import prisma from '../../src/config/db';

declare global {
  namespace NodeJS {
    interface Global {
      mockPrismaData: {
        students: any[];
        users: any[];
        subjects: any[];
        grades: any[];
        teachers?: any[];
      };
    }
  }
}

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

describe('StudentService', () => {
  let findManySpy: jest.SpyInstance;
  let findUniqueSpy: jest.SpyInstance;
  let updateSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    findManySpy = jest.spyOn(prisma.student, 'findMany');
    findUniqueSpy = jest.spyOn(prisma.student, 'findUnique');
    updateSpy = jest.spyOn(prisma.student, 'update');
  });

  describe('getAllStudentsService', () => {
    it('should return all active students', async () => {
      findManySpy.mockResolvedValue(mockStudents);

      const result = await studentService.getAllStudentsService();

      expect(findManySpy).toHaveBeenCalledWith({
        where: { isDeleted: false },
        include: { class: true },
        orderBy: { name: 'asc' },
      });
      expect(result).toHaveLength(2);
    });

    it('should filter students by classId', async () => {
      findManySpy.mockResolvedValue(mockStudents);

      const result = await studentService.getAllStudentsService('class-1');

      expect(findManySpy).toHaveBeenCalledWith({
        where: { isDeleted: false, classId: 'class-1' },
        include: { class: true },
        orderBy: { name: 'asc' },
      });
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no students exist', async () => {
      findManySpy.mockResolvedValue([]);

      const result = await studentService.getAllStudentsService();

      expect(result).toHaveLength(0);
    });
  });

  describe('deleteStudentService', () => {
    it('should soft delete a student successfully', async () => {
      findUniqueSpy.mockResolvedValueOnce({ id: 'student-1', isDeleted: false });
      updateSpy.mockResolvedValueOnce({ id: 'student-1', isDeleted: true });

      const result = await studentService.deleteStudentService('student-1');

      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 'student-1' },
        data: { isDeleted: true },
      });
      expect(result.isDeleted).toBe(true);
    });

    it('should throw error when student not found', async () => {
      findUniqueSpy.mockResolvedValueOnce(null);

      await expect(
        studentService.deleteStudentService('nonexistent-id')
      ).rejects.toThrow('Student not found');
    });

    it('should throw error when student already deleted', async () => {
      findUniqueSpy.mockResolvedValueOnce({ id: 'student-1', isDeleted: true });

      await expect(studentService.deleteStudentService('student-1')).rejects.toThrow(
        'Student already deleted'
      );
    });
  });
});