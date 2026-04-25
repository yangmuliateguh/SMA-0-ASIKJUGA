import { Router } from 'express';
import authRoutes from './authRoutes';
import studentRoutes from './studentRoutes';
import gradeRoutes from './gradeRoutes';
import teacherRoutes from './teacherRoutes';
import classRoutes from './classRoutes';
import subjectRoutes from './subjectRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/grades', gradeRoutes);
router.use('/teachers', teacherRoutes);
router.use('/classes', classRoutes);
router.use('/subjects', subjectRoutes);

export default router;