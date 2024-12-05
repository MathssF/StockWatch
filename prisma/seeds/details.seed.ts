import { PrismaClient } from '@prisma/client';
import { detailTypes, details } from './datails.table';

export default async function mainD(prisma: PrismaClient) {
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
          typeId: detail.type,
          value: detail.value,
        },
      })
    )
  );

  console.log('Detalhes inseridos com sucesso!');
}