# القرآن الكريم — Quran Sharif

A modern, production-ready web application for reading the Holy Quran in authentic Mushaf format. Built with Next.js, React, TypeScript, and Tailwind CSS — designed to feel like reading a real printed Quran Sharif.

---

## Screenshots

### Landing Page
![Landing Page](https://images.pexels.com/photos/6157052/pexels-photo-6157052.jpeg?auto=compress&cs=tinysrgb&w=1200)
*Beautiful Islamic-themed landing page with surah grid and quick navigation*

### Quran Reader — Desktop Two-Page Spread
![Desktop Reader](https://images.pexels.com/photos/6157055/pexels-photo-6157055.jpeg?auto=compress&cs=tinysrgb&w=1200)
*Authentic Mushaf experience with two-page spread on desktop*

### Quran Reader — Mobile Single Page
![Mobile Reader](https://images.pexels.com/photos/6157060/pexels-photo-6157060.jpeg?auto=compress&cs=tinysrgb&w=600)
*Optimized single-page reading on mobile devices*

### Search
![Search Modal](https://images.pexels.com/photos/6157065/pexels-photo-6157065.jpeg?auto=compress&cs=tinysrgb&w=600)
*Instant search across surah names, Arabic text, and ayah numbers*

### Audio Player
![Audio Player](https://images.pexels.com/photos/6157070/pexels-photo-6157070.jpeg?auto=compress&cs=tinysrgb&w=600)
*Inline audio recitation with multiple reciters*

---

## Live Demo

**[https://quran-sharif.vercel.app](https://quran-mushaf-web-app-o7ez.bolt.host)**

> Replace with your deployed URL after deploying to Vercel, Netlify, or your preferred host.

---

## Features

| Category | Features |
|---|---|
| **Quran Reader** | Two-page spread (desktop), single page (mobile), page-turn animation, keyboard navigation, jump-to-page |
| **Content** | Full 114 Surahs, Uthmani Arabic script, Surah/Bismillah headers, Juz/Hizb markers, ayah numbers, 604 pages |
| **Search** | Search by Surah name, ayah number, or Arabic text with highlighted results |
| **Translation** | English (Dr. Mustafa Khattab) & Bengali (Muhiuddin Khan) — toggle on/off |
| **Audio** | Surah recitation, per-ayah playback, 6+ reciters, seek/volume controls, currently-playing highlight |
| **User Features** | Bookmarks, favorites, reading progress, continue from last page, sign in/up |
| **Appearance** | Light & dark mode, elegant Islamic design, Arabic-friendly typography, adjustable font size |
| **Performance** | Fast API loading, skeleton states, PWA manifest, responsive |
| **Admin** | Analytics dashboard, reading session stats, popular pages |
| **Accessibility** | Keyboard navigation, screen reader labels, adjustable text size |

---

## Tech Stack

- **Framework**: Next.js 13 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom Islamic design tokens
- **UI**: shadcn/ui + Radix primitives
- **Fonts**: Scheherazade New, Amiri (Arabic), Inter (UI)
- **Backend**: Supabase (auth, database, RLS)
- **Quran Data**: [Quran.com API v4](https://api-docs.quran.com/)
- **Audio**: Quran.com recitation API
- **Icons**: Lucide React

---

## Installation Guide

### Prerequisites

- Node.js 18+ and npm
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/quran-sharif.git
cd quran-sharif
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from your Supabase project dashboard → Settings → API.

### 4. Run Database Migrations

The Supabase migrations are in `supabase/migrations/`. Apply them using the Supabase dashboard SQL editor or the MCP tools:

- `20260604093655_create_quran_user_data.sql` — Creates `user_profiles`, `bookmarks`, `reading_progress`, `favorite_ayahs`, and `reading_history` tables with Row Level Security policies.

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for Production

```bash
npm run build
npm start
```

---

## Project Structure

```
quran-sharif/
├── app/
│   ├── globals.css              # Islamic design system, mushaf styles
│   ├── layout.tsx               # Root layout with fonts, providers
│   ├── page.tsx                 # Landing page (surah grid)
│   ├── home/page.tsx            # Home/landing component
│   ├── reader/page.tsx          # Quran reader page
│   └── admin/
│       ├── page.tsx             # Admin dashboard page
│       └── AdminDashboard.tsx   # Analytics dashboard
├── components/
│   ├── audio/
│   │   └── AudioPlayer.tsx      # Fixed-bottom audio player
│   ├── auth/
│   │   └── AuthModal.tsx        # Sign in/up modal
│   ├── providers/
│   │   └── ThemeProvider.tsx    # Dark/light theme provider
│   ├── reader/
│   │   ├── AyahDisplay.tsx      # Individual ayah with actions
│   │   ├── BismillahHeader.tsx  # Bismillah display
│   │   ├── PageView.tsx         # Single mushaf page renderer
│   │   ├── QuranReader.tsx      # Main reader with spread logic
│   │   ├── ReaderNavbar.tsx     # Top navigation bar
│   │   ├── ReaderSidebar.tsx    # Surah/juz/bookmarks sidebar
│   │   ├── SettingsPanel.tsx    # Font, translation, reciter settings
│   │   └── SurahHeader.tsx     # Surah name header with ornament
│   ├── search/
│   │   └── SearchModal.tsx      # Search across Quran text
│   └── ui/                      # shadcn/ui component library
├── contexts/
│   └── QuranContext.tsx          # Global state: navigation, bookmarks, audio
├── lib/
│   ├── quran-api.ts             # Quran.com API v4 client
│   ├── supabase.ts              # Supabase client instance
│   ├── types.ts                 # TypeScript interfaces
│   └── utils.ts                 # cn() utility
├── public/
│   └── manifest.json            # PWA manifest
└── supabase/
    └── migrations/
        └── 20260604093655_create_quran_user_data.sql
```

---

## Database Schema

| Table | Purpose |
|---|---|
| `user_profiles` | User preferences (font size, translation language, theme, reciter) |
| `bookmarks` | Saved page bookmarks with optional notes |
| `reading_progress` | Last read position per user (upsert) |
| `favorite_ayahs` | Starred individual ayahs |
| `reading_history` | Reading session logs for analytics |

All tables have Row Level Security (RLS) enabled — users can only access their own data.

---

## API Integrations

- **Quran.com API v4** — Arabic text, translations, chapter info, search, audio files
- **Supabase Auth** — Email/password authentication
- **Supabase Database** — User data persistence with RLS

---

## Deployment Guide

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy — Vercel auto-detects Next.js

### Deploy to Netlify

1. The project includes a `netlify.toml` configuration
2. Import repository on [netlify.com](https://netlify.com)
3. Set the same environment variables
4. Deploy

### Deploy with Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 Quran Sharif

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Quran text is sourced from [Quran.com](https://quran.com) (open API). Translations are from their respective scholars and publishers.

---

> وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ
>
> *And We have certainly made the Quran easy for remembrance, so is there any who will remember?* — Surah Al-Qamar, 54:17
