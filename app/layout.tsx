import './globals.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Analytics } from '@vercel/analytics/next';
import AppProviders from '@/components/providers/AppProviders';

const inter = localFont({
  src: './fonts/inter-latin-wght-normal.woff2',
  weight: '100 900',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ez Prep - Crack Your Dream Government Exams',
  description: 'Master competitive exams with AI-powered mock tests, expert faculty guidance, and comprehensive practice sessions.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProviders>
          {children}
        </AppProviders>
        <Analytics />
      </body>
    </html>
  );
}