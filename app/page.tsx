'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Volume2, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { translations, SupportedLanguage } from '@/lib/translations';

export default function HomePage() {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Voice narration helper for low-literacy users
  const speakText = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const message = `${t.headline}. ${t.subline}.`;
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = t.speechCode;
    utterance.rate = 0.9;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col gap-6 py-2">
      {/* ---------------- 1. LANGUAGE SWITCHER AT THE TOP ---------------- */}
      <div className="bg-white rounded-2xl p-2 border-2 border-slate-200 shadow-sm flex items-center justify-between">
        <span className="text-xs font-black text-slate-500 uppercase tracking-wide pl-2">
          🌐 Language / भाषा:
        </span>
        <div className="flex gap-1">
          {(
            [
              { code: 'en', label: 'English' },
              { code: 'hi', label: 'हिन्दी' },
              { code: 'kn', label: 'ಕನ್ನಡ' },
            ] as const
          ).map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => {
                setLang(item.code);
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                lang === item.code
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ---------------- 2. HERO HEADLINE & SUBLINE ---------------- */}
      <div className="flex flex-col gap-3 pt-1">
        {/* Audio Speaker Button for Low-Literacy Users */}
        <div className="flex items-center gap-2">
          <button
            onClick={speakText}
            className={`px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition-all shadow-sm ${
              isSpeaking
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-orange-100 text-orange-800 hover:bg-orange-200 border border-orange-300'
            }`}
            title="Listen aloud"
          >
            <Volume2 className="w-4 h-4" />
            <span>{isSpeaking ? 'Playing audio...' : t.listenAudio}</span>
          </button>
        </div>

        {/* Big Headline */}
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.15]">
          {t.headline}
        </h1>

        {/* Subline */}
        <p className="text-base sm:text-lg font-bold text-slate-600 leading-snug">
          {t.subline}
        </p>
      </div>

      {/* ---------------- 3. TWO LARGE CALL-TO-ACTION BUTTONS ---------------- */}
      <div className="flex flex-col gap-3.5 pt-1">
        {/* BUTTON 1: "I'm a worker" -> /create */}
        <Link
          href="/create"
          className="group relative bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-3xl p-5 shadow-xl border-4 border-orange-300 active:scale-[0.98] transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white text-orange-600 flex items-center justify-center text-3xl shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
              👷
            </div>
            <div>
              <h2 className="text-2xl font-black leading-tight tracking-tight">
                {t.workerBtn}
              </h2>
              <p className="text-xs font-bold text-orange-100 mt-0.5">
                {t.workerSub}
              </p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* BUTTON 2: "I'm hiring" -> /find */}
        <Link
          href="/find"
          className="group relative bg-slate-900 hover:bg-slate-800 text-white rounded-3xl p-5 shadow-lg border-2 border-slate-700 active:scale-[0.98] transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 text-emerald-400 flex items-center justify-center text-3xl shadow-inner flex-shrink-0 group-hover:scale-105 transition-transform">
              💼
            </div>
            <div>
              <h2 className="text-2xl font-black leading-tight tracking-tight">
                {t.hiringBtn}
              </h2>
              <p className="text-xs font-semibold text-slate-300 mt-0.5">
                {t.hiringSub}
              </p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
            <ArrowRight className="w-6 h-6 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* ---------------- 4. 3-STEP "HOW IT WORKS" SECTION ---------------- */}
      <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-sm flex flex-col gap-4 mt-2">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <span>⚙️ {t.howItWorksTitle}</span>
          </h3>
          <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
            3 Simple Steps
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {t.steps.map((step, idx) => (
            <div
              key={`${lang}-step-${idx}`}
              className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200"
            >
              <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-xs flex-shrink-0">
                {step.icon}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-black text-slate-900 leading-tight">
                  {step.title}
                </h4>
                <p className="text-xs font-semibold text-slate-600 mt-0.5 leading-snug">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- 5. POPULAR TRADES SHORTCUTS ---------------- */}
      <div>
        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 px-1">
          {t.popularTrades}
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          <Link
            href="/create?trade=Plumber"
            className="bg-white border-2 border-slate-200 hover:border-orange-500 rounded-2xl p-3 flex items-center gap-2.5 shadow-xs active:bg-orange-50 transition-all"
          >
            <span className="text-2xl">🚰</span>
            <div>
              <p className="font-black text-slate-900 text-xs">{t.trades.plumber}</p>
              <p className="text-[10px] text-slate-400 font-bold">Plumber</p>
            </div>
          </Link>

          <Link
            href="/create?trade=Electrician"
            className="bg-white border-2 border-slate-200 hover:border-orange-500 rounded-2xl p-3 flex items-center gap-2.5 shadow-xs active:bg-orange-50 transition-all"
          >
            <span className="text-2xl">⚡</span>
            <div>
              <p className="font-black text-slate-900 text-xs">{t.trades.electrician}</p>
              <p className="text-[10px] text-slate-400 font-bold">Electrician</p>
            </div>
          </Link>

          <Link
            href="/create?trade=Mason"
            className="bg-white border-2 border-slate-200 hover:border-orange-500 rounded-2xl p-3 flex items-center gap-2.5 shadow-xs active:bg-orange-50 transition-all"
          >
            <span className="text-2xl">🧱</span>
            <div>
              <p className="font-black text-slate-900 text-xs">{t.trades.mason}</p>
              <p className="text-[10px] text-slate-400 font-bold">Mason</p>
            </div>
          </Link>

          <Link
            href="/create?trade=Carpenter"
            className="bg-white border-2 border-slate-200 hover:border-orange-500 rounded-2xl p-3 flex items-center gap-2.5 shadow-xs active:bg-orange-50 transition-all"
          >
            <span className="text-2xl">🪚</span>
            <div>
              <p className="font-black text-slate-900 text-xs">{t.trades.carpenter}</p>
              <p className="text-[10px] text-slate-400 font-bold">Carpenter</p>
            </div>
          </Link>
        </div>
      </div>

      {/* ---------------- 6. TRUST BADGE FOOTNOTE ---------------- */}
      <div className="text-center py-2 text-slate-400 text-xs flex items-center justify-center gap-1.5 font-bold">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>{t.trustBadge}</span>
      </div>
    </div>
  );
}
