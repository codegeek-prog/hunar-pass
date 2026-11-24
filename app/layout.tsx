import type { Metadata, Viewport } from 'next';
import './globals.css';
import Link from 'next/link';
import { Award, Briefcase } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Hunar Pass | Your skill deserves proof',
  description: 'Voice-first skill passport for blue-collar workers in India. Get verified, earn trust, and find better jobs.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased flex flex-col min-h-screen bg-slate-50 text-slate-900">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100 shadow-xs px-4 py-3">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-md font-black">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">
                  Hunar Pass
                </h1>
                <p className="text-[10px] font-bold text-orange-600 tracking-wide mt-0.5">
                  हुनर पास • ಹುನರ್ ಪಾಸ್
                </p>
              </div>
            </Link>

            <Link
              href="/find"
              className="px-3 py-1.5 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-orange-200 shadow-xs"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Hiring (काम)</span>
            </Link>
          </div>
        </header>

        {/* Mobile-First Main Content Container */}
        <main className="flex-1 max-w-md w-full mx-auto px-3 sm:px-4 py-3 flex flex-col">
          {children}
        </main>

        {/* AI Estimation Disclaimer Note */}
        <div className="bg-slate-100 border-t border-slate-200 px-3 py-2 text-center text-[10px] text-slate-500 font-semibold leading-tight">
          ⚠️ Skill levels and wage ranges are AI estimates and not official certification.
        </div>

        {/* Bottom Quick Navigation */}
        <footer className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-6 shadow-lg z-30">
          <div className="max-w-md mx-auto flex justify-around items-center">
            <Link href="/" className="flex flex-col items-center gap-1 text-slate-600 hover:text-orange-600">
              <span className="text-xl">🏠</span>
              <span className="text-[10px] font-black">Home</span>
            </Link>
            <Link href="/create" className="flex flex-col items-center gap-1 text-orange-600 font-extrabold">
              <div className="w-10 h-10 -mt-5 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
                <span className="text-lg">🎙️</span>
              </div>
              <span className="text-[10px] font-black">I'm a Worker</span>
            </Link>
            <Link href="/find" className="flex flex-col items-center gap-1 text-slate-600 hover:text-orange-600">
              <span className="text-xl">💼</span>
              <span className="text-[10px] font-black">I'm Hiring</span>
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
