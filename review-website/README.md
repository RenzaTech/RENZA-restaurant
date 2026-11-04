# Scanzaa Smart Review Gateway (`review-website`)

Dedicated, high-speed website for Google Review NFC Cards and QR stands.

## Core Features
1. **Dynamic Link Redirection (`/c/:code`)**:
   - Customer taps physical NFC card or scans QR code.
   - Evaluates real-time active status:
     - **If ON (Active / Paid):** Sends instant HTTP 302 redirect to the restaurant's Google Review URL.
     - **If OFF (Unpaid / Paused in Super Admin):** Blocks Google Review and displays polite maintenance notice (`/inactive`).
2. **Idea 2 Built-in: In-Browser Web-NFC Writer (`NfcWriter.jsx`)**:
   - Uses native `window.NDEFReader` on Android Chrome.
   - Allows burning the dynamic URL onto blank NFC cards directly from the browser in 1 second.
3. **Idea 2 Built-in: Print-Ready QR Code Generator (`QrCodeViewer.jsx`)**:
   - Generates high-resolution PNG/SVG QR codes for acrylic table tents, bill folders, and counter stickers.
4. **Generator Portal (`/admin`)**:
   - Auto-populates restaurants fetched directly from Super Admin.
   - Real-time card inventory and instant ON/OFF switch.

## Running Locally
```bash
npm run dev
```
Runs on port `3005`: `http://localhost:3005`
- Generator Portal: `http://localhost:3005/admin`
- Redirect Test: `http://localhost:3005/c/YOUR_CODE`
- Inactive Page: `http://localhost:3005/inactive`
