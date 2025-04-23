# AI-Powered Surveillance & Identification Platform

This is a full-stack AI-driven surveillance platform built with **Next.js (App Router)**, **Firebase Auth**, and a **FastAPI backend**. It supports:

- **License Plate Detection & Enhancement**
- **Face Matching in Crowded Scenes**
- Secure **Authentication** using Firebase
- Responsive UI built with **Tailwind CSS** and `shadcn/ui` components
- Smooth animations via **Framer Motion**

---

## Features

### Authentication
- Firebase Authentication (Sign In / Sign Up)
- Redirects unauthenticated users to login page

### License Plate Detection
- Upload DVR footage or image
- Detect and extract vehicle number plate using YOLOv5
- Enhance plate area using OpenCV
- Extract text using Tesseract OCR
- View enhanced image result

### Face Matching
- Upload a **reference image** and a **crowd image**
- Backend compares faces using `facenet-pytorch` (MTCNN + InceptionResnetV1)
- Highlights matched face in output image

---

## Tech Stack

| Frontend       | Backend        | ML/AI                | Tools & Auth       |
|----------------|----------------|----------------------|--------------------|
| Next.js (App Router) | FastAPI         | YOLOv5, OpenCV, Tesseract | Firebase Auth       |
| Tailwind CSS   | Python          | facenet-pytorch      | Framer Motion      |
| shadcn/ui      | Uvicorn         | NumPy, PIL           | Vite (Dev Server)  |

---

## Getting Started

### Prerequisites

- Node.js
- Python 3.9+
- pip / virtualenv
- Firebase project for Auth
- (Optional) GitHub Codespaces or Docker if desired

---

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Backend Setup

```bash
cd backend

# Start FastAPI server
uvicorn main:app --reload
```