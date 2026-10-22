import type { Metadata } from 'next';
import { CompressorStudio } from '@/app/page';

export const metadata: Metadata = {
  title: 'YouTube to Discord 10MB Video Compressor & Trimmer — Free Online',
  description:
    'Paste any YouTube video or Shorts link, trim the best clip with live frame preview, and compress it under 10MB (9.5 MB target) or 50MB Nitro to share directly in Discord.',
  alternates: {
    canonical: '/youtube-to-discord',
  },
  openGraph: {
    title: 'YouTube to Discord 10MB Video Compressor & Clipper — BitVidForge',
    description:
      'Import a YouTube or Shorts link into browser RAM, trim start/end timestamps, and compress to 9.5 MB for Discord Free or 48 MB for Nitro.',
    url: 'https://bitvidforge.vercel.app/youtube-to-discord',
  },
};

export default function YoutubeToDiscordPage() {
  return (
    <CompressorStudio
      initialPreset="discord"
      initialFormat="mp4-h264"
      heroTitlePrefix="YouTube to Discord"
      heroTitleHighlight="10MB Compressor"
      heroDescription="Paste any permitted YouTube video or Shorts link, trim exact start and end timestamps with live preview, and shrink it to 9.5 MB so it embeds directly in Discord."
    />
  );
}
