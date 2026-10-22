import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import SeoStructuredData from '@/components/SeoStructuredData';
import './globals.css';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://bitvidforge.vercel.app';

export const viewport: Viewport = {
  themeColor: '#0c0a09',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      'BitVidForge — Free Video Compressor for Discord (10MB), WhatsApp & Slack | No Upload',
    template: '%s | BitVidForge',
  },
  description:
    'Shrink any MP4, MOV, or WebM video to fit Discord (10MB Free / 50MB Nitro), WhatsApp (16MB), Slack, or Email in seconds. 100% private in-browser WebAssembly video compressor with built-in dead-air trimmer, high-FPS GIF maker & MP3 audio extractor.',
  applicationName: 'BitVidForge',
  keywords: [
    'BitVidForge',
    'video compressor for Discord',
    'compress video under 10MB',
    'Discord 10MB video compressor',
    'WhatsApp 16MB video compressor',
    'free online video compressor no upload',
    'client-side WebAssembly video compressor',
    'FFmpeg wasm video compressor',
    'compress MP4 in browser',
    'compress MOV to MP4',
    'video trimmer and compressor',
    'convert video to high FPS GIF',
    'extract MP3 from video in browser',
    'private video compressor',
    'reduce video file size for email',
    'batch video compressor ZIP',
  ],
  authors: [{ name: 'BitVidForge' }],
  creator: 'BitVidForge',
  publisher: 'BitVidForge',
  category: 'multimedia',
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'EGJuV88C6EJhWFF3w_VT9SJ-lrCuDHT73cZhvV38Uz0',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'BitVidForge',
    title:
      'BitVidForge — Free In-Browser Video Compressor for Discord 10MB, WhatsApp & Slack',
    description:
      'Make large videos fit Discord (10MB), WhatsApp (16MB), or Email in seconds. 100% private local WebAssembly with built-in video trimmer, GIF maker & MP3 extractor.',
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'BitVidForge — Free In-Browser Video Compressor (Discord 10MB, WhatsApp, GIF & MP3)',
    description:
      '100% local WebAssembly video compressor, trimmer, high-FPS GIF converter & MP3 extractor. Zero server uploads.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <SeoStructuredData />
      </head>
      <body className="min-h-screen bg-[#0c0a09] text-stone-100 antialiased selection:bg-amber-500/30 selection:text-amber-200">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
