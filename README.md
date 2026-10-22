# BitVidForge — Free In-Browser Video Compressor, Trimmer, GIF Maker & MP3 Studio

[**Live Web App: https://bitvidforge.vercel.app**](https://bitvidforge.vercel.app)

**BitVidForge** is a 100% client-side, privacy-first media compression studio powered by WebAssembly (`@ffmpeg/ffmpeg` v0.12 + SIMD). Shrink large `MP4`, `MOV`, and `WebM` videos to exact megabyte targets for **Discord (10MB Free / 50MB Nitro)**, **WhatsApp (16MB)**, **Slack**, **GitHub Pull Requests**, and **Email**—without ever uploading your files to a server.

---

## Direct In-Browser Tools

| Tool | Target / Mode | Live URL |
| :--- | :--- | :--- |
| **BitVidForge Main Studio** | All-in-one Video Compressor, Trimmer, GIF & MP3 Studio | [bitvidforge.vercel.app](https://bitvidforge.vercel.app/) |
| **Discord 10MB Video Compressor** | Pre-configured `9.5 MB` safe target for Discord Free (`<10MB`) | [bitvidforge.vercel.app/discord-video-compressor](https://bitvidforge.vercel.app/discord-video-compressor) |
| **WhatsApp 16MB Video Compressor** | Pre-configured `15.5 MB` target for WhatsApp media shares | [bitvidforge.vercel.app/whatsapp-video-compressor](https://bitvidforge.vercel.app/whatsapp-video-compressor) |
| **Convert MOV to MP4 in Browser** | Convert iPhone/macOS `.mov` recordings to universal H.264 `.mp4` | [bitvidforge.vercel.app/mov-to-mp4-converter](https://bitvidforge.vercel.app/mov-to-mp4-converter) |
| **Video to High-FPS GIF Maker** | 192-color adaptive `palettegen` + Lanczos looping GIFs | [bitvidforge.vercel.app/video-to-gif](https://bitvidforge.vercel.app/video-to-gif) |
| **Extract MP3 Audio from Video** | 1-click `192 kbps` stereo MP3 audio extraction (`-vn`) | [bitvidforge.vercel.app/extract-mp3-from-video](https://bitvidforge.vercel.app/extract-mp3-from-video) |
| **Mute Video / Remove Audio** | Strip audio tracks (`-an`) and boost video bitrate quality | [bitvidforge.vercel.app/mute-video-online](https://bitvidforge.vercel.app/mute-video-online) |
| **Slack & GitHub PR Compressor** | NDA-safe local screen recording compressor for remote teams | [bitvidforge.vercel.app/slack-video-compressor](https://bitvidforge.vercel.app/slack-video-compressor) |
| **Email Video Shrinker (<10MB)** | Compress recordings for Gmail, Outlook & Apple Mail | [bitvidforge.vercel.app/compress-video-for-email](https://bitvidforge.vercel.app/compress-video-for-email) |
| **YouTube to Discord 10MB Clipper** | Import permitted YouTube / Shorts links, trim & shrink `<10MB` | [bitvidforge.vercel.app/youtube-to-discord](https://bitvidforge.vercel.app/youtube-to-discord) |
| **YouTube to High-FPS GIF Maker** | Convert permitted YouTube clips into 192-color looping GIFs | [bitvidforge.vercel.app/youtube-to-gif](https://bitvidforge.vercel.app/youtube-to-gif) |
| **YouTube to 192kbps MP3 Extractor** | Extract stereo MP3 audio with start/end timestamp trimming | [bitvidforge.vercel.app/youtube-to-mp3](https://bitvidforge.vercel.app/youtube-to-mp3) |

---

## Standout Features

- **100% Client-Side WebAssembly (`@ffmpeg/ffmpeg`)**: Zero cloud uploads, zero server queues, no watermarks, no cookies, and a live network egress monitor verifying `0` outbound media requests.
- **Deterministic VBR Bitrate Targeting**: Automatically computes `videoBitrateKbps = ((Target_MB * 8192) / trimmedDurationSeconds) - audioBitrateKbps` so your file lands safely under the cap on the first pass.
- **Built-in Quick Video Trimmer**: Cut dead air from the start or end of your clip with live frame scrubbing—automatically reallocating 100% of the saved megabytes into higher video kbps for the remaining frames.
- **Interactive Split-Screen Wipe Comparison**: Inspect Original vs. Compressed video pixel-for-pixel with a synchronized before/after wipe slider or side-by-side players.
- **Clipboard Video Paste (`Ctrl+V` / `Cmd+V`) & Batch ZIP Export**: Paste clips directly from your clipboard or drop a batch of files and download them all as a single `.zip` archive.

---

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in any modern WebAssembly-capable browser.
