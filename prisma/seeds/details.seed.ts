import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Criando os DetailTypes
  const detailTypes = [
    'Cor',
    'Tamanho',
    'Ano',
    'Material',
    'Tema'
  ];

  // Adicionando os DetailTypes ao banco de dados
  const detailTypesCreated = await Promise.all(
    detailTypes.map((name) => 
      prisma.detailType.create({
        data: { name }
      })
    )
  );

  // Criando os Details
  const details = {
    'Cor': ['Amarelo', 'Azul', 'Bege', 'Branco', 'Caramelo', 'Carmesim', 'Carmim', 'Castanho', 'Cinza', 'Dourado', 'Esmeralda', 'Laranja', 'Lilás', 'Prateado', 'Preto', 'Rosa', 'Roxo', 'Verde', 'Vermelho'],
    'Tamanho': ['P', 'M', 'G', 'GG'],
    'Ano': ['2000', '2010', '2020', '2021', '2022', '2023', '2024'],
    'Material': ['Aço', 'Ferro', 'Madeira', 'Ouro', 'Plastico', 'Prata'],
    'Tema': ['Básico', 'Fofo', 'Nerd', 'Otaku', 'Rock', 'Praia']
  };

  // Adicionando os Details ao banco de dados
  for (const type of Object.keys(details)) {
    const detailType = detailTypesCreated.find((typeObj) => typeObj.name === type);

    if (detailType) {
      await Promise.all(
        details[type].map((value) =>
          prisma.detail.create({
            data: {
              detailTypeId: detailType.id,
              value
            }
          })
        )
      );
    }
  }

  console.log('Seed completed');
}

// Executando a função
main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
