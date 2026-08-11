const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  const users = [
    {
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'Admin@123',
      role: 'ADMIN',
    },
    {
      name: 'Sales User',
      email: 'sales@test.com',
      password: 'Sales@123',
      role: 'SALES',
    },
    {
      name: 'Warehouse User',
      email: 'warehouse@test.com',
      password: 'Warehouse@123',
      role: 'WAREHOUSE',
    },
    {
      name: 'Accounts User',
      email: 'accounts@test.com',
      password: 'Accounts@123',
      role: 'ACCOUNTS',
    },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    
    // Use upsert so the script can be safely re-run without duplicate errors
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
      },
    });
    console.log(`Created/Verified user: ${user.name} (${user.role})`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
