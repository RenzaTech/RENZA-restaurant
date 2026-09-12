# Renza Backend API

Node.js + Express REST API for the Renza QR Restaurant Menu Platform.

## Setup Instructions

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment variables

Edit `backend/.env` and set your **Neon PostgreSQL** connection string:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>/renza?sslmode=require"
JWT_SECRET="renza-super-secret-jwt-key-change-in-production-2024"
PORT=5000
FRONTEND_URL="http://localhost:3001,http://localhost:3002,http://localhost:3003"
```

Get your `DATABASE_URL` from [Neon Console](https://console.neon.tech) → your project → Connection Details.

### 3. Generate Prisma client

```bash
npx prisma generate
```

### 4. Push schema to database

```bash
npx prisma db push
```

### 5. Seed the database

```bash
node src/seed.js
```

This creates:
- **Superadmin**: `admin@renza.com` / `renza2024`
- **Restaurant**: ABC Restaurant (South Indian)
- **Restaurant Admin**: `admin@abcrestaurant.com` / `restaurant123`
- 4 categories + 8 sample food items

### 6. Start development server

```bash
npm run dev
```

Server runs at **http://localhost:5000**

---

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Login — returns JWT token |
| GET | `/api/auth/me` | Get current user (requires token) |

### Superadmin (`/api/admin`) — requires superadmin JWT
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/restaurants` | List all restaurants |
| POST | `/api/admin/restaurants` | Create restaurant + admin |
| GET | `/api/admin/restaurants/:id` | Get restaurant detail |
| PUT | `/api/admin/restaurants/:id` | Update restaurant |
| PATCH | `/api/admin/restaurants/:id/status` | Toggle active/suspended |
| GET | `/api/admin/restaurants/:id/analytics` | Analytics data |
| GET | `/api/admin/restaurants/:id/qr` | Get QR code (base64 PNG) |
| DELETE | `/api/admin/restaurants/:id` | Delete restaurant |

### Restaurant Admin (`/api/restaurant`) — requires restaurant_admin JWT
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/restaurant/profile` | Get own restaurant |
| PUT | `/api/restaurant/profile` | Update profile (+ logo upload) |
| GET | `/api/restaurant/dashboard` | Dashboard stats |
| GET | `/api/restaurant/categories` | List categories |
| POST | `/api/restaurant/categories` | Create category |
| PUT | `/api/restaurant/categories/:id` | Update category |
| DELETE | `/api/restaurant/categories/:id` | Delete category |
| GET | `/api/restaurant/foods` | List food items |
| POST | `/api/restaurant/foods` | Create food item (+ image upload) |
| PUT | `/api/restaurant/foods/:id` | Update food item (+ image upload) |
| DELETE | `/api/restaurant/foods/:id` | Delete food item |
| PATCH | `/api/restaurant/foods/:id/availability` | Toggle availability |

### Public Menu (`/api/menu`) — no auth
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/menu/:slug` | Get full menu (active restaurants only) |
| POST | `/api/menu/:slug/track` | Record analytics event |

---

## Image Uploads

- Upload images via `multipart/form-data` with field name `image`
- Stored in `backend/uploads/` folder
- Served at `http://localhost:5000/uploads/<filename>`
- Allowed formats: JPEG, JPG, PNG, WebP
- Max size: 5MB

## Analytics Tracking

Track events from the public menu frontend:

```js
// POST /api/menu/:slug/track
{
  "eventType": "qr_scan" | "menu_view" | "item_view",
  "sessionId": "unique-session-id",
  "foodItemId": "optional-item-id",  // for item_view only
  "deviceType": "mobile" | "desktop" | "tablet"
}
```

---

## Scripts

```bash
npm run dev        # Start with nodemon (auto-reload)
npm start          # Production start
npm run db:push    # Push Prisma schema to DB
npm run db:seed    # Seed the database
npm run db:studio  # Open Prisma Studio GUI
```
