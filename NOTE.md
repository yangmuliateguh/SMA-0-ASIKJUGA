# SMA 0 ASIKJUGA - Catatan Operasional

---

## Credential Login

| Role | Email | Password |
|------|-------|----------|
| ADMIN | admin@sma0asikjuga.com | password123 |
| TEACHER | (see seed output) | guru123 |
| STUDENT | (see seed output) | siswa123 |

---

## Environment Variables (.env)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/sma0asikjuga
JWT_SECRET=your-secret-key-minimum-32-characters
NODE_ENV=development
PORT=3000
```

---

## Commands

### Development
```bash
npm run dev          # Run dev server with hot-reload
npm run build        # Compile TypeScript to dist/
npm run start        # Run production server
```

### Database Setup
```bash
npm run prisma:generate    # Generate Prisma Client
npm run prisma:migrate     # Run database migrations
npm run prisma:seed       # Seed database with initial data
npm run test:setup        # Generate + Migrate + Seed
```

### Testing
```bash
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage# Run tests with coverage report
npm run test:unit   # Run unit tests only
npm run test:integration  # Run integration tests only
```

---

## Struktur Project

```
src/
├── config/       # env.ts, db.ts
├── controllers/  # HTTP handlers
├── middlewares/  # Auth, validation, error handling
├── routes/       # API endpoints
├── services/     # Business logic
├── utils/        # Helpers (auth, logger)
└── validations/  # Zod schemas
```

---

## Personal Note
note:
- post grade : 
{
  "studentId": "e1c48d9e-3a6f-44bc-a135-eed360b879ca",
  "subjectId": "27cfab2e-d8ab-41d7-b343-1a52ed2a66ab",
  "score": 69,
  "semester": 1,
  "academicYear": "2025/2026"
}
result:
{
    "success": false,
    "message": "\nInvalid `prisma.grade.create()` invocation in\nD:\\GRINDING\\GUDANG\\SMA 0 ASIKJUGA\\src\\services\\gradeService.ts:51:36\n\n  48   throw new AppError('Subject not found', 404);\n  49 }\n  50 \n→ 51 const grade = await prisma.grade.create(\nForeign key constraint violated on the constraint: `Grade_teacherId_fkey`",
    "error": "PrismaClientKnownRequestError: \nInvalid `prisma.grade.create()` invocation in\nD:\\GRINDING\\GUDANG\\SMA 0 ASIKJUGA\\src\\services\\gradeService.ts:51:36\n\n  48   throw new AppError('Subject not found', 404);\n  49 }\n  50 \n→ 51 const grade = await prisma.grade.create(\nForeign key constraint violated on the constraint: `Grade_teacherId_fkey`\n    at Gr.handleRequestError (D:\\GRINDING\\GUDANG\\SMA 0 ASIKJUGA\\node_modules\\@prisma\\client\\src\\runtime\\RequestHandler.ts:237:13)\n    at Gr.handleAndLogRequestError (D:\\GRINDING\\GUDANG\\SMA 0 ASIKJUGA\\node_modules\\@prisma\\client\\src\\runtime\\RequestHandler.ts:183:12)\n    at Gr.request (D:\\GRINDING\\GUDANG\\SMA 0 ASIKJUGA\\node_modules\\@prisma\\client\\src\\runtime\\RequestHandler.ts:152:12)\n    at processTicksAndRejections (node:internal/process/task_queues:105:5)\n    at a (D:\\GRINDING\\GUDANG\\SMA 0 ASIKJUGA\\node_modules\\@prisma\\client\\src\\runtime\\getPrismaClient.ts:938:24)\n    at createGradeService (D:\\GRINDING\\GUDANG\\SMA 0 ASIKJUGA\\src\\services\\gradeService.ts:51:17)\n    at createGradeController (D:\\GRINDING\\GUDANG\\SMA 0 ASIKJUGA\\src\\controllers\\gradeController.ts:16:20)"
}