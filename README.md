# 🛠️ LocalService-Provider

**A full-stack platform that connects users with trusted local service providers — powered by Spring Boot, React, Razorpay payments, and a Gemini-powered AI assistant.**

<p align="center">
  <img alt="Java" src="https://img.shields.io/badge/Java-21-orange?logo=openjdk&logoColor=white">
  <img alt="Spring Boot" src="https://img.shields.io/badge/Spring%20Boot-3.5-brightgreen?logo=springboot&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwindcss&logoColor=white">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white">
  <img alt="Razorpay" src="https://img.shields.io/badge/Razorpay-Payments-0C2451?logo=razorpay&logoColor=white">
  <img alt="Gemini AI" src="https://img.shields.io/badge/Gemini-AI%20Chatbot-8E75B2?logo=googlegemini&logoColor=white">
  <img alt="Docker" src="https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker&logoColor=white">
</p>

<p align="center">
  <a href="https://localservice-provider-1.onrender.com/"><b>🌐 Live Demo</b></a>
</p>

> ⚠️ Hosted on Render's free tier — the app may take up to a minute to wake up on first load.

---

## 📖 Overview

**LocalService-Provider** digitizes the way people find and book local service professionals — electricians, plumbers, cleaners, and more. It brings **users**, **service providers**, and **admins** onto one platform with secure authentication, real-time booking management, verified reviews, integrated payments, and an AI chat assistant to guide users through the app.

The project is deployment-ready out of the box, with Docker images for both services and a Render blueprint for one-click cloud hosting.

---

## ✨ Key Features

### 👤 For Users
- Browse and search verified local service providers by category and location
- Book a service and track booking status in real time
- Pay securely online via **Razorpay** integration
- Rate and review providers after a completed booking
- Get instant help from the built-in **AI chatbot**
- Manage a personal profile and booking history from a dedicated dashboard

### 🧰 For Service Providers
- Register with service type, location, and contact details
- Accept or decline incoming booking requests
- Add notes/updates to bookings for customers
- Track ratings and reviews received from users
- Manage a personal provider profile and public listing page

### 🛡️ For Admins
- Approve or reject pending provider verifications
- Manage user and provider account status
- View and monitor all bookings across the platform
- Full administrative control via a dedicated Admin Dashboard

### 🔐 Platform-Wide
- **JWT-based authentication** with Spring Security
- **OTP email verification** for registration and sensitive admin actions
- **Role-based access control** — `USER`, `PROVIDER`, `ADMIN`
- **AI Assistant** powered by Google Gemini for conversational support
- Fully **Dockerized** frontend and backend with CI-friendly builds
- One-click deploy to **Render** with a preconfigured blueprint

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router, Axios, React Toastify, Lucide Icons |
| **Backend** | Java 21, Spring Boot 3.5, Spring Security, Spring Data JPA / Hibernate |
| **Database** | PostgreSQL |
| **Authentication** | JWT (jjwt) + OTP email verification |
| **Payments** | Razorpay (Java SDK + client-side checkout) |
| **AI** | Google Gemini API (conversational chatbot) |
| **DevOps** | Docker, Docker Compose, Nginx, Render |

---

## 🗂️ Project Architecture

```
LocalService-Provider/
├── backend/                     # Spring Boot REST API
│   ├── src/main/java/com/provider/service/
│   │   ├── config/               # Security, JWT filter & utils, CORS config
│   │   ├── controller/           # REST controllers (Users, Bookings, Reviews, Admin, Chat, OTP)
│   │   ├── dto/                  # Request/response DTOs
│   │   ├── entity/                # JPA entities (User, Booking, Review, Service, OTP)
│   │   ├── repository/            # Spring Data JPA repositories
│   │   └── service/                # Business logic (Email, OTP, Data seeding)
│   └── Dockerfile
├── front-end/                   # React + Vite SPA
│   ├── src/
│   │   ├── api/                  # Axios API client
│   │   ├── components/           # Reusable UI (Header, Footer, ChatBot, BookingForm, etc.)
│   │   ├── context/               # Auth context/provider
│   │   ├── pages/                 # Home, Login, Register, Dashboards, Provider Profile, Reviews
│   │   └── hooks/                  # Custom hooks
│   └── Dockerfile
├── docker-compose.yml            # Local multi-container stack (Postgres + backend + frontend)
└── render.yaml                    # Render deployment blueprint
```

