# IMovies 🎬

A full-stack cinema ticket booking platform built with the MERN stack. Browse movies, pick a showtime, choose exact seats on a live seat map, pay (simulated) and keep your tickets.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-imovies--client.onrender.com-brightgreen?style=for-the-badge)](https://imovies-client.onrender.com)
[![Backend API](https://img.shields.io/badge/Backend%20API-imovies--serverr.onrender.com-blue?style=for-the-badge)](https://imovies-serverr.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-akshattorne%2FIMovies-black?style=for-the-badge&logo=github)](https://github.com/akshattorne/IMovies)

---

## ✨ Features

- **Browse & filter** movies by title, genre, language, city, date and sort order
- **Live seat map** — seats booked by others appear instantly via Socket.io
- **Seat holds** — seats held for 5 minutes while you pay; auto-released on timeout
- **Simulated payments** — card, UPI or wallet. Test failures: card ending `0000`, UPI starting `fail`
- **Tickets & history** — upcoming, past and cancelled; cancel up to 2 hours before showtime
- **Notifications** — bell icon for booking, payment and cancellation events
- **Admin panel** (`/admin`) — revenue stats, movie CRUD, theatre management, show scheduling

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Redux Toolkit, React Router, Bootstrap 5, Socket.io client |
| **Backend** | Node.js, Express, Mongoose, JWT, bcryptjs, Socket.io, Helmet, express-rate-limit |
| **Database** | MongoDB (local or Atlas) |
| **Deployment** | Docker Compose (local) · Render static site (frontend) · MongoDB Atlas (cloud DB) |

---

## 🚀 Quick Start

### Option A — Docker (recommended, no Node or MongoDB install needed)

```bash
git clone https://github.com/akshattorne/IMovies.git
cd IMovies
cp .env.example .env          # set JWT_SECRET to any long random string
docker compose up -d --build  # starts MongoDB, API and website
```

Open **http://localhost:8080**. Demo data (movies, theatres, shows, accounts) is seeded automatically.

Stop: `docker compose down` · Delete all data: `docker compose down -v`

---

### Option B — Manual (Node 18+ required)

```bash
# Terminal 1 — API
cd server
cp .env.example .env          # set JWT_SECRET
npm install
npm run seed                  # demo movies, theatres, shows, accounts
npm run dev                   # http://localhost:5000

# Terminal 2 — Frontend
cd client
npm install
npm run dev                   # http://localhost:5173
```

Open **http://localhost:5173**. The Vite dev server proxies `/api` and the socket to port 5000.

---

### Option C — MongoDB Atlas (cloud database)

1. Create a free M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. **Database Access** → add a DB user, note the password
3. **Network Access** → add `0.0.0.0/0` (allow from anywhere)
4. **Connect → Drivers** → copy the connection string, insert `imovies` before the `?`
5. Set in `server/.env`:
   ```
   MONGO_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/imovies?retryWrites=true&w=majority
   ```

---

## 🔑 Demo Accounts

| Role  | Email               | Password  |
|-------|---------------------|-----------|
| Admin | admin@imovies.com   | Admin@123 |
| User  | user@imovies.com    | User@123  |

> Change both passwords before putting this anywhere public.  
> Reset everything: `npm run seed:reset`

---

## 🎥 Real Movies & Posters

Movies, posters, descriptions and trailers are real. The importer tries **TMDB** first (when `TMDB_API_KEY` is set), then falls back to **Apple iTunes** (no key needed), then fictional placeholders.

#### Optional: TMDB API Key (richest data — cast, ratings, banners)

1. Create a free account at [themoviedb.org](https://www.themoviedb.org)
2. Go to Settings → API → request a Developer key
3. Add to `server/.env`: `TMDB_API_KEY=your_key_here`
4. Run: `npm run import:movies` (or `docker compose exec server node scripts/importMovies.js`)

---

## 📁 Project Structure

```
IMovies/
├── server/
│   ├── config/db.js
│   ├── models/          User · Movie · Theatre · Show · Seat · Booking · Payment · Notification
│   ├── controllers/     auth · movie · theatre · show · booking · admin
│   ├── middleware/      auth · error · rateLimit
│   ├── routes/index.js
│   ├── utils/           helpers · realtime · tmdb · itunes · showGenerator
│   ├── seed.js
│   └── server.js
├── client/
│   └── src/
│       ├── pages/       Home · Movies · MovieDetail · SeatSelection · Checkout · MyBookings · Auth · Admin
│       ├── components/  Navbar · Poster · MovieCard · Modal · DateStrip · Ticket · Footer
│       ├── features/    authSlice.js
│       └── context/     CityContext.jsx
├── docker-compose.yml
└── render.yaml
```

---

## 🔌 API Reference

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` `/api/auth/login` | Public (rate limited) |
| GET/PUT | `/api/auth/me` | Authenticated |
| GET | `/api/movies` `/api/movies/filters` `/api/movies/:id` | Public |
| POST/PUT/DELETE | `/api/movies/:id` | Admin |
| GET | `/api/theatres` | Public. POST/PUT/DELETE: Admin |
| GET | `/api/shows` `/api/shows/:id` | Public (seat map included) |
| POST/PUT/DELETE | `/api/shows` | Admin |
| POST | `/api/shows/:id/lock` `/unlock` | Authenticated |
| POST | `/api/bookings` | Authenticated |
| GET | `/api/bookings/mine` `/api/bookings/:id` | Authenticated |
| PUT | `/api/bookings/:id/cancel` | Authenticated |
| GET | `/api/admin/stats` `/api/admin/bookings` | Admin |

---

## 🔒 How Double-Booking is Prevented

Seats are MongoDB documents with status `available | locked | booked`. A single conditional `updateMany` claims only seats that are free or expired, then verifies it got all of them. If someone else wins any seat, the claim is rolled back. A 15-second background sweep releases expired holds and broadcasts updates to all connected clients.

---

## 🛡️ Security Notes

- Passwords hashed with **bcrypt**
- **JWT** in `Authorization` header, verified on every protected route
- **Helmet** headers, **CORS** restricted to `CLIENT_URL`
- Global rate limit + stricter limit on sign-in route
- Token stored in `localStorage` — for production, consider an httpOnly cookie
- Payments are **simulated**. Replace `simulateGateway` in `bookingController.js` with Razorpay or Stripe before taking real money

---

## 🗺️ Environment Variables

### `server/.env`

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://mongo:27017/imovies` |
| `JWT_SECRET` | Long random secret for signing tokens | *(required)* |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:5173` |
| `SEAT_HOLD_MINUTES` | Minutes a seat is held during checkout | `5` |
| `TMDB_API_KEY` | Optional — enables rich movie data | *(empty)* |

---

## 💡 Ideas for Next Steps

- Multi-language support
- Food & beverage add-ons
- Email tickets (Nodemailer / SendGrid)
- Promo codes & loyalty points
- Seat-map editor in admin panel
- Automated tests (Jest + Supertest)
- Real payment gateway (Razorpay / Stripe)
