# Ink & Soul — Tattoo Art Studio

A mobile-first web app for a tattoo artist to showcase their portfolio, manage appointments, sell art, offer courses, and chat with clients. Built with React + TypeScript + Vite + TailwindCSS + Firebase.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Firebase project

1. Go to the [Firebase Console](https://console.firebase.google.com) and create a new project
2. Enable **Authentication** > Sign-in method > **Email/Password**
3. Create a **Cloud Firestore** database (start in test mode, then deploy rules)
4. Go to Project Settings > General > Your apps > Add a **Web app** and copy the config

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Firebase config values:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 4. Deploy Firestore security rules

```bash
firebase login
firebase use your-project-id
firebase deploy --only firestore:rules
```

### 5. Seed the database

```bash
export GCLOUD_PROJECT=your-project-id
node seed-firestore.mjs
```

### 6. Create the artist account

1. Sign up in the app (or create a user in Firebase Console > Authentication)
2. In the Firebase Console > Firestore > `profiles` collection, find the user's document and change `role` from `"client"` to `"artist"`

### 7. Run the dev server

```bash
npm run dev
```

## Deployment (Vercel)

1. Push to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Add environment variables in Vercel:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
4. Deploy — the `vercel.json` handles SPA routing

## Project Structure

```
src/
  lib/firebase.ts            Firebase client (app, auth, db)
  types/index.ts             TypeScript interfaces
  data/constants.ts          Static reference data (styles, body parts, etc.)
  contexts/AuthContext.tsx    Auth state provider (Firebase Auth + Firestore profiles)
  hooks/                     Data hooks (useAppointments, useChat, etc.)
  pages/                     Client-facing pages
  studio/                    Artist admin pages (protected)
  components/                Shared UI components
firestore.rules              Firestore security rules
seed-firestore.mjs           Database seed script
```

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS v4
- **Backend**: Firebase (Firestore, Auth, Realtime via onSnapshot)
- **Animations**: Framer Motion
- **Routing**: React Router DOM
- **Icons**: Lucide React
