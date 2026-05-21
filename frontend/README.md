# Speech-to-Text Application Frontend (Next.js)

This is the Next.js frontend application featuring the voice recorder dashboard, real-time transcription visualization, history logs, and transcript management controls.

---

## 🛠️ Tech Stack & Features

- **Core:** Next.js (App Router), React, TypeScript
- **Styling:** Tailwind CSS, Lucide React (icons)
- **HTTP Client:** Fetch API / Axios
- **State Management:** React Hooks (Context API / Local state)

---

## 🚀 Setup & Installation

Ensure you are inside the `frontend` directory:
```bash
cd frontend
```

### 1. Install Dependencies
Initialize package installation:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file inside the `frontend/` directory (or populate the root `.env.example`). Make sure to define:
```ini
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Run the Development Server
Fire up the Next.js dev server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to interact with the application.

### 4. Build and Production Run
To build and check production bundle compilation:
```bash
npm run build
npm run start
```
