import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { RoleProvider } from '@/context/RoleContext';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TaskCard Workflow Tool — Business Need to Student Proposals',
  description: 'Turn informal business needs into structured task cards with quality scoring and review student proposals.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased`}>
        <RoleProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </main>
          <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>© 2026 TaskCard MVP • Business Need → Public Catalog → Student Proposals</p>
              <div className="flex items-center gap-4 text-slate-400">
                <span>D1 + R2 Hosted MVP (Track A)</span>
                <span>•</span>
                <span>Java Spring Boot + Postgres (Track B)</span>
              </div>
            </div>
          </footer>
        </RoleProvider>
      </body>
    </html>
  );
}
