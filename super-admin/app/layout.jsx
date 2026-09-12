import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: 'Renza Super Admin',
  description: 'Renza Restaurant Platform - Super Admin Portal',
  icons: {
    icon: '/favicon.ico',
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
                primary: '#f97316',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
