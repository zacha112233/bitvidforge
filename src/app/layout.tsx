import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClipShrink — Shrink Any Video in Seconds',
  description:
    'Make any MP4, MOV, or WebM video fit Discord, Slack, or Email in seconds. 100% private and instant right in your browser.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090b10] text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
