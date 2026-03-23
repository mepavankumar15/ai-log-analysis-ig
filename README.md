<div align="center">
  <img src="https://img.shields.io/badge/Gemini_2.5_Flash-Ready-blue?style=for-the-badge&logo=google" alt="Gemini Ready" />
  <img src="https://img.shields.io/badge/Next.js_15-App_Router-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_4-Neo_Brutalist-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" />
  <h1>🌌 Lumina AI Log Analysis Agent</h1>
  <p><strong>Transform raw server logs, stack traces, and terminal errors into actionable intelligence.</strong></p>
</div>

<br />

## ⚡ Overview

**Lumina AI** is a blazing-fast, production-ready full-stack application designed to dramatically reduce debugging time. By leveraging the advanced structured-JSON output capabilities of **Google Gemini 2.5 Flash**, the backend parses esoteric backend errors and outputs highly structured, beginner-friendly diagnostic remediation reports.

### 🎨 The Interface
The frontend is built using **Next.js 15** and features a custom, bespoke **Neo-Brutalist** tech-noir dark mode interface integrating glassmorphism panels, stark primary accent borders, and fluid Tailwind 4 micro-animations.

---

## 🚀 Key Features

*   **🧠 Single-Pass Pipeline Optimization** 
    Instead of chaining 6 separate expensive API calls, the Node.js backend condenses Deep Analysis, Root Cause Extraction, Severity Classification, and Beginner Explanations into a **single, strictly-typed LLM Schema Generation prompt**. This virtually eliminates the 15 RPM Free Tier rate limits!
*   **📁 Direct File Uploading** 
    Seamlessly ingest raw `.log`, `.txt`, and `.err` files straight into the diagnostic terminal.
*   **🗄️ LocalStorage History Ledgers** 
    Accidentally refreshed the page? Lumina caches your past 10 diagnostic scans locally in your browser so you never lose your bug tracking context.
*   **📋 One-Click Export** 
    Copy perfectly formatted markdown summaries containing the Root Cause and Step-By-Step Fixes directly to your clipboard for quick pasting into Jira or Slack.

---

## 🛠️ Technology Architecture

### **Frontend (`/frontend`)**
*   **Framework:** Next.js 15 (App Router)
*   **Language:** TypeScript & React 19
*   **Styling:** Tailwind CSS 4 (Custom mapped CSS `@theme` variables)
*   **State Management:** Native React Hooks & LocalStorage API

### **Backend (Root directory)**
*   **Framework:** Node.js / Express.js
*   **LLM Integration:** `@google/generative-ai` SDK (`gemini-2.5-flash`)
*   **Security:** `dotenv` & CORS configured for separated deployments

---

## 💻 Getting Started Locally

### 1. Clone the Repository
```bash
git clone https://github.com/mepavankumar15/ai-log-analysis-ig.git
cd ai-log-analysis-ig
```

### 2. Configure the Backend
Install dependencies and set up your `.env` file for the Express Application.
```bash
npm install
```
Create a `.env` file in the root directory:
```env
PORT=5000
GEMINI_API_KEY="AIzaSyYourGoogleGeminiApiKeyHere12345"
```
Start the Node.js server:
```bash
node index.js
```
*(The backend will now be actively listening on `http://localhost:5000`)*

### 3. Configure the Frontend
Open a new terminal tab and navigate into the nested Next.js folder:
```bash
cd frontend
npm install
```
Start the Next.js Developer Server:
```bash
npm run dev
```
*(The Neo-Brutalist Dashboard will be live at `http://localhost:3000`)*

---

## 🚀 Deployment

The monolithic repository is configured perfectly for dual-cloud deployment. 

1. **Deploying the Backend (Render/Railway):** 
   Set the build command to `npm install` and the start command to `node index.js`. Don't forget to inject the `GEMINI_API_KEY` environment variable in the dashboard!
2. **Deploying the Frontend (Vercel):**
   Connect your GitHub repo to Vercel, change the **Root Directory** to `frontend`, and add a new environment variable `NEXT_PUBLIC_API_URL` targeting your live Render backend URL.

---

<div align="center">
  <i>Engineered for velocity. Built for reliability.</i>
</div>
