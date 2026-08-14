import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ModelProvider } from '../lib/ModelContext';

export const metadata: Metadata = {
  title: 'VeritasAI — Political Truthfulness NLP Research Studio',
  description:
    'CSE440 Natural Language Processing II Lab Project. Classifying political statement truthfulness using LIAR-PLUS dataset across 11 classical and neural model architectures.',
};

export const viewport: Viewport = {
  themeColor: '#0B0F17',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Outfit:wght@500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,700;1,6..72,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0B0F17] text-[#F8FAFC] min-h-screen font-sans antialiased selection:bg-[#6366F1] selection:text-white">
        <ModelProvider>{children}</ModelProvider>
      </body>
    </html>
  );
}
