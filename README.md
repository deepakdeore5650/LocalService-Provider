# LocalService-Provider🛠️

LocalService-Provider is a full-stack application that connects users with nearby local service providers. The backend is a Spring Boot API and the frontend is a React + Vite app.

This repository is prepared for deployment on Render with PostgreSQL, Docker, and environment-based configuration.

---

## 🎯 Project Objective

- Digitize local service booking
- Provide quick access to trusted nearby service providers
- Support role-based access for users, providers, and admins
- Deploy cleanly on Render with separate frontend/backend services

---

## 🛠️ Technology Stack

### Frontend
- React
- Vite
- Tailwind CSS

### Backend
- Java 21
- Spring Boot 3.5
- Spring Security
- JPA / Hibernate

### Database
- PostgreSQL

### Deployment
- Docker
- Render
- PostgreSQL managed database

---

## 🧩 Local Development

### 1) Copy example env files

From the repo root:

```bash
cp backend/.env.example backend/.env
cp front-end/.env.example front-end/.env
```

Then fill in the real local values you want to use.

### 2) Start PostgreSQL

```bash
docker compose up postgres -d
```

### 3) Start backend

```bash
cd backend
./mvnw spring-boot:run
```

The backend reads these values from environment variables:

- SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/localservice
- SPRING_DATASOURCE_USERNAME=localservice
- SPRING_DATASOURCE_PASSWORD=localservice
- PORT=8080
- FRONTEND_URL=http://localhost:5173

### 4) Start frontend

```bash
cd front-end
npm install
npm run dev
```

The frontend uses `VITE_API_BASE_URL` from [front-end/.env](front-end/.env) or the Render environment.

For production-style container testing, you can run:

```bash
docker compose up --build
```

---

## 🔐 Environment Variables

### Backend variables

These are defined in [backend/.env.example](backend/.env.example) and consumed by the Spring Boot app in [backend/src/main/resources/application.properties](backend/src/main/resources/application.properties).

- `SPRING_DATASOURCE_URL` — PostgreSQL JDBC URL for the backend database.
- `SPRING_DATASOURCE_USERNAME` — PostgreSQL username.
- `SPRING_DATASOURCE_PASSWORD` — PostgreSQL password.
- `PORT` — HTTP port the backend listens on. Default: `8080`.
- `FRONTEND_URL` — Allowed frontend origin for CORS.
- `RAZORPAY_KEY_ID` — public Razorpay key used for payment flows.
- `RAZORPAY_KEY_SECRET` — private Razorpay secret used to verify signatures.
- `GEMINI_API_KEY` — API key used by the AI chat endpoint.
- `GEMINI_API_URL` — Gemini endpoint URL.

### Frontend variables

These are defined in [front-end/.env.example](front-end/.env.example) and used in the Vite app.

- `VITE_API_BASE_URL` — base URL for the backend API, for example `http://localhost:8080` in local dev.
- `VITE_RAZORPAY_KEY_ID` — public Razorpay key exposed to the browser.

### Render dashboard settings

Set the same values in the Render dashboard for each service. Do not commit real credentials to Git.

#### Backend service
- `PORT=8080`
- `SPRING_DATASOURCE_URL=jdbc:postgresql://<host>:5432/<database>`
- `SPRING_DATASOURCE_USERNAME=<db-user>`
- `SPRING_DATASOURCE_PASSWORD=<db-password>`
- `FRONTEND_URL=https://your-frontend.onrender.com`
- `RAZORPAY_KEY_ID=your_public_razorpay_key`
- `RAZORPAY_KEY_SECRET=your_private_razorpay_secret`
- `GEMINI_API_KEY=your_gemini_key`
- `GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`

#### Frontend service
- `VITE_API_BASE_URL=https://your-backend.onrender.com`
- `VITE_RAZORPAY_KEY_ID=your_public_razorpay_key`

> Never commit `.env` files. `.env.example` is the source-of-truth documentation for local setup.

---

## 🐳 Docker Notes

- Backend image builds from [backend/Dockerfile](backend/Dockerfile)
- Frontend image builds from [front-end/Dockerfile](front-end/Dockerfile)
- Docker Compose reads local environment variables from [backend/.env](backend/.env) and [front-end/.env](front-end/.env)
- The frontend expects `VITE_API_BASE_URL` to be present at build time for the compiled app
- The nginx container reads `PORT` at runtime to bind the web server

---

## 📁 Deployment Files

- [docker-compose.yml](docker-compose.yml): local multi-container stack for Postgres + backend + frontend
- [render.yaml](render.yaml): Render blueprint for PostgreSQL, backend, and frontend services
- [backend/Dockerfile](backend/Dockerfile): backend container image
- [front-end/Dockerfile](front-end/Dockerfile): frontend container image
- [front-end/nginx.conf](front-end/nginx.conf): SPA fallback config
- [front-end/entrypoint.sh](front-end/entrypoint.sh): runtime PORT substitution for nginx

---

## ✅ PostgreSQL Migration Notes

The app was updated from a MySQL datasource and dialect to PostgreSQL, while preserving the existing Spring Security roles and REST endpoints.

