import type { Metadata } from 'next';
import { CompressorStudio } from '@/app/page';

export const metadata: Metadata = {
  title: 'Compress Video for Slack, GitHub PRs & Jira — Private In-Browser Tool',
  description:
    'Shrink large screen recordings and bug reproduction videos to fit Slack, GitHub Pull Requests (<10MB), and Jira without uploading confidential company demos to a third-party cloud.',
  alternates: {
    canonical: '/slack-video-compressor',
  },
  openGraph: {
    title: 'Compress Screen Recordings for Slack & GitHub PRs — Zero Server Upload',
    description:
      '100% client-side WebAssembly video compressor safe for NDA screen recordings, Slack threads, and GitHub PRs.',
    url: 'https://bitvidforge.vercel.app/slack-video-compressor',
  },
};

export default function SlackCompressorPage() {
  return (
    <CompressorStudio
      initialPreset="nitro"
      initialFormat="mp4-h264"
      heroTitlePrefix="Shrink Clips for"
      heroTitleHighlight="Slack & GitHub PRs"
      heroDescription="Safe for confidential workspace demos and NDA screen recordings — compress videos for Slack (<50MB) or GitHub PRs (<10MB) 100% locally in your browser with zero server egress."
    />
  );
}
