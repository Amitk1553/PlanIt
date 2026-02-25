# PlanIT — AI-Powered Outing Planner

PlanIT is a full-stack web application that helps users plan outings by aggregating **live movie listings**, **restaurant recommendations**, and **weather forecasts** for any Indian city — all from a single natural-language prompt. Under the hood, a multi-agent orchestration layer powered by **Google Gemini** decides which data sources to query, while web scrapers pull real-time data from **BookMyShow** and **Zomato**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 7, React Router 7, Tailwind CSS 3.4, GSAP, Radix UI, Lucide Icons |
| **Backend** | Node.js (ES Modules), Express 4 |
| **Database** | PostgreSQL, Prisma ORM |
| **AI / LLM** | Google Gemini 3.1 Pro Preview (`@google/generative-ai`) |
| **Web Scraping** | Cheerio, got-scraping (TLS fingerprint spoofing) |
| **Structured Scraping** | Firecrawl v2 API |
| **Weather** | Open-Meteo (free — no API key required) |
| **Authentication** | JWT (httpOnly cookies), bcryptjs |

---

## Features

- **Natural-language prompt** — type what you want to do and the AI figures out the rest
- **Live movie listings** — scraped in real-time from BookMyShow with poster images and booking links
- **Live restaurant data** — scraped from Zomato with ratings, cuisine, and direct links
- **Day-part weather** — Morning / Afternoon / Evening / Night forecast from Open-Meteo
- **Multi-agent architecture** — Gemini-based planner dispatches movie, restaurant, and web-search agents in parallel
- **Gemini fallback** — if scraping fails, agents fall back to AI-generated recommendations
- **JWT authentication** — secure signup / login with httpOnly cookie sessions
- **Search history** — save, list, re-run, and delete past searches
- **Animated UI** — GSAP entrance animations with a polished dark forest theme

---

## Prerequisites

Make sure you have the following installed before starting:

