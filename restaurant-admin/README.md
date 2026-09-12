# Renza Restaurant Admin Portal

Mobile-first Next.js 14 web application for restaurant owners to manage their Renza QR menu.

## Tech Stack

- **Next.js 14** (App Router, JS not TS)
- **Tailwind CSS** — mobile-first utility classes
- **Hand-coded UI components** — Button, Card, Input, Switch, Dialog, Badge, Select, Skeleton, Textarea
- **Axios** — API calls with auth interceptors
- **js-cookie** — JWT token management
- **react-hot-toast** — toast notifications
- **lucide-react** — icons

---

## Setup & Run

### 1. Install dependencies

```bash
cd restaurant-admin
npm install
```

### 2. Configure environment

Edit `.env.local` and set your API URL:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Start development server (port 3002)

```bash
npm run dev -- -p 3002
```

Open [http://localhost:3002](http://localhost:3002)

---

## Pages

| Route | Description |
|---|---|
| `/` | Redirects to `/dashboard` or `/login` |
| `/login` | Login with email + password |
| `/dashboard` | Today's stats, quick actions, top items |
| `/menu` | Food item list with availability toggles |
| `/menu/new` | Add new food item |
| `/menu/[id]/edit` | Edit existing food item |
| `/categories` | Manage categories (add, edit, delete, reorder) |
| `/profile` | Restaurant profile & logo |

---

## API Endpoints Expected

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login — returns `{ token, user }` |
| GET | `/api/restaurant/dashboard` | Dashboard stats |
| GET | `/api/restaurant/foods` | List food items |
| POST | `/api/restaurant/foods` | Create food item (multipart) |
| GET | `/api/restaurant/foods/:id` | Get single food item |
| PUT | `/api/restaurant/foods/:id` | Update food item (multipart) |
| DELETE | `/api/restaurant/foods/:id` | Delete food item |
| PATCH | `/api/restaurant/foods/:id/availability` | Toggle availability |
| GET | `/api/restaurant/categories` | List categories |
| POST | `/api/restaurant/categories` | Create category |
| PUT | `/api/restaurant/categories/:id` | Update category |
| DELETE | `/api/restaurant/categories/:id` | Delete category |
| GET | `/api/restaurant/profile` | Get restaurant profile |
| PUT | `/api/restaurant/profile` | Update profile (multipart) |

---

## Authentication

- Token stored in cookie: `renza_restaurant_token` (7 day expiry)
- All API requests attach `Authorization: Bearer <token>` header
- 401 responses → auto-redirect to `/login`
- Login verifies role is `restaurant_admin`

---

## Project Structure

```
restaurant-admin/
├── app/
│   ├── globals.css
│   ├── layout.jsx          # Root layout + Toaster
│   ├── page.jsx            # Redirect to dashboard/login
│   ├── login/
│   │   └── page.jsx
│   └── (app)/
│       ├── layout.jsx      # Top bar + bottom nav + auth guard
│       ├── dashboard/
│       │   └── page.jsx
│       ├── menu/
│       │   ├── page.jsx
│       │   ├── new/
│       │   │   └── page.jsx
│       │   └── [id]/edit/
│       │       └── page.jsx
│       ├── categories/
│       │   └── page.jsx
│       └── profile/
│           └── page.jsx
├── components/
│   ├── FoodItemForm.jsx    # Shared add/edit form
│   └── ui/
│       ├── button.jsx
│       ├── card.jsx
│       ├── input.jsx
│       ├── label.jsx
│       ├── badge.jsx
│       ├── switch.jsx
│       ├── dialog.jsx
│       ├── select.jsx
│       ├── skeleton.jsx
│       ├── separator.jsx
│       └── textarea.jsx
├── lib/
│   ├── api.js              # Axios instance + interceptors
│   ├── auth.js             # Cookie token helpers
│   └── utils.js            # cn() class merger
├── .env.local
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```
