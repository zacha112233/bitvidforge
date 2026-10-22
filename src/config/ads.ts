/**
 * Central Ad & Sponsorship Configuration for BitVidForge.
 *
 * How to connect your A-Ads (aads.com) units:
 * 1. In your A-Ads dashboard, create two Ad Units:
 *    - Unit 1 Size: 728x90 (Leaderboard)
 *    - Unit 2 Size: 300x250 (Medium Rectangle)
 * 2. Either paste the numeric Unit IDs below OR set them in Vercel Environment Variables:
 *    - NEXT_PUBLIC_AADS_UNIT_728X90
 *    - NEXT_PUBLIC_AADS_UNIT_300X250
 */

export interface AdConfig {
  /** A-Ads numeric unit ID for 728x90 Leaderboard (e.g. "2345678") */
  aadsUnit728x90: string;
  /** A-Ads numeric unit ID for 300x250 Medium Rectangle (e.g. "2345679") */
  aadsUnit300x250: string;
  /** Optional fallback link when someone clicks "Advertise Here" on placeholder */
  sponsorInquiryUrl: string;
}

export const AD_CONFIG: AdConfig = {
  aadsUnit728x90:
    process.env.NEXT_PUBLIC_AADS_UNIT_728X90 ||
    process.env.NEXT_PUBLIC_AADS_UNIT_728x90 ||
    process.env.NEXT_PUBLIC_AADS_728X90 ||
    process.env.NEXT_PUBLIC_AADS_728x90 ||
    '',
  aadsUnit300x250:
    process.env.NEXT_PUBLIC_AADS_UNIT_300X250 ||
    process.env.NEXT_PUBLIC_AADS_UNIT_300x250 ||
    process.env.NEXT_PUBLIC_AADS_300X250 ||
    process.env.NEXT_PUBLIC_AADS_300x250 ||
    '',
  sponsorInquiryUrl:
    process.env.NEXT_PUBLIC_SPONSOR_URL || 'https://aads.com',
};
