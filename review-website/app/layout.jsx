import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'Scanzaa Smart Review Gateway',
  description: 'Dynamic Google Review NFC Redirection Engine',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 font-sans antialiased text-slate-100 selection:bg-teal-500 selection:text-slate-950">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid #1e293b',
              fontSize: '13px',
              borderRadius: '12px',
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
