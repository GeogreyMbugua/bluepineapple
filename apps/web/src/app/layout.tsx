import type { Metadata, Viewport } from 'next';
import { Inter, Geist_Mono } from 'next/font/google';
import { defaultMetadata, defaultViewport } from '@/config/metadata';
import { AppProviders } from '@/providers';
import LenisScroll from '@/components/marketing/lenis-scroll';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = defaultMetadata;
export const viewport: Viewport = defaultViewport;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AppProviders>
          <LenisScroll />
          <Navbar />
          {children}
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
