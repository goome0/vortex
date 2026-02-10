import type { Metadata } from 'next';
import { Outfit, Orbitron } from 'next/font/google';
import './globals.css';
import { Navbar, Footer } from '@/components/layout';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants';
import { Providers } from './providers';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: ['MMORPG', 'Post-Apocalyptic', 'Gaming', 'Vortex', 'Heeho Server'],
  authors: [{ name: 'Vortex Team' }],
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${orbitron.variable}`} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <Providers>
          {/* Noise Overlay */}
          <div className="noise-overlay" aria-hidden="true" />
          
          {/* Main Structure */}
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
