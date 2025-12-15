import { PrismaClient, PersonType, PersonStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface SeedPerson {
  id: number;
  name: string;
  jobTitle: string;
  department: string;
  managerId: number | null;
  photoPath: string;
  type: string;
  status: string;
  workEmail: string;
  hireDate: string;
  location: string;
}

async function main(): Promise<void> {
  console.log('🌱 Starting seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.eventLog.deleteMany();
  await prisma.person.deleteMany();

  console.log('✅ Cleared existing data');

  // Reset sequence
  try {
    await prisma.$executeRaw`ALTER SEQUENCE people_id_seq RESTART WITH 1`;
  } catch (error) {
    console.log('⚠️  Could not reset sequence (might not exist yet)');
  }

  // Load JSON data - check both possible locations
  let jsonPath = path.join(__dirname, 'org-chart-people-100.json');
  if (!fs.existsSync(jsonPath)) {
    jsonPath = path.join(__dirname, '..', 'org-chart-people-100.json');
  }

  if (!fs.existsSync(jsonPath)) {
    console.error('❌ org-chart-people-100.json not found at:', jsonPath);
    process.exit(1);
  }

  const jsonData = fs.readFileSync(jsonPath, 'utf-8');
  const people: SeedPerson[] = JSON.parse(jsonData);

  console.log(`📝 Found ${people.length} people in JSON file`);
  console.log(`📝 Inserting people...`);

  // Insert people in order (to respect foreign key constraints)
  for (const person of people) {
    await prisma.person.create({
      data: {
        name: person.name,
        jobTitle: person.jobTitle,
        department: person.department,
        managerId: person.managerId,
        photoPath: person.photoPath,
        type: person.type as PersonType,
        status: person.status as PersonStatus,
        email: person.workEmail,
        phone: null,
        location: person.location,
        hireDate: new Date(person.hireDate),
      },
    });

    if (person.id % 20 === 0) {
      console.log(`   Inserted ${person.id} people...`);
    }
  }

  console.log('✅ Seed completed successfully!');

  // Print summary
  const totalPeople = await prisma.person.count();
  const totalEmployees = await prisma.person.count({ where: { type: 'Employee' } });
  const totalPartners = await prisma.person.count({ where: { type: 'Partner' } });
  const totalActive = await prisma.person.count({ where: { status: 'Active' } });
  const totalInactive = await prisma.person.count({ where: { status: 'Inactive' } });

  const departments = await prisma.person.groupBy({
    by: ['department'],
    _count: { department: true },
    orderBy: { _count: { department: 'desc' } },
  });

  console.log('\n📊 Summary:');
  console.log(`   Total people: ${totalPeople}`);
  console.log(`   Employees: ${totalEmployees}`);
  console.log(`   Partners: ${totalPartners}`);
  console.log(`   Active: ${totalActive}`);
  console.log(`   Inactive: ${totalInactive}`);
  console.log('\n📁 By Department:');
  departments.forEach((d) => {
    console.log(`   ${d.department}: ${d._count.department}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
