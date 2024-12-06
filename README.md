# StockWatch



Estado atual do projeto: DESENVOLVIMENTO.



Oi, se você encontrou este repositório enquanto navegava pelo meu GitHub, é sinal que esta em desenvolvimento, e não esta pronto ainda.



Se você abriu um commit antigo, para achar esta mensagem, é sinal que você é bem curioso quanto aos processos, muito bem!



Atualmente o projeto esta assim:

project/

│

├── prisma/     (back-end para a lógica de migrations e seeds)

├── producer/   (back-end para enviar mensagens do RabbitMQ)

├── consumer/   (back-end para consumir mensagens do RabbitMQ)

├── shared/     (código compartilhado entre os módulos)

│

├── node_modules/ (O projeto usa WorkSpace, então vai ter só um node_modules)

└── package.json (arquivo de dependências principal)


Atualmente os scripts são estes:



"scripts": {

    "start:producer": "npm start --workspace=producer",

    "start:consumer": "npm start --workspace=consumer",

    "build": "npm run build --workspaces",

    "test": "echo \"Error: no test specified\" && exit 1",


    "dev:seeds": "ts-node -r tsconfig-paths/register prisma/seeds/seeds-order.ts",

    "generate:json": "ts-node ./shared/src/generateJson.ts"

  },




Eles precisarão ser ajeitados mais pra frente para seguir um padrão.


Ideia no momento:


start:(algo) - Quando for startar algum processo

dev:(algo) - Quando for trabalhar em algo da parte de desenvolvimento

day:(algo) - Quando for fazer uma atividade normal

test:(algo) - Quando for testar algo, literalmente
