import type { Metadata } from 'next';
import { CompressorStudio } from '@/app/page';

export const metadata: Metadata = {
  title: 'YouTube to GIF Maker — High-FPS Animated GIF Converter & Trimmer',
  description:
    'Turn any YouTube video or Shorts link into a smooth, high-FPS looping GIF. Trim exact start and end timestamps and generate a 192-color adaptive palette GIF in your browser.',
  alternates: {
    canonical: '/youtube-to-gif',
  },
  openGraph: {
    title: 'YouTube to High-FPS Animated GIF Maker & Trimmer — BitVidForge',
    description:
      'Paste a YouTube link, scrub start/end timestamps, and convert any clip into a crystal-clear 192-color adaptive palette GIF.',
    url: 'https://bitvidforge.vercel.app/youtube-to-gif',
  },
};

export default function YoutubeToGifPage() {
  return (
    <CompressorStudio
      initialPreset="discord"
      initialFormat="gif"
      heroTitlePrefix="YouTube to"
      heroTitleHighlight="High-FPS GIF"
      heroDescription="Paste a YouTube video or Shorts URL, trim your exact highlight clip, and forge a smooth 192-color adaptive palette GIF for Discord, Slack, or GitHub."
    />
  );
}
