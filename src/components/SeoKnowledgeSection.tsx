import React from 'react';
import Link from 'next/link';
import { HelpCircle, Table2, CheckCircle2, Sparkles, Compass, ArrowUpRight } from 'lucide-react';
import { FAQ_ITEMS } from './SeoStructuredData';

export const SEO_TOOL_PAGES = [
  {
    href: '/discord-video-compressor',
    title: 'Discord 10MB Video Compressor',
    desc: 'Pre-configured 9.5 MB & 48 MB Nitro targets for instant Discord sharing.',
  },
  {
    href: '/youtube-to-discord',
    title: 'YouTube to Discord 10MB Clipper',
    desc: 'Paste a YouTube or Shorts link, trim timestamps, and shrink under 10MB.',
  },
  {
    href: '/youtube-to-gif',
    title: 'YouTube to High-FPS GIF Maker',
    desc: 'Turn any YouTube clip or Short into a smooth 192-color looping GIF.',
  },
  {
    href: '/youtube-to-mp3',
    title: 'YouTube to 192kbps MP3 Extractor',
    desc: 'Import a permitted YouTube link, trim start/end, and extract stereo MP3.',
  },
  {
    href: '/whatsapp-video-compressor',
    title: 'WhatsApp 16MB Video Compressor',
    desc: 'Shrink mobile & desktop clips under the 16 MB WhatsApp media cap.',
  },
  {
    href: '/mov-to-mp4-converter',
    title: 'Convert MOV to MP4 in Browser',
    desc: 'Turn iPhone & Mac QuickTime (.mov) videos into universal H.264 MP4s.',
  },
  {
    href: '/video-to-gif',
    title: 'MP4 to High-FPS GIF Converter',
    desc: '192-color adaptive palette GIF generator for Discord, Slack & GitHub.',
  },
  {
    href: '/extract-mp3-from-video',
    title: 'Extract MP3 Audio from Video',
    desc: '1-click 192 kbps stereo MP3 audio extraction with zero server uploads.',
  },
  {
    href: '/mute-video-online',
    title: 'Remove Audio / Mute Video',
    desc: 'Strip background mic noise (-an) and boost video bitrate quality.',
  },
  {
    href: '/slack-video-compressor',
    title: 'Slack & GitHub PR Compressor',
    desc: 'NDA-safe client-side screen recording compressor for remote teams.',
  },
  {
    href: '/compress-video-for-email',
    title: 'Email Attachment Video Shrinker',
    desc: 'Make large recordings fit Gmail, Outlook & Apple Mail (<10 MB).',
  },
  {
    href: '/',
    title: 'BitVidForge Full Media Studio',
    desc: 'All-in-one WebAssembly compressor, dead-air trimmer & batch ZIP exporter.',
  },
];

