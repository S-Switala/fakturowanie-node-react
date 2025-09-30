# Projekt Fakturowanie (React + NestJS + Prisma)

Aplikacja webowa do zarządzania fakturami dla freelancerów i małych firm. Pozwala na **rejestrację i logowanie**, **zarządzanie klientami**, **wystawianie/edycję faktur** (z filtrami/sortowaniem) oraz **generowanie PDF**. Monorepo: backend (NestJS + Prisma + PostgreSQL) oraz frontend (Vite + React + TS).

**Live demo:** https://fakturowanie.netlify.app/  
Na stronie logowania widoczny jest **użytkownik demo** (login i hasło).

---

## ✨ Funkcje

- Rejestracja i logowanie (JWT Bearer)  
- Profil użytkownika – podgląd i edycja  
- Klienci – pełny CRUD  
- Faktury – pełny CRUD + sortowanie/filtry  
- Generowanie PDF faktury  
- Obsługa „zimnego startu” backendu/DB: `GET /health` + warmup & retry na froncie  
- Front ↔ Back przez **proxy `/api`** (brak problemów z CORS)

---

## 📁 Struktura katalogów

    projekt-fakturowanie/
    ├── server/                 # Backend (NestJS + Prisma + PostgreSQL)
    ├── fakturowanie-frontend/  # Frontend (Vite + React + TypeScript)
    ├── netlify.toml
    └── README.md               # Ten plik

---

## 🧱 Technologie

- **Frontend:** Vite, React, TypeScript, TailwindCSS  
  (biblioteki: axios, react-hook-form, react-router-dom, react-icons)
- **Backend:** NestJS, Prisma, PostgreSQL  
- **Hosting:** Netlify (frontend) + Railway (API + Postgres)

---

## 🚀 Szybki start (dev)

**Wymagania:** Node 20+, npm, instancja PostgreSQL (lokalnie lub np. Railway – *Public Internet ON*)

### 1) Instalacja zależności

    # backend
    cd server
    npm ci

    # frontend
    cd ../fakturowanie-frontend
    npm ci

### 2) Konfiguracja środowiska

**server/.env** (przykład dla Railway public URL):

    DATABASE_URL=postgresql://USER:PASSWORD@turntable.proxy.rlwy.net:PORT/railway?sslmode=require&pgbouncer=true&connection_limit=1
    JWT_SECRET=super_tajne_haslo
    JWT_EXPIRES=15m
    NODE_ENV=development
    PORT=3000
    CORS_ORIGINS=http://localhost:5173

**fakturowanie-frontend/.env.local** (dev):

    VITE_API_URL=http://localhost:3000

### 3) Uruchomienie

**Backend** (terminal A):

    cd server
    npx prisma generate
    # przy pierwszym uruchomieniu lokalnej bazy:
    # npx prisma migrate dev
    npm run start:dev

**Frontend** (terminal B):

    cd fakturowanie-frontend
    npm run dev

Aplikacja: http://localhost:5173

---

## ⚙️ Zmienne środowiskowe – skrót

**Backend (Railway / lokalnie):**  
`DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES`, `NODE_ENV`, `PORT`, `CORS_ORIGINS`  
(np. `http://localhost:5173,https://fakturowanie.netlify.app`)

**Frontend (Netlify / lokalnie):**  
`VITE_API_URL`  
– Prod (Netlify): `/api` (proxy)  
– Dev: `http://localhost:3000`

---

## ☁️ Deploy

### Frontend (Netlify)

Plik **netlify.toml** (w *root* repo) – proxy `/api` + SPA fallback:

    [build]
    base = "fakturowanie-frontend"
    command = "npm ci && npm run build"
    publish = "dist"

    [build.environment]
    NODE_VERSION = "20"

    # Proxy API -> Railway (musi być przed SPA)
    [[redirects]]
    from = "/api/*"
    to = "https://fakturowanie-node-react-production.up.railway.app/:splat"
    status = 200
    force = true

    # SPA fallback
    [[redirects]]
    from = "/*"
    to = "/index.html"
    status = 200

(Opcjonalnie pewniejsze) plik **fakturowanie-frontend/public/_redirects**:

    /api/* https://fakturowanie-node-react-production.up.railway.app/:splat 200
    /* /index.html 200

Zmienna w Netlify: `VITE_API_URL=/api` (można pominąć – front ma fallback do `/api`).

### Backend (Railway)

- Build: `npm ci && npm run build`  
- Start: `npm run prisma:migrate:deploy && npm run start:prod`  
- Endpoint `/health` obsługuje **nieblokujący** deep warmup (front wywołuje go przed logowaniem).

---

## 🔌 API – skrót

- `GET /health` – ping + *deep warmup* przez `?deep=1` (nieblokujące)  
- `POST /auth/register`  
- `POST /auth/login`  
- `GET /me` / `PUT /me` – dane i edycja profilu (JWT)  
- `GET/POST/PUT/DELETE /clients` (JWT)  
- `GET/POST/PUT/DELETE /invoices` (JWT)  
- `GET /invoices/:id/pdf` (JWT)

**Autoryzacja:** `Authorization: Bearer <token>`

---

## 🧰 Troubleshooting

- **P1001 (DB offline / nieosiągalna):** sprawdź `DATABASE_URL` (host/port), `sslmode=require`, *Public Internet ON* (Railway).  
- **„You may have to run prisma generate”:** `npx prisma generate` lub `postinstall`.  
- **409 (unikalność email/NIP):** na backendzie mapowane na 409; puste stringi są zamieniane na `NULL`.  
- **CORS w prod:** używamy proxy `/api` na Netlify – CORS nie jest potrzebny.

---

## 🗺️ Roadmap

- ✅ Rejestracja → klienci → faktury → PDF + edycje i filtry  
- 🔜 Wersja angielska interfejsu

---

## 📄 Licencja

MIT
