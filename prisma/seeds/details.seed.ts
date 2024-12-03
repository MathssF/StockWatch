import { PrismaClient } from '@prisma/client';
import { detailTypes, details } from './datails.table';

const prisma = new PrismaClient();

export default async function mainD() {
  const detailTypesCreated = await Promise.all(
    detailTypes.map((detailType) => 
      prisma.detailType.create({
        data: { 
            id: detailType.id,
            name: detailType.name 
          }
      })
    )
  );
  await Promise.all(
    details.map((detail) =>
      prisma.detail.create({
        data: {
          id: detail.id,
          detailTypeId: detail.type,
          value: detail.value,
        },
      })
    )
  );

  console.log('Seed completed');
}
mainD()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
