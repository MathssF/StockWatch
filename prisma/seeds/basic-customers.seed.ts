import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const customers = [
    {
      name: 'Alice',
      lastname: 'Smith',
      email: 'alice@example.com',
      phone: '1234567890',
      insta: '@alice_smith_test',
      pass: '123A',
      birthdate: new Date('1990-01-15'),
      preferences: [201, 501],
    },
    {
      name: 'Bob',
      lastname: 'Johnson',
      email: 'bob@example.com',
      phone: '2345678901',
      insta: '@bob_johnson_test',
      pass: '123B',
      birthdate: new Date('1985-05-20'),
      preferences: [202, 502],
    },
    {
      name: 'Charlie',
      lastname: 'Brown',
      email: 'charlie@example.com',
      phone: '3456789012',
      insta: '@charlie_brown_test',
      pass: '123C',
      birthdate: new Date('1992-11-10'),
      preferences: [203, 503],
    },
    {
      name: 'Diana',
      lastname: 'Prince',
      email: 'diana@example.com',
      phone: '4567890123',
      insta: '@diana_prince_test',
      pass: '123D',
      birthdate: new Date('1988-03-25'),
      preferences: [204, 504],
    },
    {
      name: 'Eve',
      lastname: 'Taylor',
      email: 'eve@example.com',
      phone: '5678901234',
      insta: '@eve_taylor_test',
      pass: '123E',
      birthdate: new Date('1995-07-08'),
      preferences: [201, 505],
    },
    {
      name: 'Frank',
      lastname: 'Anderson',
      email: 'frank@example.com',
      phone: '6789012345',
      insta: '@frank_anderson_test',
      pass: '123F',
      birthdate: new Date('1993-09-12'),
      preferences: [202, 506],
    },
    {
      name: 'Grace',
      lastname: 'White',
      email: 'grace@example.com',
      phone: '7890123456',
      insta: '@grace_white_test',
      pass: '123G',
      birthdate: new Date('1994-12-01'),
      preferences: [203, 501],
    },
    {
      name: 'Henry',
      lastname: 'Clark',
      email: 'henry@example.com',
      phone: '8901234567',
      insta: '@henry_clark_test',
      pass: '123H',
      birthdate: new Date('1991-06-17'),
      preferences: [204, 502],
    },
  ];

  for (const customer of customers) {
    await prisma.customer.create({
      data: {
        name: customer.name,
        lastname: customer.lastname,
        email: customer.email,
        phone: customer.phone,
        insta: customer.insta,
        pass: await bcrypt.hash(customer.pass, 10),
        birthdate: customer.birthdate,
        preferences: {
          create: customer.preferences.map((detailId) => ({
            detail: { connect: { id: detailId } },
          })),
        },
      },
    });
  }

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
