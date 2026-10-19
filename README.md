# AI Anomaly Detection System

## Overview

A modern Vite + React application that visualizes real‑time anomaly detection using robust statistical algorithms. The backend services are provided by **Supabase** (authentication, storage, and edge functions).

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Abutalaham/AI-anomaly-detection-system.git
   cd AI-anomaly-detection-system
   ```
2. **Create an environment file**
   ```bash
   cp .env.example .env
   ```
   Fill in the values (Supabase URL and anon key). Do **not** commit `.env`.
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Run locally**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.
5. **Build for production**
   ```bash
   npm run build
   ```
   The output is placed in `dist/`.

## Deployment

- **Frontend** – Deployed to **GitHub Pages**. GitHub Actions automatically builds the app and deploys to GitHub Pages.
- **Backend** – Supabase provides the API, authentication, and storage. No separate server is required.

## Environment Variables

See `.env.example` for the required variables.

## Scripts

- `npm run dev` – Development server with hot reload.
- `npm run build` – Create an optimized production build.
- `npm run preview` – Preview the built app locally.
- `npm run lint` – Run ESLint.
- `npm run test` – Run Vitest.
- `npm run check` – Type‑check, test, and build.

## License

MIT © 2026 Your Name