---

## 🔌 API Overview

| Module | Base Path | Highlights |
|---|---|---|
| **Users** | `/api/users` | Register, login, fetch/update profile, change password |
| **Bookings** | `/api/bookings` | Create booking, accept, verify payment, update status, add notes |
| **Providers & Reviews** | `/api/providers` | Fetch reviews & ratings, submit a review |
| **Services** | `/api/services` | List/filter services, update provider services |
| **Admin** | `/api/admin` | Approve providers, manage user status, view all bookings |
| **OTP** | `/api/otp` | Send OTP for registration and admin actions |
| **AI Chat** | `/api/chat` | Gemini-powered chatbot responses |

> 📌 All protected routes require a valid JWT in the `Authorization: Bearer <token>` header.

---

## 🚀 Getting Started

### Prerequisites
- Java 21+
- Node.js 18+
- PostgreSQL (or Docker)
- A [Razorpay](https://razorpay.com/) account (test keys work fine locally)
- A [Google Gemini API key](https://ai.google.dev/)

### 1. Clone the repository
```bash
git clone https://github.com/deepakdeore5650/LocalService-Provider.git
cd LocalService-Provider
```

### 2. Configure environment variables
```bash
cp backend/.env.example backend/.env
cp front-end/.env.example front-end/.env
```
Fill in your local database, Razorpay, and Gemini credentials (see [Environment Variables](#-environment-variables) below).

### 3. Start PostgreSQL
```bash
docker compose up postgres -d
```

### 4. Run the backend
```bash
cd backend
./mvnw spring-boot:run
```
The API will be available at `http://localhost:8080`.

### 5. Run the frontend
```bash
cd front-end
npm install
npm run dev
```
The app will be available at `http://localhost:5173`.

### Or run everything with Docker
```bash
docker compose up --build
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | Database username |
| `SPRING_DATASOURCE_PASSWORD` | Database password |
| `PORT` | Backend server port (default `8080`) |
| `FRONTEND_URL` | Allowed frontend origin for CORS |
| `RAZORPAY_KEY_ID` | Public Razorpay key for payment orders |
| `RAZORPAY_KEY_SECRET` | Private Razorpay secret for signature verification |
| `GEMINI_API_KEY` | API key for the Gemini-powered chatbot |
| `GEMINI_API_URL` | Gemini API endpoint |

### Frontend (`front-end/.env`)
| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API |
| `VITE_RAZORPAY_KEY_ID` | Public Razorpay key used in the browser checkout |

> ⚠️ Never commit real `.env` files — `.env.example` files are the source of truth for required keys.

---

## ☁️ Deployment

This project is pre-configured for **Render**:

- `render.yaml` — deployment blueprint for the backend, frontend, and a managed PostgreSQL instance
- `backend/Dockerfile` — containerized Spring Boot service
- `front-end/Dockerfile` + `nginx.conf` + `entrypoint.sh` — containerized SPA served via Nginx with runtime port binding

Simply connect the repository to Render, set the environment variables listed above in each service's dashboard, and deploy.

---

## 🧭 Roadmap

- [ ] Real-time booking notifications
- [ ] Provider availability calendar
- [ ] Advanced search filters (price, distance, rating)
- [ ] Multi-language support for the AI chatbot
- [ ] Automated testing pipeline (CI/CD)

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "Add your feature"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 👨‍💻 Author

**Deepak Deore**
🔗 [GitHub](https://github.com/deepakdeore5650)

---

<p align="center">If you found this project useful, consider giving it a ⭐ on GitHub!</p>

