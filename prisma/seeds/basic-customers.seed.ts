import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

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
        pass: await bcrypt.hash('123A', 10),
        birthdate: new Date('1990-01-15'),
        preferences: {
          create: [
            { detail: { connect: { id: 201 } } }, // size
            { detail: { connect: { id: 501 } } }, // style
          ],
        },
      },
      {
        name: 'Bob',
        lastname: 'Johnson',
        email: 'bob@example.com',
        phone: '2345678901',
        insta: '@bob_johnson_test',
        pass: await bcrypt.hash('123B', 10),
        birthdate: new Date('1985-05-20'),
        preferences: {
          create: [
            { detail: { connect: { id: 202 } } }, // size
            { detail: { connect: { id: 502 } } }, // style
          ],
        },
      },
      {
        name: 'Charlie',
        lastname: 'Brown',
        email: 'charlie@example.com',
        phone: '3456789012',
        insta: '@charlie_brown_test',
        pass: await bcrypt.hash('123C', 10),
        birthdate: new Date('1992-11-10'),
        preferences: {
          create: [
            { detail: { connect: { id: 203 } } }, // size
            { detail: { connect: { id: 503 } } }, // style
          ],
        },
      },
      {
        name: 'Diana',
        lastname: 'Prince',
        email: 'diana@example.com',
        phone: '4567890123',
        insta: '@diana_prince_test',
        pass: await bcrypt.hash('123D', 10),
        birthdate: new Date('1988-03-25'),
        preferences: {
          create: [
            { detail: { connect: { id: 204 } } }, // size
            { detail: { connect: { id: 504 } } }, // style
          ],
        },
      },
      {
        name: 'Eve',
        lastname: 'Taylor',
        email: 'eve@example.com',
        phone: '5678901234',
        insta: '@eve_taylor_test',
        pass: await bcrypt.hash('123E', 10),
        birthdate: new Date('1995-07-08'),
        preferences: {
          create: [
            { detail: { connect: { id: 201 } } }, // size
            { detail: { connect: { id: 505 } } }, // style
          ],
        },
      },
      {
        name: 'Frank',
        lastname: 'Anderson',
        email: 'frank@example.com',
        phone: '6789012345',
        insta: '@frank_anderson_test',
        pass: await bcrypt.hash('123F', 10),
        birthdate: new Date('1993-09-12'),
        preferences: {
          create: [
            { detail: { connect: { id: 202 } } }, // size
            { detail: { connect: { id: 506 } } }, // style
          ],
        },
      },
      {
        name: 'Grace',
        lastname: 'White',
        email: 'grace@example.com',
        phone: '7890123456',
        insta: '@grace_white_test',
        pass: await bcrypt.hash('123G', 10),
        birthdate: new Date('1994-12-01'),
        preferences: {
          create: [
            { detail: { connect: { id: 203 } } }, // size
            { detail: { connect: { id: 501 } } }, // style
          ],
        },
      },
      {
        name: 'Henry',
        lastname: 'Clark',
        email: 'henry@example.com',
        phone: '8901234567',
        insta: '@henry_clark_test',
        pass: await bcrypt.hash('123H', 10),
        birthdate: new Date('1991-06-17'),
        preferences: {
          create: [
            { detail: { connect: { id: 204 } } }, // size
            { detail: { connect: { id: 502 } } }, // style
          ],
        },
      },
    ],
  });

  console.log('Seed data created for Customers with Preferences!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
