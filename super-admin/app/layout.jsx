import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: 'SCANZAA Super Admin — Powered by Renza',
  description: 'SCANZAA Restaurant Platform - Super Admin Portal',
  icons: {
    icon: '/scanzaa-icon.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-slate-50 text-slate-900 min-h-screen">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: '14px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            },
            success: {
              iconTheme: {
                primary: '#00d2c4',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
