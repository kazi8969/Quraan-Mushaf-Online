import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { QuranProvider } from '@/contexts/QuranContext';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'القرآن الكريم | Quran Sharif',
  description: 'Read the Holy Quran online in beautiful Mushaf format with Arabic text, translations, audio recitation, and search. Available in English and Bengali.',
  keywords: ['Quran', 'Quran Sharif', 'Holy Quran', 'Islamic', 'Arabic', 'Surah', 'Ayah', 'Mushaf', 'কুরআন'],
  manifest: '/manifest.json',
  themeColor: '#1a4731',
  viewport: 'width=device-width, initial-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Quran Sharif',
  },
  openGraph: {
    title: 'القرآن الكريم | Quran Sharif',
    description: 'Read the Holy Quran in beautiful Mushaf format',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Amiri:ital,wght@0,400;0,700;1,400&family=Lateef:wght@200;300;400;500;600;700;800&family=Scheherazade+New:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-inter antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QuranProvider>
            {children}
            <Toaster position="bottom-center" />
          </QuranProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
