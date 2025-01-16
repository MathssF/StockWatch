# StockWatch

Estado atual do projeto: DESENVOLVIMENTO (MVP - Minimum Viable Product).

Este projeto é um protótipo desenvolvido para portfólio, com foco em demonstrar habilidades técnicas e boas práticas de desenvolvimento. **Não é recomendado para uso em produção.**


---

## Sobre o Projeto
O StockWatch tem como objetivo centralizar e automatizar processos envolvendo controle de estoque e integração com fila de mensagens via RabbitMQ. É estruturado para aproveitar padrões modernos de desenvolvimento back-end, utilizando tecnologias como **Prisma, RabbitMQ, TypeScript,** entre outras.

Se você encontrou este repositório navegando pelo meu GitHub, saiba que ele está em desenvolvimento. Caso tenha aberto commits antigos para acessar essa mensagem, parabéns pela curiosidade!


---

## Estrutura do Projeto


'''
project/
│  
├── Core/         (Lógica principal de interações com o banco de dados)
├── Producer/     (Serviço que envia mensagens para o RabbitMQ)
├── Consumer/     (Serviço que consome mensagens do RabbitMQ)
├── prisma/       (Gerenciamento de migrations e seeds para o banco de dados)
├── Tests/        (Testes diversos, incluindo RabbitMQ e banco de dados)
│  
├── node_modules/ (Gerenciado como WorkSpace; único diretório para todas as dependências)
└── package.json  (Arquivo de configurações principais e dependências)
'''

### Descrição das Pastas

- **Core/:** Contém a lógica principal de negócio, incluindo scripts de abertura e fechamento de estoque, assim como interações complexas com o banco de dados via Prisma.

- **Producer/:** Implementação de um serviço RabbitMQ para envio de mensagens. Este é o ponto de partida para notificar alterações no estoque.

- **Consumer/:** Implementação de um serviço RabbitMQ para consumo de mensagens enviadas pelo Producer e realização de ações específicas no sistema.

- **prisma/:** Gerenciamento do esquema de banco de dados, migrations e seeds.

- **Tests/:** Scripts para testes funcionais e de integração, como limpeza de filas RabbitMQ e verificações nas tabelas do banco de dados.


---

## Scripts Disponíveis

Os scripts abaixo ajudam na organização e execução do projeto. Eles seguem um padrão de nomenclatura para facilitar o entendimento:

- **start:(algo):** Inicialização de algum processo.

- **dev:(algo):** Desenvolvimento e testes em tempo real.

- **day:(algo):** Execução de atividades normais ou rotineiras.

- **test:(algo):** Scripts específicos para testes.


### Lista de Scripts



'''
{
  "scripts": {
    "start:producer": "npx ts-node ./Producer/src/index.ts",
    "start:consumer": "npx ts-node ./Consumer/src/index.ts",
    "start:both": "concurrently \"npm run start:producer\" \"npm run start:consumer\"",

    "dev:producer": "nodemon --watch ./Producer/src --ext ts --exec \"ts-node ./Producer/src/index.ts\"",
    "dev:consumer": "nodemon --watch ./Consumer/src --ext ts --exec \"ts-node ./Consumer/src/index.ts\"",
    "dev:both": "concurrently \"npm run dev:producer\" \"npm run dev:consumer\"",

    "build": "npm run build --workspaces",
    "test": "echo \"Error: no test specified\" && exit 1",

    "dev:seeds": "ts-node -r tsconfig-paths/register prisma/seeds/seeds-order.ts",
    "dev:basic": "ts-node -r tsconfig-paths/register prisma/seeds/basic-customers.seed.ts",

    "open:stock": "ts-node -r tsconfig-paths/register ./Core/src/generateJson.ts",
    "close:stock": "ts-node -r tsconfig-paths/register ./Core/src/closeStock.ts",

    "clear-msg": "ts-node ./Tests/RabbitMQTests/clearMsg.ts",
    "clear-db": "ts-node ./prisma/delete/clearDatabase.ts",
    "reset-db": "ts-node ./prisma/delete/resetAutoIncrement.ts",

    "test-db": "ts-node ./Tests/DatabaseTests/testAllTables.ts",
    "random-qtd": "npx ts-node ./Tests/DatabaseTests/randomize.ts"
  }
}
'''


---

## Tecnologias Utilizadas

Baseado nas dependências, o projeto utiliza:

### Produção:

- **Prisma:** ORM para interações eficientes e tipadas com o banco de dados.

- **RabbitMQ (amqplib):** Gerenciamento de filas de mensagens.

- **Express:** Framework back-end minimalista.

- **MySQL2:** Driver de conexão para o banco de dados MySQL.

- **Mongoose e MongoDB:** Suporte para interação com bancos NoSQL, caso necessário.

- **dotenv:** Gerenciamento de variáveis de ambiente.

- **uuid:** Geração de identificadores únicos.

### Desenvolvimento:

- **TypeScript:** Linguagem tipada para JavaScript.

- **Nodemon:** Monitoramento de alterações no código para reinicialização automática.

- **concurrently:** Execução paralela de scripts.

- **ESLint:** Padronização e linting do código.

- **ts-node:** Executa arquivos TypeScript diretamente no Node.js.

---

## WorkSpaces

O projeto utiliza WorkSpaces para organização modular, facilitando o desenvolvimento e manutenção.

'''
"workspaces": [
  "Core",
  "Producer",
  "Consumer",
  "prisma",
  "Tests"
]
'''

---

## Avisos

Este projeto é um MVP (Minimum Viable Product), desenvolvido como parte de um portfólio e pode conter ajustes ou limitações para uso real. Para mais informações, entre em contato comigo por este repositório.