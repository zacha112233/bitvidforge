import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BitVidForge — Forge Smaller Videos, GIFs & Audio in Seconds',
  description:
    'Make any MP4, MOV, or WebM fit Discord (10MB), WhatsApp, or Slack with precision bitrate targeting, instant video trimming, and 1-click GIF/MP3 extraction. 100% private in your browser.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0c0a09] text-stone-100 antialiased selection:bg-amber-500/30 selection:text-amber-200">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
