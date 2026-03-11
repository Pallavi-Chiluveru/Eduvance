# Deployment Guide

This guide provides step-by-step instructions for deploying the DLSES project to Vercel and Render.

---

## 🎨 Frontend Deployment (Vercel)

Vercel is the best platform for React/Vite applications.

1.  **Connect GitHub**: Log in to [Vercel](https://vercel.com) and click "Add New" > "Project".
2.  **Import Repo**: Select your project repository.
3.  **Configure Project**:
    *   **Framework Preset**: Vite
    *   **Root Directory**: `frontend`
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
4.  **Environment Variables**:
    *   `VITE_API_URL`: Set this to your backend URL (e.g., `https://your-backend.onrender.com/api`)
5.  **Deploy**: Click "Deploy".

---

## ⚙️ Backend Deployment (Render)

Render is a powerful and simple platform for Node.js APIs.

1.  **Create Web Service**: Log in to [Render](https://render.com) and click "New" > "Web Service".
2.  **Connect Repo**: Connect your GitHub account and select your repository.
3.  **Configure Service**:
    *   **Root Directory**: `backend`
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
4.  **Environment Variables**:
    *   `PORT`: `5000`
    *   `MONGO_URI`: Your MongoDB Atlas connection string.
    *   `JWT_SECRET`: A secure random string for signing tokens.
    *   `COOKIE_SECRET`: A secure random string for CSRF protection.
    *   `CORS_ORIGIN`: Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)
    *   `NODE_ENV`: `production`
5.  **Deploy**: Click "Create Web Service".

---

## 🗄️ Database Setup (MongoDB Atlas)

Ensure your MongoDB Atlas cluster allows connections from your deployment IPs.
- **Network Access**: Add `0.0.0.0/0` (or the specific IPs provided by Render) to the IP Access List in Atlas.
- **Database User**: Ensure the user in your connection string has read/write permissions.

---

## 🐳 Docker Deployment

If you prefer using Docker for deployment (e.g., on a VPS or AWS), use the provided `docker-compose.yaml`:

1.  Set up your `.env` variables on the host.
2.  Run:
    ```bash
    docker-compose up -d --build
    ```
