import type { Metadata } from 'next';
import { CompressorStudio } from '@/app/page';

export const metadata: Metadata = {
  title: 'Convert Video to High-FPS Animated GIF in Browser (No Watermark)',
  description:
    'Convert MP4, MOV, and WebM clips into crisp, looping animated GIFs using 192-color adaptive palette generation (FFmpeg Lanczos + PaletteGen). 100% free, no watermarks, zero uploads.',
  alternates: {
    canonical: '/video-to-gif',
  },
  openGraph: {
    title: 'MP4 to High-FPS GIF Converter — Free & 100% In-Browser',
    description:
      'Create smooth 192-color adaptive palette GIFs for Discord, Slack, and GitHub Pull Requests locally in your browser.',
    url: 'https://bitvidforge.vercel.app/video-to-gif',
  },
};

export default function VideoToGifPage() {
  return (
    <CompressorStudio
      initialPreset="discord"
      initialFormat="gif"
      heroTitlePrefix="Video to High-FPS"
      heroTitleHighlight="Animated GIF"
      heroDescription="Convert MP4, MOV, and WebM clips into razor-sharp looping GIFs using FFmpeg Lanczos scaling and 192-color adaptive palette generation — zero watermarks and zero uploads."
    />
  );
}
