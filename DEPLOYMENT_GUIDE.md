# RideShareX Deployment Guide 🚀

This guide explains how to deploy the **RideShareX Indian Intercity Carpooling System** (MERN + Socket.io + Leaflet) to the cloud.

---

## 📋 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Step 1: Push Code to GitHub](#step-1-push-code-to-github)
3. [Option A: Unified Deployment on Render (Recommended)](#option-a-unified-deployment-on-render-recommended)
4. [Option B: Split Deployment (Vercel Frontend + Render Backend)](#option-b-split-deployment-vercel-frontend--render-backend)
5. [Database Setup (MongoDB Atlas)](#database-setup-mongodb-atlas)

---

## 1. Prerequisites
Before deploying, make sure you have:
* A **GitHub Account**.
* A **MongoDB Atlas** account (free cluster).
* A **Cloudinary Account** (for saving profile photos and ID proof uploads).
* A **Render** and/or **Vercel** account.

---

## Step 1: Push Code to GitHub
Both Render and Vercel sync directly with your GitHub repository for continuous integration (push-to-deploy).

Run these commands in your project root directory (`c:\Users\karim\OneDrive\Desktop\RideShareX`):

```bash
# Initialize git repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "chore: setup deployment configuration"

# Add remote origin and push
git remote add origin https://github.com/karimbashask2005-dev/RideShareX.git
git branch -M main
git push -u origin main
```

---

## Option A: Unified Deployment on Render (Recommended)
This approach deploys the entire application (Express Server + React client build) on a single Render Web Service.

### Why this is recommended:
* **Zero Cross-Origin Resource Sharing (CORS) issues**: Frontend and Backend run on the same domain.
* **Simple Socket.io configuration**: Real-time notifications and chat work out of the box without complicated CORS configurations.
* **One-Click Blueprint**: Utilizes the pre-configured [render.yaml](file:///c:/Users/karim/OneDrive/Desktop/RideShareX/render.yaml) file.

### How to Deploy:
1. Go to the [Render Blueprint Page](https://dashboard.render.com/blueprints/new?repo=https://github.com/karimbashask2005-dev/RideShareX).
2. Render will automatically read your `render.yaml` file.
3. Input your environment variable values in the prompt:
   * `MONGODB_URI`: Your MongoDB Atlas connection string.
   * `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Your Cloudinary credentials.
4. Click **Apply**. Render will build and launch your application!

---

## Option B: Split Deployment (Vercel Frontend + Render Backend)
If you prefer to separate the concerns, you can host the frontend on Vercel's global CDN and host the backend server on Render.

### 1. Deploy the Backend (Render)
1. Go to your [Render Dashboard](https://dashboard.render.com/) and click **New > Web Service**.
2. Select your `RideShareX` repository.
3. Configure the service settings:
   * **Name**: `ridesharex-api`
   * **Runtime**: `Node`
   * **Root Directory**: `server`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
4. Add the following **Environment Variables**:
   * `NODE_ENV`: `production`
   * `MONGODB_URI`: Your MongoDB Atlas URI.
   * `JWT_SECRET`: A secure random password.
   * `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Your Cloudinary keys.
5. Click **Create Web Service**. Note down the URL Render assigns to this service (e.g., `https://ridesharex-api.onrender.com`).

### 2. Deploy the Frontend (Vercel)
Use this Vercel deployment link:
[Deploy Client to Vercel](https://vercel.com/new/clone?repository-url=https://github.com/karimbashask2005-dev/RideShareX&root-directory=client)

1. Click the link above or go to [Vercel Dashboard](https://vercel.com/new).
2. Choose your repository and specify `client` as the **Root Directory**.
3. Under **Environment Variables**, add:
   * `VITE_API_URL`: Your Render backend API URL (e.g., `https://ridesharex-api.onrender.com`).
4. Click **Deploy**.

---

## Database Setup (MongoDB Atlas)
Since your local MongoDB will not be accessible to the internet:
1. Register at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Free Cluster (`Shared`).
3. Under **Network Access**, add IP `0.0.0.0/0` (allow access from anywhere - required for Render dynamic IPs).
4. Under **Database Access**, create a user and save the password.
5. Get your connection string: Select **Connect > Drivers** and copy the URI (replacing `<password>` with your user's password).
