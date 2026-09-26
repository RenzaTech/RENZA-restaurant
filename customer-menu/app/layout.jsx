import './globals.css';

export const metadata = {
  title: 'Renza — Royal Digital Restaurant Menu',
  description: "Scan the QR code to view your restaurant's visual menu, powered by Renza.",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#06090d',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#06090d" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-[#06090d] text-[#f6f2eb] antialiased">
        {children}
      </body>
    </html>
  );
}
