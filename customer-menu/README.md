# Renza Customer Menu

Public-facing mobile-first digital menu web app. Customers scan a restaurant's QR code to view the menu instantly — no login required.

## Getting Started

### 1. Install dependencies

```bash
cd customer-menu
npm install
```

### 2. Configure environment

Edit `.env.local` and set your API URL:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Start the dev server

```bash
npm run dev
```

App runs on **http://localhost:3003**

---

## Menu URL Format

```
http://localhost:3003/menu/<restaurant-slug>
```

Example: `http://localhost:3003/menu/abc-restaurant`

The slug must match a restaurant registered in the Renza backend.

---

## Features

- 📱 **Mobile-first** — optimized for phones (Android & iOS)
- ⚡ **Fast** — skeleton loading, lazy images, minimal JS
- 🍽 **Full menu display** — grouped by category with sticky nav
- 🟢🔴 **Veg/Non-veg indicators** — clear visual dots
- 🌶 **Dietary tags** — Spicy, Jain (JN), Vegan (VG), Gluten-free (GF)
- 📋 **Item detail sheet** — tap any item for full info
- 📊 **Silent analytics** — tracks QR scans, menu views, item views
- 🚫 **No auth** — fully public, no login required
- 🎨 **Renza branded** — orange accent, Inter font, premium look

## Project Structure

```
customer-menu/
├── app/
│   ├── layout.jsx          # Root layout (Inter font, metadata)
│   ├── page.jsx            # Landing: "Scan a QR code"
│   ├── not-found.jsx       # Custom 404
│   └── menu/
│       └── [slug]/
│           └── page.jsx    # Main menu page (entire app)
├── utils/
│   └── analytics.js        # Silent event tracking
├── .env.local              # API URL config
├── next.config.mjs
├── tailwind.config.js
└── package.json
```

## Production Build

```bash
npm run build
npm start
```
