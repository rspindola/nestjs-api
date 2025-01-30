# NestJS API

Este repositório contém uma API construída com NestJS, Prisma e PostgreSQL. A seguir, você encontrará as instruções para rodar o projeto em um ambiente local utilizando Docker.

## Pré-requisitos

Antes de começar, você precisará de algumas ferramentas instaladas no seu ambiente:

- **Docker**: [Como instalar o Docker](https://docs.docker.com/get-docker/)
- **Docker Compose**: [Como instalar o Docker Compose](https://docs.docker.com/compose/install/)
- **Node.js** (preferencialmente v20.18.1 ou superior): [Como instalar o Node.js](https://nodejs.org/)
- **NVM** (Node Version Manager): [Como instalar o NVM](https://github.com/nvm-sh/nvm#installing-and-updating)
- **Yarn** (opcional, mas recomendado): [Como instalar o Yarn](https://classic.yarnpkg.com/en/docs/install/)

## Clonando o Repositório

Clone o repositório para o seu ambiente local:

```bash
git clone https://github.com/rspindola/nestjs-api
cd nestjs-api
```

## Configuração do Ambiente

Antes de rodar a aplicação, você precisa configurar algumas variáveis de ambiente. Para isso, siga os seguintes passos:

### 1. Crie o arquivo `.env`

Na raiz do repositório, crie um arquivo `.env` e preencha com as seguintes variáveis de ambiente:

```dotenv
# Banco de Dados (PostgreSQL)
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=mydatabase
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}

# JWT (JSON Web Token)
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRATION=60s
JWT_REFRESH_EXPIRATION=3m

# Hashing de Senha
ROUNDS_OF_HASHING=10
```

> **Nota**: O valor de `DATABASE_URL` já é preenchido automaticamente de acordo com as variáveis `POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_DB` no Docker Compose.

### 2. Configuração do Docker Compose

O repositório já inclui um arquivo `docker-compose.yml` configurado para rodar o PostgreSQL. Se você quiser rodar a aplicação utilizando Docker, siga os passos abaixo.

## Rodando o Banco de Dados e a API com Docker

### 1. Rodar os containers com Docker Compose

Execute o seguinte comando para iniciar os containers (PostgreSQL e sua aplicação) em segundo plano:

```bash
docker-compose up -d
```

Este comando irá:

- Subir o container do PostgreSQL configurado no arquivo `docker-compose.yml`.
- Criar a URL de conexão do banco de dados automaticamente.
- Rodar a aplicação (se houver outro serviço configurado, como a API NestJS).

### 2. Verificar o status dos containers

Para verificar o status dos containers, você pode usar:

```bash
docker-compose ps
```

### 3. Rodar as migrações com Prisma

Após subir os containers, você precisará rodar as migrações do Prisma para configurar o banco de dados. Para isso, execute o seguinte comando:

```bash
docker-compose exec backend npx prisma migrate dev
```

> **Nota**: Este comando irá aplicar as migrações no banco de dados PostgreSQL e gerar o Prisma Client.

### 4. Gerar o Prisma Client

Caso você queira gerar manualmente o Prisma Client, use o comando abaixo:

```bash
docker-compose exec backend npx prisma generate
```

## Rodando os Testes

Para rodar os testes (se você tiver configurado um ambiente de testes no seu projeto), use:

```bash
docker-compose exec backend yarn test
```

## Parar os Containers

Para parar os containers, execute:

```bash
docker-compose down
```

Isso irá parar e remover todos os containers criados pelo docker-compose up.

## Executando a API Localmente (Sem Docker)

Se preferir rodar a API localmente, sem o uso de Docker, siga os passos abaixo:

### 1. Instalar dependências

Instale as dependências do projeto:

```bash
yarn install
```

Ou, se você preferir usar o npm:

```bash
npm install
```

### 1. Rodar a aplicação localmente

Com as dependências instaladas, você pode rodar o servidor localmente com:

```bash
yarn start:dev
```

Ou, usando npm:

```bash
npm run start:dev
```

Isso irá rodar a API em <http://localhost:3000>.

## Considerações Finais

Esse projeto usa NestJS, Prisma e PostgreSQL. Certifique-se de preencher corretamente o arquivo .env com as variáveis de ambiente e de rodar as migrações do Prisma para configurar seu banco de dados.

Se você tiver dúvidas ou encontrar algum erro, sinta-se à vontade para abrir um Issue no repositório!
