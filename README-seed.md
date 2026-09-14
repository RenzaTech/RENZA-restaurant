# Anbu'de Cafe Menu Seed

This frontend-side tooling script imports `data/anbude-cafe-menu.json` into the restaurant API. It does not modify the backend or upload dish images.

## Requirements

- Node.js 18 or newer
- The backend running at `API_URL` (defaults to `http://localhost:5000`)
- An existing restaurant-admin account for the target restaurant
- These environment variables:

```env
API_URL=http://localhost:5000
ADMIN_EMAIL=your-restaurant-admin@example.com
ADMIN_PASSWORD=your-password
```

The script reads `data/anbude-cafe-menu.json`, logs in, creates missing categories, and creates missing food items as multipart form data. It skips existing categories and foods by name, so it is safe to run again.

## Run

From the repository root:

```bash
node scripts/seed-anbude.mjs
```

The command prints each created, skipped, or failed record and exits with a non-zero status if any operation fails.
