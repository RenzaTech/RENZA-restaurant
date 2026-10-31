# Customer Menu Update

A modern, responsive customer-facing digital menu application built with Next.js 14, Tailwind CSS, Lucide Icons, and Axios for the Renza Restaurant POS platform.

---

## 🚀 Features

- Dynamic restaurant menu loaded via restaurant slug
- Real-time cart management & order submission
- Responsive, mobile-first design for in-store QR code table ordering
- Category filtering and search

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios

---

## 🏁 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_DEFAULT_SLUG=anbude-cafe
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3004](http://localhost:3004) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```
