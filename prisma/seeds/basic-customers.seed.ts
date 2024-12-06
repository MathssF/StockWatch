import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.customer.createMany({
    data: [
      {
        name: 'Alice',
        lastname: 'Smith',
        email: 'alice@example.com',
        phone: '1234567890',
        insta: '@alice_smith_test',
        birthdate: new Date('1990-01-15'),
      },
      {
        name: 'Bob',
        lastname: 'Johnson',
        email: 'bob@example.com',
        phone: '2345678901',
        insta: '@bob_johnson_test',
        birthdate: new Date('1985-05-20'),
      },
      {
        name: 'Charlie',
        lastname: 'Brown',
        email: 'charlie@example.com',
        phone: '3456789012',
        insta: '@charlie_brown_test',
        birthdate: new Date('1992-11-10'),
      },
      {
        name: 'Diana',
        lastname: 'Prince',
        email: 'diana@example.com',
        phone: '4567890123',
        insta: '@diana_prince_test',
        birthdate: new Date('1988-03-25'),
      },
      {
        name: 'Eve',
        lastname: 'Taylor',
        email: 'eve@example.com',
        phone: '5678901234',
        insta: '@eve_taylor_test',
        birthdate: new Date('1995-07-08'),
      },
    ],
  });

  console.log('Seed data created for Customers!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
