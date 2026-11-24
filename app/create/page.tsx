'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Phone,
  Briefcase,
  MapPin,
  Calendar,
  Languages,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { TradeType, SupportedLanguage } from '@/types/database';

interface TradeOption {
  value: TradeType;
  label: string;
  icon: string;
  sub: string;
}

const TRADES: TradeOption[] = [
  { value: 'Plumber', label: 'Plumber', icon: '🚰', sub: 'प्लंबर • ಪ್ಲಂಬರ್' },
  { value: 'Electrician', label: 'Electrician', icon: '⚡', sub: 'इलेक्ट्रीशियन • ಎಲೆಕ್ಟ್ರಿಷಿಯನ್' },
  { value: 'Mason', label: 'Mason', icon: '🧱', sub: 'राजमिस्त्री • ಮೇಸ್ತ್ರಿ' },
  { value: 'Carpenter', label: 'Carpenter', icon: '🪚', sub: 'बढ़ई • ಬಡಗಿ' },
  { value: 'Painter', label: 'Painter', icon: '🎨', sub: 'पेंटर • ಪೇಂಟರ್' },
  { value: 'Welder', label: 'Welder', icon: '👨‍🏭', sub: 'वेल्डर • ವೆಲ್ಡರ್' },
  { value: 'Mechanic', label: 'Mechanic', icon: '🔧', sub: 'मैकेनिक • ಮೆಕ್ಯಾನಿಕ್' },
];

function CreateWorkerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTrade = (searchParams.get('trade') as TradeType) || 'Plumber';

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [trade, setTrade] = useState<TradeType>(initialTrade);
  const [area, setArea] = useState('');
  const [experienceYears, setExperienceYears] = useState<number>(3);
  const [language, setLanguage] = useState<SupportedLanguage>('hi-IN');

  // UI & Validation State
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTradeDropdownOpen, setIsTradeDropdownOpen] = useState(false);

  // Clean phone number helper
  const getCleanPhone = (val: string) => {
    return val.replace(/\D/g, '').replace(/^91/, '').replace(/^0/, '');
  };

  const cleanPhone = getCleanPhone(phone);
  // Indian 10-digit mobile number validator: starts with 6, 7, 8, or 9 and has exactly 10 digits
  const isPhoneValid = /^[6-9]\d{9}$/.test(cleanPhone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Validate Name
    if (!name.trim()) {
      setErrorMsg('Please enter your full name (कृपया अपना नाम लिखें)');
      return;
    }

    // 2. Validate Indian Mobile Number (10 digits, starts with 6-9)
    if (!isPhoneValid) {
      setErrorMsg(
        'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9 (वैध 10 अंकों का मोबाइल नंबर दर्ज करें)'
      );
      return;
    }

    // 3. Validate Area
    if (!area.trim()) {
      setErrorMsg('Please enter your area or city (कृपया अपना इलाका या शहर लिखें)');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save worker to Supabase 'workers' table
      const { data, error } = await supabase
        .from('workers')
        .upsert(
          {
            name: name.trim(),
            phone: cleanPhone,
            trade,
            language,
            area: area.trim(),
            experience_years: Math.max(0, Number(experienceYears)),
          },
          { onConflict: 'phone' }
        )
        .select()
        .single();

      if (error && !data) {
        console.warn('Supabase upsert warning:', error.message);
        // If Supabase table isn't created yet or network issues in demo, generate local ID
        const fallbackWorkerId = 'worker-' + Date.now();
        // Save in localStorage for demo continuity
        if (typeof window !== 'undefined') {
          localStorage.setItem(
            `hunar_worker_${fallbackWorkerId}`,
            JSON.stringify({
              id: fallbackWorkerId,
              name: name.trim(),
              phone: cleanPhone,
              trade,
              language,
              area: area.trim(),
              experience_years: experienceYears,
            })
          );
        }
        router.push(`/interview/${fallbackWorkerId}`);
        return;
      }

      const workerId = data.id;
      // Navigate to the interview page for this worker
      router.push(`/interview/${workerId}`);
    } catch (err: any) {
      console.error('Error creating worker:', err);
      // Fallback redirect for hackathon robustness
      const fallbackWorkerId = 'worker-' + Date.now();
      router.push(`/interview/${fallbackWorkerId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTradeObj =
    TRADES.find((t) => t.value === trade) || TRADES[0];

  return (
    <div className="flex flex-col gap-5 py-2 max-w-md mx-auto w-full">
      {/* Top Breadcrumb & Step Heading */}
      <div className="flex items-center justify-between px-1">
        <Link
          href="/"
          className="text-xs font-black text-slate-500 hover:text-slate-900 flex items-center gap-1"
        >
          <span>← Back (वापस)</span>
        </Link>
        <span className="text-[11px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
          Step 1 of 2: Profile
        </span>
      </div>

      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl border-2 border-slate-200 flex flex-col gap-5">
        {/* Header */}
        <div>
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center text-2xl mb-2 font-black shadow-xs">
            👷
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
            Create Your Skill Pass
          </h1>
          <p className="text-sm font-bold text-orange-600 mt-0.5">
            अपनी जानकारी दर्ज करें • ನಿಮ್ಮ ವಿವರ ದಾಖಲಿಸಿ
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs font-bold animate-in fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* 1. Full Name */}
          <div>
            <label className="text-xs font-black uppercase text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-orange-600" />
              <span>Full Name (पूरा नाम) *</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-4 py-3.5 text-base font-bold rounded-2xl border-2 border-slate-300 focus:border-orange-600 focus:ring-4 focus:ring-orange-100 outline-none transition-all placeholder:text-slate-400 text-slate-900"
            />
          </div>

          {/* 2. Indian Mobile Number (10 Digits) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-orange-600" />
                <span>Mobile Number (मोबाइल नंबर) *</span>
              </label>
              {cleanPhone.length > 0 && (
                <span
                  className={`text-[11px] font-black flex items-center gap-1 ${
                    isPhoneValid ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  {isPhoneValid ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Valid 10 Digits
                    </>
                  ) : (
                    `${cleanPhone.length}/10 digits`
                  )}
                </span>
              )}
            </div>

            <div className="relative flex items-center">
              <div className="absolute left-3.5 bg-slate-100 px-2.5 py-1 rounded-xl text-xs font-black text-slate-600 border border-slate-200 select-none">
                🇮🇳 +91
              </div>
              <input
                type="tel"
                required
                maxLength={14}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98765 43210"
                className={`w-full pl-24 pr-4 py-3.5 text-base font-bold rounded-2xl border-2 outline-none transition-all placeholder:text-slate-400 text-slate-900 ${
                  cleanPhone.length === 10
                    ? isPhoneValid
                      ? 'border-emerald-500 focus:ring-4 focus:ring-emerald-100'
                      : 'border-red-500 focus:ring-4 focus:ring-red-100'
                    : 'border-slate-300 focus:border-orange-600 focus:ring-4 focus:ring-orange-100'
                }`}
              />
            </div>
            <p className="text-[11px] text-slate-500 font-semibold mt-1 pl-1">
              Used to prevent duplicate vouches and connect with direct employers.
            </p>
          </div>

          {/* 3. Trade Dropdown with Big Icons */}
          <div>
            <label className="text-xs font-black uppercase text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-orange-600" />
              <span>Trade / Profession (काम) *</span>
            </label>

            {/* Selected Trade Button (Opens Custom Dropdown) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTradeDropdownOpen(!isTradeDropdownOpen)}
                className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-300 hover:border-orange-500 rounded-2xl flex items-center justify-between text-left transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedTradeObj.icon}</span>
                  <div>
                    <p className="text-base font-black text-slate-900 leading-tight">
                      {selectedTradeObj.label}
                    </p>
                    <p className="text-xs font-bold text-slate-500">
                      {selectedTradeObj.sub}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs">
                  <span>Change</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      isTradeDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Dropdown Menu with Big Icons for all 7 Trades */}
              {isTradeDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-orange-300 rounded-3xl shadow-2xl p-2 z-30 max-h-72 overflow-y-auto flex flex-col gap-1.5 animate-in fade-in zoom-in-95">
                  {TRADES.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        setTrade(item.value);
                        setIsTradeDropdownOpen(false);
                      }}
                      className={`p-3 rounded-2xl flex items-center justify-between text-left transition-all ${
                        trade === item.value
                          ? 'bg-orange-50 border-2 border-orange-500 text-orange-950 font-black'
                          : 'hover:bg-slate-50 border border-transparent text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <p className="text-sm font-black">{item.label}</p>
                          <p className="text-[11px] text-slate-500 font-semibold">
                            {item.sub}
                          </p>
                        </div>
                      </div>
                      {trade === item.value && (
                        <CheckCircle2 className="w-5 h-5 text-orange-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 4. Area / Locality */}
          <div>
            <label className="text-xs font-black uppercase text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-orange-600" />
              <span>Area / Locality (इलाका / शहर) *</span>
            </label>
            <input
              type="text"
              required
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Koramangala, Bengaluru"
              className="w-full px-4 py-3.5 text-base font-bold rounded-2xl border-2 border-slate-300 focus:border-orange-600 focus:ring-4 focus:ring-orange-100 outline-none transition-all placeholder:text-slate-400 text-slate-900"
            />
          </div>

          {/* 5. Years of Experience */}
          <div>
            <label className="text-xs font-black uppercase text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-orange-600" />
              <span>Years of Experience (काम का अनुभव)</span>
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setExperienceYears((prev) => Math.max(0, prev - 1))}
                className="w-14 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-2xl font-black flex items-center justify-center active:scale-95 transition-all border border-slate-300"
              >
                -
              </button>

              <div className="flex-1 text-center bg-slate-50 py-3 rounded-2xl border-2 border-slate-300">
                <span className="text-2xl font-black text-slate-900">
                  {experienceYears}
                </span>
                <span className="text-xs font-bold text-slate-500 block">
                  {experienceYears === 1 ? 'Year (साल)' : 'Years (साल / ವರ್ಷ)'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setExperienceYears((prev) => Math.min(45, prev + 1))}
                className="w-14 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-2xl font-black flex items-center justify-center active:scale-95 transition-all border border-slate-300"
              >
                +
              </button>
            </div>
          </div>

          {/* 6. Preferred Spoken Language */}
          <div>
            <label className="text-xs font-black uppercase text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-orange-600" />
              <span>Interview Language (बोलने की भाषा) *</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'hi-IN', label: 'हिन्दी', sub: 'Hindi' },
                { code: 'kn-IN', label: 'ಕನ್ನಡ', sub: 'Kannada' },
                { code: 'en-IN', label: 'English', sub: 'India' },
              ].map((langItem) => (
                <button
                  key={langItem.code}
                  type="button"
                  onClick={() => setLanguage(langItem.code as SupportedLanguage)}
                  className={`p-3 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center ${
                    language === langItem.code
                      ? 'border-orange-600 bg-orange-50 text-orange-950 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm font-black">{langItem.label}</span>
                  <span className="text-[10px] text-slate-500 font-bold">
                    {langItem.sub}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 font-semibold mt-1 pl-1">
              The AI interviewer will ask questions in this language.
            </p>
          </div>

          {/* 7. Large Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-3 py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-lg rounded-2xl shadow-xl border-2 border-orange-300 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Saving details...</span>
            ) : (
              <>
                <span>Continue to Voice Interview</span>
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CreateWorkerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-amber-50/40 p-4 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-slate-700 font-bold text-sm">Loading registration...</p>
        </div>
      }
    >
      <CreateWorkerForm />
    </Suspense>
  );
}
