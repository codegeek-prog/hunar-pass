'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  Phone,
  Briefcase,
  HeartHandshake,
  Sparkles,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { RelationshipType, Worker, TradeType } from '@/types/database';

const TRADE_ICONS: Record<string, string> = {
  Plumber: '🚰',
  Electrician: '⚡',
  Mason: '🧱',
  Carpenter: '🪚',
  Painter: '🎨',
  Welder: '👨‍🏭',
  Mechanic: '🔧',
};

export default function VouchWorkerPage() {
  const params = useParams();
  const router = useRouter();
  const workerId = params?.workerId as string;

  // Worker Info State
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isLoadingWorker, setIsLoadingWorker] = useState(true);

  // Form State
  const [voucherName, setVoucherName] = useState('');
  const [voucherPhone, setVoucherPhone] = useState('');
  const [relationship, setRelationship] = useState<RelationshipType>('customer');
  const [jobMonth, setJobMonth] = useState(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  });
  const [wouldHireAgain, setWouldHireAgain] = useState<boolean>(true);
  const [comment, setComment] = useState('Punctual, honest, and high-quality work! 👍');

  // Submission & Validation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // 1. Fetch Worker Details (No login or signup required)
  useEffect(() => {
    async function loadWorker() {
      if (!workerId || workerId === 'demo') {
        setWorker({
          id: 'demo',
          name: 'Ramesh Kumar',
          phone: '9876543210',
          trade: 'Plumber',
          language: 'hi-IN',
          area: 'Bengaluru',
          experience_years: 7,
          created_at: '',
        });
        setIsLoadingWorker(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('workers')
          .select('*')
          .eq('id', workerId)
          .single();

        if (data) {
          setWorker(data);
          setIsLoadingWorker(false);
          return;
        }
      } catch (e) {
        console.warn('Supabase fetch error, checking local store:', e);
      }

      // Local storage fallback for offline demo continuity
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(`hunar_worker_${workerId}`);
        if (cached) {
          try {
            setWorker(JSON.parse(cached));
            setIsLoadingWorker(false);
            return;
          } catch (err) {}
        }
      }

      // Demo fallback
      setWorker({
        id: workerId,
        name: 'Sunita Devi',
        phone: '9811223344',
        trade: 'Electrician',
        language: 'hi-IN',
        area: 'Noida Sector 62',
        experience_years: 4,
        created_at: '',
      });
      setIsLoadingWorker(false);
    }

    loadWorker();
  }, [workerId]);

  // Clean phone number: strip non-digits, leading +91 or 0
  const cleanVoucherPhone = voucherPhone.replace(/\D/g, '').replace(/^91/, '').replace(/^0/, '');
  const isPhoneValid = /^[6-9]\d{9}$/.test(cleanVoucherPhone);

  // 2. Submit Vouch & Enforce Constraints
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate Name
    if (!voucherName.trim()) {
      setErrorMessage('Please enter your full name (कृपया अपना नाम दर्ज करें)');
      return;
    }

    // Validate Indian Phone Number (10 digits starting with 6-9)
    if (!isPhoneValid) {
      setErrorMessage(
        'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9 (वैध 10 अंकों का मोबाइल नंबर दर्ज करें)'
      );
      return;
    }

    // RULE 1 (Self-Vouch Check): Worker cannot vouch for themselves
    if (worker) {
      const workerPhoneClean = worker.phone.replace(/\D/g, '').replace(/^91/, '').replace(/^0/, '');
      if (cleanVoucherPhone === workerPhoneClean) {
        setErrorMessage(
          'Self-vouching is not permitted: You cannot vouch for your own profile! (आप खुद की सिफ़ारिश नहीं कर सकते)'
        );
        return;
      }
    }

    setIsSubmitting(true);

    // Convert YYYY-MM to full date YYYY-MM-01
    const jobDate = `${jobMonth}-01`;

    try {
      const newVouchObj = {
        id: 'vouch-' + Date.now(),
        worker_id: workerId,
        voucher_name: voucherName.trim(),
        voucher_phone: cleanVoucherPhone,
        relationship,
        job_date: jobDate,
        would_hire_again: wouldHireAgain,
        comment: comment.trim() || null,
        created_at: new Date().toISOString(),
      };

      if (workerId === 'demo' || workerId.startsWith('worker-')) {
        // Enforce duplicate check in local demo state
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem(`hunar_vouches_${workerId}`);
          const list = stored ? JSON.parse(stored) : [];
          if (list.some((v: any) => v.voucher_phone === cleanVoucherPhone)) {
            setErrorMessage(
              'Duplicate vouch: You have already vouched for this worker with this mobile number! (आप पहले ही इस नंबर से सिफ़ारिश कर चुके हैं)'
            );
            setIsSubmitting(false);
            return;
          }
          list.unshift(newVouchObj);
          localStorage.setItem(`hunar_vouches_${workerId}`, JSON.stringify(list));
        }
        setIsSuccess(true);
        return;
      }

      // Insert into Supabase 'vouches' table
      const { error } = await supabase.from('vouches').insert({
        worker_id: workerId,
        voucher_name: voucherName.trim(),
        voucher_phone: cleanVoucherPhone,
        relationship,
        job_date: jobDate,
        would_hire_again: wouldHireAgain,
        comment: comment.trim() || null,
      });

      if (error) {
        // RULE 2 (Duplicate Vouch Constraint): unique_worker_voucher
        if (
          error.code === '23505' ||
          error.message.includes('unique_worker_voucher') ||
          error.message.includes('duplicate key')
        ) {
          setErrorMessage(
            'Duplicate vouch: You have already vouched for this worker with this mobile number! (आप पहले ही इस नंबर से सिफ़ारिश कर चुके हैं)'
          );
        } else if (error.message.includes('A worker cannot vouch for their own profile')) {
          setErrorMessage(
            'Self-vouch blocked: A worker cannot vouch for their own profile (डेटाबेस नियम: खुद की सिफ़ारिश वर्जित है).'
          );
        } else {
          setErrorMessage(error.message);
        }
        setIsSubmitting(false);
        return;
      }

      // Keep offline cache synced
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem(`hunar_vouches_${workerId}`);
          const list = stored ? JSON.parse(stored) : [];
          list.unshift(newVouchObj);
          localStorage.setItem(`hunar_vouches_${workerId}`, JSON.stringify(list));
        } catch (e) {}
      }

      setIsSuccess(true);
    } catch (err: any) {
      console.error('Error saving vouch:', err);
      setErrorMessage(err?.message || 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isLoadingWorker) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="font-bold text-slate-600 text-sm">Loading endorsement form...</p>
      </div>
    );
  }

  const workerTrade = (worker?.trade || 'Plumber') as TradeType;
  const workerIcon = TRADE_ICONS[workerTrade] || '🔧';

  return (
    <div className="flex flex-col gap-4 py-2 max-w-md mx-auto w-full">
      {/* Top Navigation */}
      <Link
        href={`/w/${workerId}`}
        className="flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-slate-900 px-1"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Passport (पासपोर्ट देखें)</span>
      </Link>

      {/* ========================================================================= */}
      {/* THANK YOU SCREEN                                                          */}
      {/* ========================================================================= */}
      {isSuccess ? (
        <div className="bg-white rounded-3xl p-8 shadow-2xl border-4 border-emerald-400 flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95 my-4">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl font-black shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Vouch Recorded • सिफ़ारिश दर्ज हुई
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2 leading-tight">
              Thank You, {voucherName.split(' ')[0]}!
            </h2>
            <p className="text-sm font-bold text-emerald-700 mt-1">
              आपका बहुत-बहुत धन्यवाद!
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 leading-relaxed text-left">
            <p className="flex items-center gap-1.5 text-slate-900 font-black mb-1">
              <span>🤝</span>
              <span>Your trust empowers {worker?.name}:</span>
            </p>
            Your endorsement is now permanently recorded on their digital skill passport. It helps homeowners and contractors hire them directly with trust and fair wages.
          </div>

          <Link
            href={`/w/${workerId}`}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-xl active:scale-95 transition-all text-center"
          >
            View {worker?.name.split(' ')[0]}'s Verified Passport ➔
          </Link>
        </div>
      ) : (
        /* ========================================================================= */
        /* VOUCHING FORM (NO SIGNUP)                                                 */
        /* ========================================================================= */
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl border-2 border-emerald-300 flex flex-col gap-4">
          {/* Header Banner with Worker's Name & Trade */}
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white text-emerald-700 shadow-sm flex items-center justify-center text-3xl font-black border border-emerald-200 flex-shrink-0">
              {workerIcon}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider block">
                1-Tap Endorsement (बिना लॉगिन)
              </span>
              <h1 className="text-lg font-black text-slate-900 leading-tight">
                Vouch for {worker?.name}
              </h1>
              <p className="text-xs font-bold text-emerald-700">
                {worker?.trade} • {worker?.area}
              </p>
            </div>
          </div>

          {/* Error Alert Box */}
          {errorMessage && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 p-3 rounded-2xl flex items-start gap-2.5 text-xs font-bold animate-in fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* 1. Voucher Name */}
            <div>
              <label className="text-xs font-black uppercase text-slate-700 block mb-1 flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600" />
                <span>Your Name (आपका नाम) *</span>
              </label>
              <input
                type="text"
                required
                value={voucherName}
                onChange={(e) => setVoucherName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-4 py-3 text-sm font-bold rounded-2xl border-2 border-slate-300 focus:border-emerald-600 outline-none transition-all placeholder:text-slate-400 text-slate-900"
              />
            </div>

            {/* 2. Voucher Phone Number (10 Digits) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>Your Mobile Number (मोबाइल नंबर) *</span>
                </label>
                {cleanVoucherPhone.length > 0 && (
                  <span
                    className={`text-[11px] font-black ${
                      isPhoneValid ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    {isPhoneValid ? '✓ 10 Digits' : `${cleanVoucherPhone.length}/10`}
                  </span>
                )}
              </div>

              <div className="relative flex items-center">
                <span className="absolute left-3 bg-slate-100 px-2 py-0.5 rounded-lg text-xs font-black text-slate-600 border border-slate-200 select-none">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={14}
                  value={voucherPhone}
                  onChange={(e) => setVoucherPhone(e.target.value)}
                  placeholder="98765 43210"
                  className={`w-full pl-20 pr-4 py-3 text-sm font-bold rounded-2xl border-2 outline-none transition-all text-slate-900 ${
                    cleanVoucherPhone.length === 10
                      ? isPhoneValid
                        ? 'border-emerald-500'
                        : 'border-red-500'
                      : 'border-slate-300 focus:border-emerald-600'
                  }`}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-bold mt-1 pl-1">
                🔒 Enforces honest trust. You cannot vouch for your own profile or vouch twice.
              </p>
            </div>

            {/* 3. Relationship Selector (Customer, Co-Worker, Employer) */}
            <div>
              <label className="text-xs font-black uppercase text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                <span>How do you know them? (संबंध) *</span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'customer', label: 'Customer', sub: 'ग्राहक', icon: '🏡' },
                  { id: 'co-worker', label: 'Co-Worker', sub: 'साथी', icon: '🤝' },
                  { id: 'employer', label: 'Employer', sub: 'ठेकेदार', icon: '🏗️' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRelationship(item.id as RelationshipType)}
                    className={`p-3 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                      relationship === item.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-black shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-xs font-black">{item.label}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{item.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Month of the Job */}
            <div>
              <label className="text-xs font-black uppercase text-slate-700 block mb-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Month of the Job (काम का महीना) *</span>
              </label>
              <input
                type="month"
                required
                value={jobMonth}
                onChange={(e) => setJobMonth(e.target.value)}
                className="w-full px-4 py-2.5 text-sm font-bold rounded-2xl border-2 border-slate-300 focus:border-emerald-600 outline-none text-slate-900 bg-white"
              />
            </div>

            {/* 5. One-Tap Question: "Would you hire this person again?" (Yes / No) */}
            <div className="bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl p-4 flex flex-col gap-2.5">
              <label className="text-xs font-black text-slate-900 block leading-tight">
                Would you hire this person again?
                <span className="block text-[11px] text-emerald-800 font-bold mt-0.5">
                  क्या आप इन्हें दोबारा काम पर रखेंगे? *
                </span>
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setWouldHireAgain(true)}
                  className={`py-3 px-3 rounded-2xl border-2 font-black text-xs flex items-center justify-center gap-2 transition-all ${
                    wouldHireAgain === true
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-md'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Yes, absolutely! (हाँ)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWouldHireAgain(false)}
                  className={`py-3 px-3 rounded-2xl border-2 font-black text-xs flex items-center justify-center gap-2 transition-all ${
                    wouldHireAgain === false
                      ? 'border-red-600 bg-red-600 text-white shadow-md'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span>No (नहीं)</span>
                </button>
              </div>
            </div>

            {/* 6. Optional Short Comment */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-black uppercase text-slate-700">
                  Short Comment (राय / टिप्पणी)
                </label>
                <span className="text-[10px] text-slate-400 font-bold">Optional</span>
              </div>

              {/* Quick Preset Chips */}
              <div className="flex flex-wrap gap-1 mb-2">
                {[
                  'Punctual and honest work! 👍',
                  'Clean and quick repair! ⚡',
                  'Fair pricing & polite behavior! 🤝',
                  'Highly skilled professional! ⭐',
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setComment(chip)}
                    className="text-[10px] font-bold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 px-2.5 py-1 rounded-xl border border-slate-200 active:scale-95 transition-all text-slate-700"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a few words about their work quality..."
                className="w-full px-3 py-2 text-xs font-bold rounded-2xl border-2 border-slate-300 focus:border-emerald-600 outline-none resize-none text-slate-900"
              />
            </div>

            {/* 7. Large Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Recording Vouch...</span>
              ) : (
                <>
                  <ThumbsUp className="w-5 h-5" />
                  <span>Submit Vouch (सिफ़ारिश भेजें)</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
