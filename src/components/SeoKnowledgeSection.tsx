import React from 'react';
import { HelpCircle, Table2, CheckCircle2, Sparkles } from 'lucide-react';
import { FAQ_ITEMS } from './SeoStructuredData';

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
    </section>
  );
}
