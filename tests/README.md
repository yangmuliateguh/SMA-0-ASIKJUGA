# Test Configuration

## Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Setup test database:
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations for test database
npm run prisma:migrate

# Seed test data (optional)
npm run prisma:seed
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Unit Tests Only
```bash
npm run test:unit
```

### Run Integration Tests Only
```bash
npm run test:integration
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

## Test Structure

```
tests/
├── unit/                    # Unit Tests (Business Logic with Mocking)
│   ├── studentService.test.ts
│   ├── authService.test.ts
│   └── gradeService.test.ts
├── integration/              # Integration Tests (API End-to-End)
│   ├── auth.test.ts
│   ├── student.test.ts
│   └── grade.test.ts
├── helpers/
│   └── app.ts              # Test helpers for supertest
├── __mocks__/
│   └── db.ts              # Mock database functions
└── setup.ts              # Test setup and global mocks
```

## Environment Variables

Create `.env.test` file in project root:
```env
NODE_ENV=test
DATABASE_URL=postgresql://postgres:password@localhost:5432/sma_test
JWT_SECRET=test-secret-key-for-testing-only
PORT=3001
```

## Test Coverage

Coverage report will be generated in `coverage/` directory after running tests with coverage.