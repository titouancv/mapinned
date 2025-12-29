Great, that changes two important constraints. Below is an updated Strategist plan, adapted to:

- Image storage via Foldr
- A strict 4-hour delivery window
- Still clean, production-oriented, but intentionally simplified where appropriate
  I’ll explicitly note where tradeoffs are made due to the time limit.

1. Updated Technology Stack (4-Hour Optimized)
   Frontend

- Next.js (App Router, TypeScript)
- MapLibre GL JS
- Tailwind CSS (minimal styling)
- Native fetch
  Backend
- NestJS
  - REST only
  - Minimal modules
- better-auth
  _ Google OAuth
  _ Cookie-based session
  Database
- PostgreSQL
  _ Prisma ORM
  _ No PostGIS (store lat/lng as floats)
  Image Storage
- Foldr
  _ Direct upload from frontend
  _ Store only Foldr file reference + public URL \* No CDN configuration needed (Foldr handles this)
  AI
- OpenRouter
  - Google Vision / Gemini
  - Optional async call after upload

2. Architecture (Simplified but Clean)
   High-Level Architecture
   [ Next.js Frontend ]
   | |
   | | Upload Image
   | v
   | [ Foldr Storage ]
   |
   | REST API
   v
   [ NestJS Backend ]
   |
   v
   [ PostgreSQL ]
   |
   v
   [ OpenRouter AI ]

Why This Architecture Fits 4 Hours

- No pre-signed URLs logic
- No complex geospatial queries
- No background jobs
- No event queues
- Minimal abstractions, clear separation

3. Foldr Image Storage Strategy
   Upload Flow with Foldr
1. User selects an image in the browser
1. Frontend uploads directly to Foldr API
1. Foldr returns:{
1. "id": "file_xxx",
1. "url": "https://cdn.foldr.space/..."
1. }
1.
1. Frontend sends metadata to backend:{
1. "foldrFileId": "file_xxx",
1. "imageUrl": "...",
1. "latitude": 48.85,
1. "longitude": 2.35
1. }
1.
1. Backend saves metadata in PostgreSQL
1. (Optional) Backend calls AI for description
   ✅ Backend never handles binary files✅ Upload is fast✅ Minimal backend logic

1. Backend Structure (Time-Constrained)
   src/
   ├── auth/
   ├── photos/
   │ ├── photos.controller.ts
   │ ├── photos.service.ts
   ├── comments/
   ├── ai/
   ├── prisma/
   └── main.ts

Core Endpoints
Method Endpoint Description
GET /photos List all photos
POST /photos Create photo entry
GET /photos/:id Photo + comments
POST /comments Add comment
GET /auth/me Current user
Database Models (Minimal)
model User {
id String @id @default(uuid())
email String @unique
name String?
avatarUrl String?
photos Photo[]
comments Comment[]
}

model Photo {
id String @id @default(uuid())
imageUrl String
foldrFileId String
latitude Float
longitude Float
aiDescription String?
userId String
user User @relation(fields: [userId], references: [id])
comments Comment[]
createdAt DateTime @default(now())
}

model Comment {
id String @id @default(uuid())
content String
photoId String
userId String
createdAt DateTime @default(now())
}

5. Data Flow (End-to-End)
   Upload → Map
   User
   ↓
   Select image
   ↓
   Upload to Foldr
   ↓
   Get public URL + fileId
   ↓
   Send metadata to NestJS
   ↓
   Save to PostgreSQL
   ↓
   Frontend fetches photos
   ↓
   Markers rendered on MapLibre

AI Description (Optional, Non-Blocking)

- Triggered after photo creation
- Backend sends image URL to OpenRouter
- Stores short description
- Frontend displays when available
  If AI fails → app still works.

6. Authentication Flow (Fast Setup)
1. User clicks “Sign in with Google”
1. better-auth handles OAuth
1. Backend creates session cookie
1. Frontend uses authenticated routes
   No refresh tokens, no roles, no permissions system.

1. Deployment (Fast & Simple)
   Local (Demo/Test)

- .env for secrets
- Local PostgreSQL via Docker
- Foldr API key
  Optional Production (If Needed)
- Frontend: Vercel
- Backend: Fly.io / Render
- Database: Supabase Postgres
  Deployment kept optional due to time constraint.

8. 4-Hour Time Breakdown (Strict)
   Task Time
   Project scaffolding (Next + Nest) 20 min
   Prisma + DB models 20 min
   Google auth (better-auth) 40 min
   Foldr upload integration 30 min
   Photo APIs (CRUD) 30 min
   MapLibre setup 30 min
   Photo popup + comments UI 30 min
   AI integration (optional) 20 min
   Basic testing & polish 20 min
   Total: ~4 hours

9. Conscious Tradeoffs (Explicit)
   Because of the 4h constraint:

- No background workers
- No EXIF server validation
- No pagination or clustering
- No moderation system
- Minimal error handling
  But:✅ Clean separation✅ Replaceable storage✅ Scalable architecture✅ Production-ready foundation
