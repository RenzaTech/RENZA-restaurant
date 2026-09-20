import './globals.css';

export const metadata = {
  title: 'Renza — Digital Restaurant Menu',
  description: "Scan the QR code to view your restaurant's digital menu, powered by Renza.",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#05070b',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#05070b" />
      </head>
      <body className="min-h-screen bg-[#05070b] font-sans text-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}