export default function SeoKnowledgeSection() {
  const platformLimits = [
    {
      platform: 'Discord (Free Tier)',
      maxLimit: '10 MB',
      presetTarget: '9.5 MB (Discord Free Preset)',
      recommendedSettings: 'MP4 (H.264) • 720p • Trim dead air',
    },
    {
      platform: 'WhatsApp Media Share',
      maxLimit: '16 MB',
      presetTarget: '15.5 MB (WhatsApp Preset)',
      recommendedSettings: 'MP4 (H.264) • 720p or Original',
    },
    {
      platform: 'Discord Nitro Basic / Slack',
      maxLimit: '50 MB',
      presetTarget: '48 MB (Nitro / Slack Preset)',
      recommendedSettings: 'MP4 (H.264) or WebM (VP9) • 1080p',
    },
    {
      platform: 'Gmail / Outlook Email',
      maxLimit: '10 MB – 25 MB',
      presetTarget: '9.5 MB (Email Preset)',
      recommendedSettings: 'MP4 (H.264) • 720p • 30 fps',
    },
    {
      platform: 'GitHub PRs & Docs Loops',
      maxLimit: '10 MB (Free)',
      presetTarget: 'Animated GIF or 9.5 MB MP4',
      recommendedSettings: '192-Color PaletteGen GIF or Muted MP4',
    },
  ];

  return (
    <section
      aria-label="Video Compression Guide, Platform Size Limits, and FAQ"
      className="pt-8 border-t border-stone-800/80 space-y-10 text-stone-300"
    >
      {/* 2026 Platform Upload Size Reference Table (Highly Citable by Google Snippets & AI Engines) */}
      <div className="rounded-2xl border border-stone-800/90 bg-[#141210]/90 p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Table2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              2026 Video Upload Size Limits &amp; Recommended BitVidForge Presets
            </h2>
            <p className="text-xs text-stone-400">
              Quick reference guide for shrinking MP4, MOV, and WebM clips to pass platform size
              caps on the first upload.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 font-mono text-[11px] uppercase">
                <th className="py-2.5 pr-4">Platform / App</th>
                <th className="py-2.5 px-4">Official Upload Cap</th>
                <th className="py-2.5 px-4">BitVidForge Preset</th>
                <th className="py-2.5 pl-4">Best Quality Tip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {platformLimits.map((row) => (
                <tr key={row.platform} className="hover:bg-stone-900/40">
                  <td className="py-3 pr-4 font-semibold text-white">{row.platform}</td>
                  <td className="py-3 px-4 font-mono text-amber-300">{row.maxLimit}</td>
                  <td className="py-3 px-4 font-mono text-emerald-300">{row.presetTarget}</td>
                  <td className="py-3 pl-4 text-stone-400 text-xs">{row.recommendedSettings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* How BitVidForge Works (Step-by-Step Semantic Summary for Search & AI Crawlers) */}
      <div className="rounded-2xl border border-stone-800/90 bg-[#141210]/90 p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Why Local WebAssembly Beats Traditional Cloud Video Compressors
            </h2>
            <p className="text-xs text-stone-400">
              Deterministic VBR bitrate math + zero cloud queues.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm leading-relaxed text-stone-300">
          <div className="p-4 rounded-xl bg-[#0c0a09] border border-stone-800/80 space-y-1.5">
            <h3 className="font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Exact Target File Size Formula</span>
            </h3>
            <p className="text-stone-400 text-xs leading-relaxed">
              Instead of guessing a random quality percentage, BitVidForge calculates the exact
              video bitrate in kilobits per second:{' '}
              <code className="text-amber-300 font-mono">
                kbps = (Target_MB × 8192 / Trimmed_Duration_Sec) - Audio_kbps
              </code>
              . Your video lands reliably under 10MB for Discord or 16MB for WhatsApp without
              wasting megabytes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0c0a09] border border-stone-800/80 space-y-1.5">
            <h3 className="font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Private &amp; Instant Startup</span>
            </h3>
            <p className="text-stone-400 text-xs leading-relaxed">
              Cloud converters force you to upload a 300MB video over slow home Wi-Fi, wait in a
              remote server queue, and re-download the result. BitVidForge mounts your file
              instantly in local browser RAM using multi-threaded{' '}
              <code className="text-emerald-300 font-mono">@ffmpeg/ffmpeg</code> WebAssembly.
            </p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions (Matches FAQPage Schema.org JSON-LD) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-stone-400">
              Everything you need to know about shrinking videos, trimming clips, and exporting
              GIFs or MP3s in your browser.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FAQ_ITEMS.map((item) => (
            <article
              key={item.question}
              className="rounded-2xl border border-stone-800/80 bg-[#141210]/80 p-4 sm:p-5 space-y-2"
            >
              <h3 className="text-sm font-bold text-white leading-snug">{item.question}</h3>
              <p className="text-xs text-stone-400 leading-relaxed">{item.answer}</p>
            </article>
          ))}
        </div>
      </div>

      {/* Internal SEO Link Cluster: Specialized In-Browser Media Tools */}
      <nav
        aria-label="Specialized Video Compression & Conversion Tools"
        className="rounded-2xl border border-stone-800/90 bg-[#141210]/90 p-5 sm:p-6 space-y-4"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Specialized In-Browser Tools &amp; Presets
            </h2>
            <p className="text-xs text-stone-400">
              Jump directly to a pre-configured workflow for your platform or output format.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SEO_TOOL_PAGES.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group rounded-xl bg-[#0c0a09] border border-stone-800 hover:border-amber-500/50 p-3.5 transition flex flex-col justify-between gap-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-white group-hover:text-amber-300 transition">
                  {tool.title}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-400 shrink-0 transition" />
              </div>
              <p className="text-[11px] text-stone-400 leading-relaxed">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </nav>
    </section>
  );
}