| Requirement | Version |
|---|---|
| [Node.js](https://nodejs.org/) | v18 or higher |
| [npm](https://www.npmjs.com/) | Comes with Node.js |
| [PostgreSQL](https://www.postgresql.org/download/) **or** [Docker](https://www.docker.com/) | v14+ (Postgres) / v20+ (Docker) |
| [Git](https://git-scm.com/) | Any recent version |

You will also need API keys for:

- **Google Gemini** — [Get a key](https://aistudio.google.com/app/apikey)
- **Firecrawl** — [Get a key](https://www.firecrawl.dev/)

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/PlanIT.git
cd PlanIT
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

---

## Environment Variables

### Backend (`backend/.env`)

Create a `.env` file inside the `backend/` folder:

```env
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/agent_planner?schema=public"
GEMINI_API_KEY="your-gemini-api-key"
PORT=4000
FIRECRAWL_API_KEY="fc-your-firecrawl-api-key"
CORS_ORIGIN=http://localhost:5173
JWT_SECRET="your-jwt-secret-here"
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `GEMINI_API_KEY` | Google Gemini API key |
| `PORT` | Port the Express server listens on |
| `FIRECRAWL_API_KEY` | Firecrawl v2 API key for structured scraping |
| `CORS_ORIGIN` | Frontend URL (Vite default is `http://localhost:5173`) |
| `JWT_SECRET` | Secret used to sign JWT tokens |

### Frontend (`frontend/.env`)

Create a `.env` file inside the `frontend/` folder:

```env
VITE_API_BASE_URL=http://localhost:4000
```

> **Note:** Make sure the port matches the backend `PORT` value.

---

## PostgreSQL Setup with Docker

If you don't have PostgreSQL installed locally, you can spin it up in a Docker container with a single command:

### 1. Pull the PostgreSQL image

```bash
docker pull postgres:16
```

### 2. Run the container

```bash
docker run -d \
  --name planit-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=agent_planner \
  -p 5432:5432 \
  -v planit_pgdata:/var/lib/postgresql/data \
  postgres:16
```

| Flag | Purpose |
|---|---|
| `-d` | Run in detached (background) mode |
| `--name planit-db` | Name the container for easy reference |
| `-e POSTGRES_USER` | Database superuser name |
| `-e POSTGRES_PASSWORD` | Database password |
| `-e POSTGRES_DB` | Automatically creates this database on first run |
| `-p 5432:5432` | Maps container port 5432 to host port 5432 |
| `-v planit_pgdata:...` | Persists data in a named Docker volume so it survives container restarts |

### 3. Verify it's running

```bash
docker ps
```

You should see `planit-db` listed with status **Up**.

### 4. Set your DATABASE_URL

With the defaults above, your `backend/.env` connection string should be:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/agent_planner?schema=public"
```

### Useful Docker commands

```bash
# Stop the container
docker stop planit-db

# Start it again
docker start planit-db

# Open a psql shell inside the container
docker exec -it planit-db psql -U postgres -d agent_planner

# Remove the container (data persists in the volume)
docker rm -f planit-db

# Remove the data volume (⚠️ deletes all data)
docker volume rm planit_pgdata
```

---

## Database Migrations

Once PostgreSQL is running (via Docker or a local install), generate the Prisma client and run migrations from the `backend/` directory:

```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

This creates all required tables (`User`, `Task`, `TaskResult`, `SearchHistory`) in your PostgreSQL database.

---

## Running the Project

You need **two terminal windows** — one for the backend and one for the frontend.

### Terminal 1 — Backend

```bash
cd backend
npm run dev
```

The API server starts at **http://localhost:4000** (or whatever `PORT` you set).

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

The Vite dev server starts at **http://localhost:5173**. Open this URL in your browser.

---

## Folder Structure

```
PlanIT/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma            # Database models (User, Task, SearchHistory)
│   │   └── migrations/              # SQL migration files
│   ├── src/
│   │   ├── server.js                # Entry point — starts Express
│   │   ├── app.js                   # Express app config, routes, middleware
│   │   ├── agents/
│   │   │   ├── index.js             # Agent registry (movie, restaurant, web_search)
│   │   │   ├── gemini.helper.js     # Shared Gemini JSON caller
│   │   │   ├── movie.agent.js       # BookMyShow via Firecrawl → Gemini fallback
│   │   │   ├── restaurant.agent.js  # Zomato via Firecrawl → Gemini fallback
│   │   │   └── web-search.agent.js  # Gemini-powered web discovery
│   │   ├── config/
│   │   │   ├── env.js               # Environment variable loader & validator
│   │   │   ├── gemini.js            # Google Generative AI client
│   │   │   └── prisma.js            # Prisma client singleton
│   │   ├── controllers/             # Route handlers (plan, user, history, etc.)
│   │   ├── db/
│   │   │   └── plan.repository.js   # Database operations for plans
│   │   ├── integrations/
│   │   │   ├── bookmyshow/          # BookMyShow URL builders, schemas, normalizers
│   │   │   └── zomato/              # Zomato URL builders, schemas, normalizers
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js    # JWT cookie verification
│   │   │   └── error.middleware.js   # Global error handler
│   │   ├── routes/                  # Express route definitions
│   │   ├── services/
│   │   │   ├── aggregator.service.js # Dispatches agents in parallel
│   │   │   ├── firecrawl.service.js  # Firecrawl v2 API wrapper
│   │   │   ├── planner.service.js    # Gemini-based orchestration planner
│   │   │   ├── scraper.js            # BookMyShow HTML scraper (got-scraping + Cheerio)
│   │   │   ├── weather.service.js    # Open-Meteo weather API
│   │   │   └── zomato-scraper.js     # Zomato HTML scraper (got-scraping + Cheerio)
│   │   └── utils/                   # Async handler, date/request utilities
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── main.jsx                 # React entry point
│   │   ├── App.jsx                  # Router + protected/guest route guards
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx         # Login / Signup form
│   │   │   ├── LandingPage.jsx      # Prompt input + location/date picker
│   │   │   ├── ResultsPage.jsx      # Three-column results dashboard
│   │   │   └── HistoryPage.jsx      # Search history list with re-run & delete
│   │   ├── components/
│   │   │   ├── prompt-form.jsx      # Reusable prompt input component
│   │   │   └── ui/                  # Radix-based UI primitives (Button, Card, etc.)
│   │   └── lib/
│   │       ├── api.js               # API client (auth, history, planIt endpoints)
│   │       ├── AuthContext.jsx       # React context for JWT auth state
│   │       └── utils.js             # Tailwind merge utility
│   ├── .env.example
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/users/signup` | No | Create a new account |
| `POST` | `/api/users/login` | No | Log in and receive a JWT cookie |
| `POST` | `/api/users/logout` | No | Clear the JWT cookie |
| `GET` | `/api/users/me` | Yes | Get current user info |
| `POST` | `/api/plan` | No | AI planner — parse prompt and run agents |
| `GET` | `/api/weather?city=&date=` | No | Day-part weather forecast |
| `GET` | `/api/movies?url=` | No | Scrape BookMyShow movie listings |
| `GET` | `/api/restaurants?url=` | No | Scrape Zomato restaurant listings |
| `POST` | `/api/history` | Yes | Save a search to history |
| `GET` | `/api/history` | Yes | List user's search history |
| `GET` | `/api/history/:id` | Yes | Get a specific search record |
| `DELETE` | `/api/history/:id` | Yes | Delete a search record |

---

## Architecture Overview

```
┌─────────────────┐         ┌──────────────────────────────────────┐
│  React Frontend │  fetch  │         Express Backend              │
│  (Vite @ 5173)  │ ──────► │         (Node @ 4000)               │
│                 │         │                                      │
│  LandingPage    │         │  /api/weather ──► Open-Meteo API     │
│  ResultsPage    │         │  /api/movies  ──► BookMyShow scraper │
│  HistoryPage    │         │  /api/restaurants ► Zomato scraper   │
│  AuthPage       │         │  /api/plan    ──► Planner (Gemini)   │
│                 │         │                   ├─► Movie Agent    │
│                 │         │                   ├─► Restaurant Agent│
│                 │         │                   └─► WebSearch Agent │
│                 │         │  /api/history ──► PostgreSQL (Prisma) │
│                 │         │  /api/users   ──► PostgreSQL (Prisma) │
└─────────────────┘         └──────────────────────────────────────┘
```

---

## License

This project is for educational / personal use.