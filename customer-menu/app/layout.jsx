import './globals.css';

export const metadata = {
  title: 'Scanzaa — Guest Dining Portal',
  description: 'Digital restaurant menu and dining hub powered by Scanzaa.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Aclonica&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[#FFFCF7] sm:bg-[#F6F3EC] text-slate-800 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
