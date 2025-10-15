import './globals.css';
import type { Metadata } from 'next';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { AuthProvider } from '@/components/AuthProvider';

export const metadata: Metadata = {
  title: 'Ravensearch',
  description: 'Technician search and compliance platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="app-layout">
            <Sidebar />
            <div className="main-content">
              <TopBar />
              {children}
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
