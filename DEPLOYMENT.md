# 🚀 Deployment Guide

This guide provides step-by-step instructions for deploying the Eduvance project. We will deploy the **Backend to Render** and the **Frontend to Vercel**.
---

## 1. ⚙️ Backend Deployment (Render)

Render will host your Node.js API.

1.  **Login to Render**: Go to [dashboard.render.com](https://dashboard.render.com).
2.  **Create New Web Service**: Click **New +** > **Web Service**.
3.  **Connect GitHub**: Select your `Eduvance` repository.
4.  **Configure Settings**:
    *   **Name**: `eduvance-backend`
    *   **Root Directory**: `backend`
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
5.  **Environment Variables**: Click **Advanced** > **Add Environment Variable**:
    *   `NODE_ENV`: `production`
    *   `PORT`: `5000`
    *   `MONGO_URI`: `your_mongodb_atlas_connection_string`
    *   `JWT_SECRET`: `a_very_long_random_string`
    *   `JWT_REFRESH_SECRET`: `another_long_random_string`
    *   `GEMINI_API_KEY`: `your_gemini_api_key`
    *   `RESEND_API_KEY`: your Resend API key (backend only)
    *   `EMAIL_FROM`: `onboarding@resend.dev` for testing, or an address on a verified EduVance domain
    *   `EMAIL_FROM_NAME`: `EduVance`
    *   `CORS_ORIGIN`: `https://your-frontend.vercel.app` (You will get this from Vercel later)
6.  **Deploy**: Click **Create Web Service**.

> [!TIP]
> Once deployed, copy your Render URL (e.g., `https://eduvance-backend.onrender.com`). You will need this for the Frontend.

---

## 2. 🎨 Frontend Deployment (Vercel)

Vercel will host your React/Vite application.

1.  **Login to Vercel**: Go to [vercel.com](https://vercel.com).
2.  **Add New Project**: Click **Add New** > **Project**.
3.  **Import Repo**: Select your `Eduvance` repository.
4.  **Configure Project**:
    *   **Framework Preset**: `Vite`
    *   **Root Directory**: `frontend`
5.  **Build & Output Settings**: (Defaults should be fine)
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
6.  **Environment Variables**:
    *   `VITE_API_URL`: `https://your-backend.onrender.com/api` (Paste your Render URL here)
    *   Do not add `RESEND_API_KEY` or other mail credentials to frontend/Vite variables. Email is sent by the backend.
7.  **Deploy**: Click **Deploy**.

---

## 3. 🏁 Finalizing (Fixing CORS)

After the Frontend is deployed:
1.  Copy your Vercel URL (e.g., `https://eduvance-frontend.vercel.app`).
2.  Go back to your **Render Dashboard** > **Environment Variables**.
3.  Update `CORS_ORIGIN` to your **Vercel URL**.
4.  Render will automatically redeploy with the correct CORS settings.

---

## 🛠️ Local Commands for Git

If you've made changes locally and need to push them before deploying:

```powershell
# Add all changes
git add .

# Commit
git commit -m "chore: prepare for deployment (CORS and API URL config)"

# Push to GitHub
git push origin main
```

------

## Local email configuration

Set `RESEND_API_KEY`, `EMAIL_FROM`, and `EMAIL_FROM_NAME` in `backend/.env`. For initial testing, use `EMAIL_FROM=onboarding@resend.dev`; production should use a sender address from a verified EduVance domain. Configure the same three values as environment variables on the deployed backend (Render), never in the Vercel frontend project. The application uses Resend's HTTPS API; Gmail SMTP settings are no longer used.
