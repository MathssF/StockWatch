# Escolher a imagem base do Node.js
FROM node:16 AS builder

# Diretório de trabalho dentro do container
WORKDIR /app

# Copiar o arquivo package.json e o package-lock.json para o container
COPY package.json package-lock.json ./

# Copiar os workspaces do projeto (producer, consumer, shared)
# COPY Producer/package.json producer/
# COPY Consumer/package.json consumer/
# COPY Core/package.json shared/

# Instalar as dependências
RUN npm install --legacy-peer-deps

# Copiar o código-fonte para dentro do container
COPY . .

# Rodar o build do TypeScript
RUN npm run build --workspaces

# Agora a imagem final
FROM node:16

# Diretório de trabalho dentro do container
WORKDIR /app

# Copiar as dependências instaladas da imagem builder
COPY --from=builder /app /app

# Expor a porta da aplicação (caso use a porta 3000)
EXPOSE 3000

# Comando para iniciar o servidor (ajustar conforme necessário)
CMD ["npm", "run", "start:consumer"]
