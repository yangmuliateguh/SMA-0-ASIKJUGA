import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || '';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const reset = '\x1b[0m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const cyan = '\x1b[36m';
const magenta = '\x1b[35m';
const red = '\x1b[31m';

async function main() {
  console.log(`${cyan}🔄 Clearing database...${reset}`);

  await prisma.grade.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.class.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  console.log(`${green}✅ Database cleared${reset}`);

  const hashedPassword = await bcrypt.hash('password123', 10);
  console.log(`${cyan}🔐 Seeding Admin...${reset}`);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@sma0asikjuga.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log(`${green}✅ Admin created: ${admin.email}${reset}`);

  console.log(`${cyan}🏫 Seeding Master Data (Class & Subject)...${reset}`);

  const classes = await prisma.class.createManyAndReturn({
    data: [
      { name: '10-IPA', gradeLevel: 10 },
      { name: '11-IPS', gradeLevel: 11 },
      { name: '12-BAHASA', gradeLevel: 12 },
    ],
  });

  const subjects = await prisma.subject.createManyAndReturn({
    data: [
      { name: 'Matematika' },
      { name: 'Fisika' },
      { name: 'Biologi' },
      { name: 'Kimia' },
      { name: 'Bahasa Inggris' },
    ],
  });

  console.log(`${green}✅ Created ${classes.length} classes and ${subjects.length} subjects${reset}`);

  console.log(`${cyan}👨‍🏫 Seeding Teachers...${reset}`);

  const teacherUsers = [];
  for (let i = 0; i < 5; i++) {
    const hashedPasswordGuru = await bcrypt.hash('guru123', 10);
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email({ firstName: 'guru', lastName: faker.person.lastName() }).toLowerCase(),
        password: hashedPasswordGuru,
        role: 'TEACHER',
      },
    });
    teacherUsers.push(user);
  }

  const teachers = [];
  for (let i = 0; i < teacherUsers.length; i++) {
    const teacher = await prisma.teacher.create({
      data: {
        userId: teacherUsers[i].id,
        name: faker.person.fullName(),
        nip: faker.string.numeric(18),
      },
    });
    teachers.push(teacher);
  }

  console.log(`${green}✅ Created ${teachers.length} teachers${reset}`);

  console.log(`${cyan}🎓 Seeding Students...${reset}`);

  const studentUsers = [];
  for (let i = 0; i < 20; i++) {
    const hashedPasswordSiswa = await bcrypt.hash('siswa123', 10);
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email({ firstName: 'siswa', lastName: faker.person.lastName() }).toLowerCase(),
        password: hashedPasswordSiswa,
        role: 'STUDENT',
      },
    });
    studentUsers.push(user);
  }

  const students = [];
  for (let i = 0; i < studentUsers.length; i++) {
    const randomClass = classes[Math.floor(Math.random() * classes.length)];
    const student = await prisma.student.create({
      data: {
        userId: studentUsers[i].id,
        name: faker.person.fullName(),
        nisn: faker.string.numeric(10),
        classId: randomClass.id,
      },
    });
    students.push(student);
  }

  console.log(`${green}✅ Created ${students.length} students${reset}`);

  console.log(`${cyan}📊 Seeding Grades (50 records)...${reset}`);

  const gradesData = [];
  for (let i = 0; i < 50; i++) {
    const randomStudent = students[Math.floor(Math.random() * students.length)];
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
    const randomTeacher = teachers[Math.floor(Math.random() * teachers.length)];

    gradesData.push({
      studentId: randomStudent.id,
      subjectId: randomSubject.id,
      teacherId: randomTeacher.id,
      score: faker.number.int({ min: 50, max: 100 }),
      semester: 1,
      academicYear: '2025/2026',
    });
  }

  await prisma.grade.createMany({ data: gradesData });

  console.log(`${green}✅ Created 50 grade records${reset}`);

  console.log(`${magenta}🎉 SEEDING COMPLETE!${reset}`);
  console.log(`${yellow}📧 Admin Login: admin@sma0asikjuga.com / password123${reset}`);
  console.log(`${yellow}📧 Teacher Login: [email from seed] / guru123${reset}`);
  console.log(`${yellow}📧 Student Login: [email from seed] / siswa123${reset}`);
}

main()
  .catch((e) => {
    console.error(`${red}❌ Seeding error: ${e}${reset}`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log(`${cyan}🔌 Disconnected from database${reset}`);
  });
