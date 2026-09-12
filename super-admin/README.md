# Renza Super Admin Portal

A desktop-first Next.js 14 web application for managing the Renza restaurant platform.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server (runs on port 3001)
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## Environment Variables

The file `.env.local` is already configured:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_CUSTOMER_URL=http://localhost:3003
```

Update these values if your API runs on a different port.

## Tech Stack

| Library | Purpose |
|---|---|
| Next.js 14 (App Router) | Framework |
| Tailwind CSS | Styling |
| axios | API calls |
| js-cookie | Token storage |
| react-hot-toast | Notifications |
| lucide-react | Icons |

## Project Structure

```
super-admin/
├── app/
│   ├── layout.jsx              # Root layout with Toaster
│   ├── page.jsx                # Redirect to /dashboard or /login
│   ├── globals.css             # Global styles
│   ├── login/
│   │   └── page.jsx            # Login page
│   └── (dashboard)/
│       ├── layout.jsx          # Sidebar layout with auth guard
│       ├── dashboard/
│       │   └── page.jsx        # Platform overview + stats
│       └── restaurants/
│           ├── page.jsx        # Restaurants list
│           ├── new/
│           │   └── page.jsx    # Create restaurant form
│           └── [id]/
│               ├── page.jsx    # Restaurant detail (tabs)
│               └── edit/
│                   └── page.jsx # Edit restaurant form
├── lib/
│   ├── api.js                  # Axios instance with auth interceptors
│   ├── auth.js                 # Cookie-based token helpers
│   └── utils.js                # cn(), formatDate(), formatNumber()
├── .env.local                  # Environment variables
├── next.config.mjs
├── tailwind.config.js
└── package.json
```

## API Endpoints Used

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Admin login |
| GET | `/api/admin/restaurants` | List all restaurants |
| POST | `/api/admin/restaurants` | Create restaurant |
| GET | `/api/admin/restaurants/:id` | Get restaurant details |
| PUT | `/api/admin/restaurants/:id` | Update restaurant |
| PATCH | `/api/admin/restaurants/:id/status` | Toggle active/suspended |
| GET | `/api/admin/restaurants/:id/qr` | Get QR code |
| GET | `/api/admin/restaurants/:id/analytics` | Get analytics data |

## Design

- **Primary color:** Orange (`#f97316`)
- **Sidebar:** Slate-900 (`#0f172a`)
- **Content background:** Slate-50
- **Active badge:** Green-100 / Green-800
- **Suspended badge:** Red-100 / Red-800
- **Veg dot:** Green-500
- **Non-veg dot:** Red-500

## Build for Production

```bash
npm run build
npm start
```
