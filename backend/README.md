# Mapinned Backend

Backend API for the Mapinned application, built with [NestJS](https://nestjs.com/).

## 🛠 Tech Stack

- **Framework:** [NestJS](https://nestjs.com/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** [Better Auth](https://www.better-auth.com/)
- **Validation:** class-validator & class-transformer

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:
   Create a `.env` file in the root of the backend directory (see `.env.example` if available, or use the variables below):

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mapinned?schema=public"
BETTER_AUTH_SECRET="your-secret-here"
BETTER_AUTH_URL="http://localhost:3001"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
FRONTEND_URL="http://localhost:3000"
PORT=3001
```

3. Run database migrations:

```bash
npx prisma migrate dev
```

### Running the Application

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## 📁 Project Structure

```
src/
├── auth/           # Authentication logic & guards
├── photos/         # Photos resource (Controller, Service, DTOs)
├── prisma/         # Database connection module
├── app.module.ts   # Main application module
└── main.ts         # Application entry point
```

## 🧪 Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```
