# TinyLink 🔗

TinyLink is a production-ready, highly-scalable full-stack URL Shortener (Bitly clone) built with a Java Spring Boot 3 backend and a React (Vite + TypeScript + Tailwind CSS) frontend. It supports JWT security, Redis lookup caching, dynamic QR code generations, and detailed click metrics dashboarding.

---

## 🏗️ Architecture Design

TinyLink employs a containerized reverse-proxy architecture using Nginx. Requests originating from the browser are routed appropriately based on target routes:

```mermaid
graph TD
    Client[Web Browser Client] -->|Port 80| Nginx[Nginx Reverse Proxy]
    Nginx -->|Static Assets / Routes| SPA[React Single Page Application]
    Nginx -->|/api/*| SpringBoot[Spring Boot Backend App]
    Nginx -->|/{shortCode}| SpringBoot
    SpringBoot -->|JWT Auth & SQL| PostgreSQL[(PostgreSQL Database)]
    SpringBoot -->|Cached URL Lookups| Redis[(Redis Key-Value Store)]
```

- **Client Side (SPA)**: Serves page views (Landing, Dashboard, Login, Analytics, etc.) and routes pages locally using React Router.
- **Nginx Proxy**: Serves compiled React assets, intercepts single-path shortcodes (e.g. `/abc123`) to proxy to the Spring Boot redirection engine, and forwards API queries (`/api/**`).
- **Spring Boot 3 App**: Handles core authentication, JWT token rotations, url generation, and asynchronous click log parsings.
- **PostgreSQL**: Stores persistent user records, URL details, refresh tokens, and click data.
- **Redis Cache**: Caches URL metadata (`url:{shortCode}`) on lookup. Modifying or deleting links triggers instant cache evictions.

---

## 🛠️ Technology Stack

### Backend
- **Java 21** & **Spring Boot 3**
- **Spring Security** (Bcrypt + JWT authorization + rotating refresh tokens)
- **Spring Data JPA** (PostgreSQL driver)
- **Spring Data Redis** (cache lookups)
- **ZXing QR Code Generator** (dynamic base64 QR generation)
- **Spring Validation** (validation annotations)
- **Springdoc OpenAPI v3** (Swagger documentation)

### Frontend
- **React 18** (Vite + TypeScript)
- **Tailwind CSS** (vibrant theme config + dark mode)
- **React Router v6** (route guards)
- **Axios** (JWT interceptor + automatic 401 token refresh)
- **React Query v5** (asynchronous query caching)
- **React Hook Form** + **Zod** (validations)
- **Recharts** (interactive dashboards)
- **Lucide React** (icons)

---

## 🗄️ Database Tables Schema

1. **Users**: Identifies user authentication data.
2. **Refresh Tokens**: Persists refresh UUIDs mapped to users with rotation rules.
3. **URLs**: Stores original target URLs, unique Base62 codes, custom aliases, security password hashes, expiration datetimes, click counts, and owner relations.
4. **Analytics**: Logs individual click timestamps, browser types, operating systems, device types, referring channels, and hashed client IPs.

---

## 🚀 Running Locally with Docker Compose

### Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Steps
1. **Clone the project** (if checking out from a repo) and navigate to the project directory:
   ```bash
   cd tinylink
   ```
2. **Start the containers**:
   ```bash
   docker-compose up --build -d
   ```
3. **Verify running containers**:
   ```bash
   docker ps
   ```
   This will spin up:
   - PostgreSQL on port `5432`
   - Redis on port `6379`
   - Spring Boot application on port `8080`
   - Nginx + React Frontend on port `80`

4. **Access the application**:
   - Open your browser and go to: **[http://localhost](http://localhost)**
   - To check the Swagger API documentation, visit: **[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)**

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create a user profile.
- `POST /api/auth/login` - Authenticate user and receive JWT access/refresh tokens.
- `POST /api/auth/refresh` - Swap a refresh token for rotated access/refresh tokens.

### User Profiles (`/api/users`)
- `GET /api/users/me` - Fetch details for the authenticated user.

### Link Management (`/api/urls`)
- `POST /api/urls` - Shorten a URL. Supporting aliases, expiration times, passwords, one-time flags.
- `GET /api/urls` - Get paginated/searchable list of user's URLs.
- `GET /api/urls/{id}` - Fetch metadata details of a link.
- `PUT /api/urls/{id}` - Update link properties (destination URL, passwords, aliases).
- `DELETE /api/urls/{id}` - Revoke and delete a shortened link.
- `POST /api/urls/{shortCode}/access` - Submit password validation to unlock target destination.

### Traffic Analytics (`/api/analytics`)
- `GET /api/analytics/dashboard` - Get aggregated stats and click counts.
- `GET /api/analytics/{id}` - Fetch a detailed list of click events for a specific URL.

### Redirect (Root level GET)
- `GET /{shortCode}` - Resolves URL, increments click counter asynchronously, and responds with a `302 Found` redirect.

---

## 🌐 Production Deployment Guide

### Deployment on Railway (Recommended)
1. **Database & Cache**:
   - Provision a **PostgreSQL** instance and a **Redis** instance from Railway template marketplace.
2. **Backend**:
   - Connect your GitHub repo, select the `tinylink/backend` folder.
   - Configure buildpack to Maven (Java 21).
   - Set environment variables:
     - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` (link these to your Railway PostgreSQL service variables).
     - `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` (link these to your Railway Redis service variables).
     - `JWT_SECRET` (generate a cryptographically strong string).
     - `FRONTEND_URL` (the domain assigned to your frontend service, e.g. `https://tinylink.railway.app`).
3. **Frontend**:
   - Connect your repo, select the `tinylink/frontend` folder.
   - Add environment variable `VITE_API_URL` pointing to your backend railway domain URL.
   - Deploy using the Dockerfile (it will automatically use Nginx to host the React build).

### Deployment on Render
1. **PostgreSQL / Redis**: Provision managed databases inside the Render dashboard.
2. **Backend Service**:
   - Create a new Web Service from render, pointing to your repo.
   - Specify root directory as `tinylink/backend`.
   - Set runtime to `Docker`.
   - Add the necessary PostgreSQL and Redis variables.
3. **Frontend Service**:
   - Create a Web Service pointing to `tinylink/frontend`.
   - Set runtime to `Docker`. (Nginx handles production static routing).
