# Mapinned Frontend

Mapinned is a web application that allows users to upload photos, automatically extract their GPS location, and display them on an interactive map. Users can view photos, add descriptions (manually or AI-generated), and comment on them.

## Features

- **Interactive Map**: Browse photos geographically using MapLibre GL.
- **Photo Upload**: Upload photos with automatic EXIF GPS extraction.
- **AI-Powered Descriptions**: Generate technical descriptions of photos using Google Gemma 3 via OpenRouter.
- **Comments**: Discuss photos with other users.
- **Authentication**: Secure login via Google (using Better Auth).
- **Responsive Design**: Works on desktop and mobile.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Map**: MapLibre GL JS
- **Icons**: Lucide React
- **Auth**: Better Auth
- **AI**: OpenRouter SDK (Google Gemma 3)

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Backend server running (see backend documentation)

### Installation

1.  Navigate to the frontend directory:

    ```bash
    cd frontend
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Create a `.env` file in the root of the `frontend` directory and add the following variables:

    ```env
    NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key
    NEXT_PUBLIC_GEMMA_API_KEY=your_openrouter_api_key
    NEXT_PUBLIC_API_URL=http://localhost:3001
    ```

    - `NEXT_PUBLIC_IMGBB_API_KEY`: Get an API key from [ImgBB](https://api.imgbb.com/).
    - `NEXT_PUBLIC_GEMMA_API_KEY`: Get an API key from [OpenRouter](https://openrouter.ai/).
    - `NEXT_PUBLIC_API_URL`: The URL of your backend server.

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- app/ : Next.js App Router pages and layouts.
- components/ : Reusable UI components (Map, PhotoModal, etc.).
- lib/ : Shared utilities and core configurations (authentication, AI, helpers).
- services/ : External service integrations and API clients.
