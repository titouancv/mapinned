# Mapinned

Mapinned is a production-ready web application that allows users to upload photos, automatically extract their GPS location, and display them on an interactive map. It leverages modern web technologies to ensure scalability, performance, and a seamless user experience.

## 🏗 Architecture & Technology Stack

To build this application in a clean, scalable, and production-ready way, we have chosen the following stack:

### Frontend

- **Framework**: **Next.js 15 (App Router)** - For server-side rendering, SEO, and robust routing.
- **Language**: **TypeScript** - For type safety and maintainability.
- **Styling**: **Tailwind CSS** - For rapid, utility-first styling.
- **Map**: **MapLibre GL JS** - An open-source, high-performance mapping library.
- **State Management**: React Hooks & Context (sufficient for this scale).

### Backend

- **Framework**: **NestJS** - A progressive Node.js framework for building efficient, scalable server-side applications. It provides a modular architecture and strong dependency injection.
- **Language**: **TypeScript**.
- **API Style**: **REST** - Standard, cacheable, and easy to consume.

### Database

- **Database**: **PostgreSQL** - A powerful, open-source object-relational database system.
- **ORM**: **Prisma** - For type-safe database access and easy schema management.

### Storage

- **Service**: **ImgBB** (Demo) / **AWS S3** (Production) - For scalable object storage of image files. The backend stores only the reference URLs.

### Authentication

- **Library**: **Better Auth** - A comprehensive authentication library for TypeScript.
- **Strategy**: **Google OAuth** - Secure and convenient social login.
- **Session**: Cookie-based sessions for security.

### AI Integration

- **Service**: **Google Gemini (via OpenRouter)** - For analyzing images and generating automatic descriptions.

---

## 📐 System Structure

### Database Schema (Prisma)

- **User**: Stores user profile (name, email, avatar).
- **Session/Account**: Manages authentication states.
- **Photo**: Stores image URL, GPS coordinates (latitude/longitude), description, and owner reference.
- **Comment**: Stores user comments on photos.

### API Services

1.  **Auth Service**: Manages login/logout and session validation.
2.  **Photos Service**: Handles CRUD operations for photos, including ownership verification.
3.  **AI Service**: Interfaces with the LLM to generate descriptions.

---

## 🔄 Data Flow: From Upload to Map

1.  **User Action**: User selects a photo in the frontend.
2.  **Client-Side Processing**:
    - The browser extracts EXIF data (GPS coordinates) using `exifr`.
    - The file is uploaded directly to the Storage Provider (ImgBB) to offload bandwidth from the backend.
3.  **API Request**:
    - The frontend sends the returned Image URL + GPS Coordinates to the NestJS Backend (`POST /photos`).
4.  **Backend Processing**:
    - Validates the session (Auth Guard).
    - Stores the metadata in PostgreSQL via Prisma.
    - (Async) Triggers the AI Service to analyze the image URL and update the description.
5.  **Map Update**:
    - The frontend receives the new photo object.
    - The map component refreshes or adds the new marker dynamically.

---

## 🚀 Deployment Strategy

### Local Development

- **Docker Compose**: To spin up the PostgreSQL database.
- **npm/yarn**: To run Frontend and Backend in watch mode.

### Production Deployment

- **Frontend**: **Vercel** - Optimized for Next.js, providing edge caching and CI/CD.
- **Backend**: **Railway** or **Render** - For hosting the Node.js/NestJS service.
- **Database**: **Supabase** or **Neon** - Managed PostgreSQL instances.

---

# 8. Project Roadmap

| Step | Phase                     | Description                                                                                                                                                                                      | Estimated Time |
| ---: | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
|    1 | Project Setup             | Rapid initialization of the Next.js (frontend) and NestJS (backend) projects, including minimal architecture setup, startup scripts, and a scalable folder structure prepared for future growth. | 40 minutes     |
|    2 | Database & Models         | Definition of core Prisma models (users, photos, comments), basic relationships, initial migration, and database connection setup.                                                               | 30 minutes     |
|    3 | Authentication            | Integration of Google authentication using **better-auth**, basic session handling, and protection of main application routes.                                                                   | 30 minutes     |
|    4 | Image Upload              | Integration of the **Imgbb** service for image uploads, handling API responses, and storing image URLs in the database.                                                                          | 30 minutes     |
|    5 | Photo APIs                | Implementation of core CRUD endpoints for photos (create, read, delete), including basic request validation.                                                                                     | 30 minutes     |
|    6 | User Interface – Photos   | Frontend UI implementation for photo display, including gallery view, detail popup/modal, and basic navigation.                                                                                  | 30 minutes     |
|    7 | User Interface – Comments | Implementation of comment creation and display, without advanced UI/UX optimizations.                                                                                                            | 20 minutes     |
|    8 | AI Integration (Optional) | Quick connection to an AI service (e.g., tag or description generation) as a technical proof of concept only.                                                                                    | 20 minutes     |
|    9 | Basic Testing & Polishing | Manual testing of core user flows, quick bug fixes, code cleanup, and preparation for a live demo.                                                                                               | 60 minutes     |
|      |

---
