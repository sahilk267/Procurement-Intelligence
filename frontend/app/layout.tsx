import type { Metadata } from 'next';
import { AuthProvider } from "../lib/auth-context";
import './globals.css';

export const metadata: Metadata = {
  title: 'Procurement Intelligence Platform',
  description: 'AI-powered procurement and vendor management platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
