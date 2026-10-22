import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BitVidForge — Local WebAssembly Video Compressor, Trimmer, GIF & MP3 Studio',
    short_name: 'BitVidForge',
    description:
      'Shrink any MP4, MOV, or WebM video for Discord (10MB), WhatsApp (16MB), Slack, or Email, trim dead air, and convert to GIF or MP3 100% locally in your browser.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0c0a09',
    theme_color: '#f59e0b',
    categories: ['multimedia', 'utilities', 'productivity'],
    icons: [
      {
        src: '/icon',
        sizes: '64x64',
        type: 'image/png',
      },
    ],
  };
}
