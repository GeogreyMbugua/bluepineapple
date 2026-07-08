/**
 * Default metadata for the application.
 *
 * Used in the root layout and can be extended per-page using
 * Next.js generateMetadata or static metadata exports.
 */

import type { Metadata, Viewport } from 'next';
import { APP_NAME } from './constants';

export const siteConfig = {
  name: APP_NAME,
  description:
    'Blue Pineapple — Premium experiences, seamless bookings, and unforgettable adventures.',
  url: 'https://bluepineapple.com',
  ogImage: '/images/og-default.png',
  creator: 'Blue Pineapple',
  locale: 'en_US',
} as const;

/** Root-level metadata — applied to every page via the title template */
export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),

  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },

  description: siteConfig.description,

  applicationName: siteConfig.name,

  authors: [{ name: siteConfig.creator }],
  creator: siteConfig.creator,

  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@bluepineapple',
  },

  icons: {
    icon: '/favicon.ico',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

/** Viewport configuration */
export const defaultViewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};
