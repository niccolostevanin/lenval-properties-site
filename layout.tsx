import type { Metadata } from 'next';
import FluidCursor from '@/components/FluidCursor';
import './globals.css';

/* ─── Metadata ───────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: 'Lenval Properties - Creators of Refined Living & Iconic Spaces',
  description:
    'Boutique residential developments in Abu Dhabi, built with intention and designed to endure.',
  openGraph: {
    title: 'Lenval Properties - Creators of Refined Living & Iconic Spaces',
    description:
      'Boutique residential developments in Abu Dhabi, built with intention and designed to endure.',
    images: [
      {
        url: '/images/69e6158756a7bf881655ccc8_open-graph.webp',
        width: 1200,
        height: 630,
        alt: 'Lenval Properties',
      },
    ],
    type: 'website',
  },
  metadataBase: new URL('https://lenvalproperties.com'),
};

/* ─── Root Layout ────────────────────────────────────────────── */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Calculate scrollbar width and set CSS custom property */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var sw = window.innerWidth - document.documentElement.clientWidth;
                document.documentElement.style.setProperty('--scrollbar-width', sw + 'px');
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">
        {/* Barba-compatible wrapper for page transitions */}
        <div data-barba="wrapper">
          {children}
        </div>

        {/* Custom fluid cursor — desktop only */}
        <FluidCursor />
      </body>
    </html>
  );
}
