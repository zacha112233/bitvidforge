'use client';

import React from 'react';
import { Megaphone, ExternalLink } from 'lucide-react';
import { AD_CONFIG } from '@/config/ads';

interface AdSlotProps {
  size: '728x90' | '300x250';
  className?: string;
}

export default function AdSlot({ size, className = '' }: AdSlotProps) {
  const unitId =
    size === '728x90'
      ? AD_CONFIG.aadsUnit728x90.trim()
      : AD_CONFIG.aadsUnit300x250.trim();

  if (size === '728x90') {
    return (
      <div
        data-testid="ad-slot-728x90"
        className={`w-full max-w-[728px] min-h-[90px] rounded-xl border border-dashed border-slate-700/80 bg-[#111622] overflow-hidden flex flex-col items-center justify-center ${className}`}
      >
        {unitId ? (
          <div className="w-full flex flex-col items-center">
            <div className="w-full px-3 py-1 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Sponsor / Ad Space</span>
              <span>A-Ads 728×90</span>
            </div>
            <iframe
              data-aa={unitId}
              src={`https://ad.a-ads.com/${encodeURIComponent(unitId)}?size=728x90`}
              title="Sponsor Leaderboard 728x90"
              style={{
                width: '728px',
                height: '90px',
                border: '0px',
                padding: 0,
                overflow: 'hidden',
                backgroundColor: 'transparent',
                maxWidth: '100%',
              }}
              scrolling="no"
            />
          </div>
        ) : (
          <div className="w-full px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Megaphone className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Sponsor / Ad Space
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    728x90 IAB Leaderboard
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-200 mt-1">
                  Zero cloud GPU costs — Local WebAssembly keeps ClipShrink 100% free &amp; private.
                </p>
              </div>
            </div>
            <a
              href={AD_CONFIG.sponsorInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-400 hover:text-indigo-300 shrink-0 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 transition"
            >
              <span>728 × 90 Slot</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    );
  }

  // 300x250 Medium Rectangle
  return (
    <div
      data-testid="ad-slot-300x250"
      className={`w-[300px] min-h-[250px] rounded-xl border border-dashed border-slate-700 bg-[#0b0e17] overflow-hidden flex flex-col items-center justify-between text-center shadow-inner ${className}`}
    >
      <div className="w-full px-3.5 py-2 flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-slate-800">
        <span className="uppercase tracking-wider text-indigo-300 font-semibold">
          Sponsor / Ad Space
        </span>
        <span>300x250</span>
      </div>

      {unitId ? (
        <div className="my-auto flex items-center justify-center w-[300px] h-[250px]">
          <iframe
            data-aa={unitId}
            src={`https://ad.a-ads.com/${encodeURIComponent(unitId)}?size=300x250`}
            title="Sponsor Medium Rectangle 300x250"
            style={{
              width: '300px',
              height: '250px',
              border: '0px',
              padding: 0,
              overflow: 'hidden',
              backgroundColor: 'transparent',
            }}
            scrolling="no"
          />
        </div>
      ) : (
        <div className="my-auto space-y-2 px-5 py-4">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto">
            <Megaphone className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-sm font-semibold text-white">Sponsor / Ad Space</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Standardized 300×250 Medium Rectangle dwell-time placement rendered while local
            WebAssembly encodes video.
          </p>
        </div>
      )}

      <div className="w-full px-3.5 py-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span>IAB Medium Rectangle</span>
        <span>300 × 250 px</span>
      </div>
    </div>
  );
}
