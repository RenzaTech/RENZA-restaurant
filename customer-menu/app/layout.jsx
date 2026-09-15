import './globals.css';

export const metadata = {
  title: 'Renza — Digital Restaurant Menu',
  description: "Scan the QR code to view your restaurant's digital menu, powered by Renza.",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0B0B0F',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#0B0B0F" />
      </head>
      <body className="bg-renza-cream font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
