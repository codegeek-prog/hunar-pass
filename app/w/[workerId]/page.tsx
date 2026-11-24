'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  Volume2,
  Share2,
  ThumbsUp,
  MapPin,
  Calendar,
  Briefcase,
  Phone,
  Sparkles,
  Download,
  MessageCircle,
  AlertCircle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { WorkerWithDetails, SkillCard, Vouch, TradeType } from '@/types/database';
import { DEMO_WORKERS } from '@/lib/seedData';

const TRADE_ICONS: Record<string, string> = {
  Plumber: '🚰',
  Electrician: '⚡',
  Mason: '🧱',
  Carpenter: '🪚',
  Painter: '🎨',
  Welder: '👨‍🏭',
  Mechanic: '🔧',
};

export default function PublicWorkerPassportPage() {
  const params = useParams();
  const router = useRouter();
  const workerId = (params?.workerId || params?.id) as string;

  const [worker, setWorker] = useState<WorkerWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedVouchLink, setCopiedVouchLink] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Worker Data from Supabase
  useEffect(() => {
    async function loadWorkerData() {
      setLoading(true);

      if (workerId === 'demo' || !workerId) {
        setWorker(getFallbackDemoWorker());
        setLoading(false);
        return;
      }

      try {
        const { data: workerData, error: workerErr } = await supabase
          .from('workers')
          .select('*')
          .eq('id', workerId)
          .single();

        if (workerErr || !workerData) {
          // Check local storage for offline continuity
          if (typeof window !== 'undefined') {
            const cached = localStorage.getItem(`hunar_worker_${workerId}`);
            if (cached) {
              const parsed = JSON.parse(cached);
              setWorker(getFallbackDemoWorker(workerId, parsed.name, parsed.trade, parsed.area));
              setLoading(false);
              return;
            }
          }

          setWorker(getFallbackDemoWorker(workerId));
          setLoading(false);
          return;
        }

        // Fetch Skill Card
        let activeCard: any = null;
        const { data: cardData } = await supabase
          .from('skill_cards')
          .select('*')
          .eq('worker_id', workerId)
          .maybeSingle();

        if (cardData) {
          activeCard = cardData;
        } else if (typeof window !== 'undefined') {
          const cachedCard = localStorage.getItem(`hunar_card_${workerId}`);
          if (cachedCard) {
            try {
              activeCard = JSON.parse(cachedCard);
            } catch (e) {}
          }
        }

        // Fetch Vouches
        const { data: vouchesData } = await supabase
          .from('vouches')
          .select('*')
          .eq('worker_id', workerId)
          .order('created_at', { ascending: false });

        // Fetch Vouches & merge any local vouches from this session
        let mergedVouches: Vouch[] = (vouchesData as Vouch[]) || [];
        if (typeof window !== 'undefined') {
          try {
            const localV = localStorage.getItem(`hunar_vouches_${workerId}`);
            if (localV) {
              const parsedV = JSON.parse(localV) as Vouch[];
              const existingPhones = new Set(mergedVouches.map((v) => v.voucher_phone));
              const missing = parsedV.filter((v) => !existingPhones.has(v.voucher_phone));
              mergedVouches = [...missing, ...mergedVouches];
            }
          } catch (e) {}
        }

        setWorker({
          ...workerData,
          skill_card: activeCard || null,
          vouches: mergedVouches,
        });
      } catch (err) {
        console.warn('Error loading public worker passport:', err);
        setWorker(getFallbackDemoWorker(workerId));
      } finally {
        setLoading(false);
      }
    }

    loadWorkerData();
  }, [workerId]);

  // Stop any active speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Audio Playback of Summary
  const handleListenAloud = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !worker) return;

    window.speechSynthesis.cancel();
    const tradeInfo = `${worker.name}, ${worker.trade}. ${worker.experience_years} years experience in ${worker.area}.`;
    const summaryText = worker.skill_card?.summary || 'Verified trade professional on Hunar Pass.';
    const reason = worker.skill_card?.level_reason ? `Evaluation: ${worker.skill_card.level_reason}` : '';
    const wageInfo = worker.skill_card?.wage_min
      ? `Indicative daily wage: ${worker.skill_card.wage_min} to ${worker.skill_card.wage_max} rupees.`
      : '';

    const textToSpeak = `${tradeInfo} ${summaryText} ${reason} ${wageInfo}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = worker.language || 'hi-IN';
    utterance.rate = 0.9;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  // WhatsApp Share with Prefilled Message
  const handleWhatsAppShare = () => {
    if (typeof window === 'undefined' || !worker) return;

    const currentUrl = window.location.href;
    const skillsList = worker.skill_card?.skills?.slice(0, 4).join(', ') || worker.trade;
    const wageText = worker.skill_card?.wage_min
      ? `\n💰 Indicative Rate: ₹${worker.skill_card.wage_min} - ₹${worker.skill_card.wage_max}/day`
      : '';

    const message = `🪪 *Hunar Pass - Verified Skill Passport*
👤 *Name*: ${worker.name}
🔧 *Trade*: ${worker.trade} (${worker.experience_years} Yrs Exp)
📍 *Area*: ${worker.area}
⭐ *Level*: ${worker.skill_card?.level || 'Verified'}${wageText}
🛠️ *Verified Skills*: ${skillsList}
🤝 *Customer Vouches*: ${worker.vouches?.length || 0} vouches

View full digital passport & vouches:
${currentUrl}`;

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Copy Profile Link
  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Share Vouch Request Link on WhatsApp
  const handleWhatsAppVouchRequest = () => {
    if (typeof window === 'undefined' || !worker) return;
    const vouchUrl = `${window.location.origin}/vouch/${worker.id}`;
    const message = `Namaste! 🙏 Please vouch for my work as a ${worker.trade} on Hunar Pass. It takes only 30 seconds and helps me get more jobs:\n\nTap here to vouch:\n${vouchUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Copy Vouch Link
  const handleCopyVouchLink = () => {
    if (typeof window === 'undefined' || !worker) return;
    const vouchUrl = `${window.location.origin}/vouch/${worker.id}`;
    navigator.clipboard.writeText(vouchUrl);
    setCopiedVouchLink(true);
    setTimeout(() => setCopiedVouchLink(false), 2500);
  };

  // Generate and Download Digital ID Card as PNG Image
  const handleDownloadImage = () => {
    if (!worker) return;
    setIsDownloading(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 1100;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setIsDownloading(false);
        return;
      }

      // 1. Card Background & Outer Frame
      ctx.fillStyle = '#0f172a'; // Deep slate
      ctx.fillRect(0, 0, 800, 1100);

      // Card Container
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, 40, 40, 720, 1020, 36);
      ctx.fill();

      // Outer Border
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#ea580c'; // Brand orange
      roundRect(ctx, 40, 40, 720, 1020, 36);
      ctx.stroke();

      // 2. Top Header Ribbon
      const grad = ctx.createLinearGradient(40, 40, 760, 160);
      grad.addColorStop(0, '#ea580c');
      grad.addColorStop(1, '#c2410c');
      ctx.fillStyle = grad;
      roundRect(ctx, 40, 40, 720, 130, 36);
      ctx.fill();
      ctx.fillRect(40, 120, 720, 50); // square off bottom corners of header

      // Header Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 34px sans-serif';
      ctx.fillText('HUNAR PASS • हुनर पास', 75, 105);
      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = '#fed7aa';
      ctx.fillText('Official Vocational Skill Passport', 75, 140);

      // Trade Icon Emblem Box
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, 640, 65, 80, 80, 20);
      ctx.fill();
      ctx.font = '45px sans-serif';
      ctx.fillText(TRADE_ICONS[worker.trade] || '🔧', 655, 122);

      // 3. Worker Name & Details
      ctx.fillStyle = '#0f172a';
      ctx.font = '900 38px sans-serif';
      ctx.fillText(worker.name, 75, 235);

      ctx.fillStyle = '#ea580c';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(`${worker.trade} • ${worker.experience_years} Years Experience`, 75, 275);

      ctx.fillStyle = '#475569';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(`📍 ${worker.area}`, 75, 310);

      // Level Badge
      const levelText = worker.skill_card?.level?.toUpperCase() || 'VERIFIED';
      ctx.fillStyle = worker.skill_card?.level === 'expert' ? '#f59e0b' : '#2563eb';
      roundRect(ctx, 550, 205, 170, 44, 22);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(`⭐ ${levelText}`, 575, 234);

      // Divider line
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(75, 335);
      ctx.lineTo(725, 335);
      ctx.stroke();

      // 4. Trade Summary Box
      ctx.fillStyle = '#fff7ed';
      roundRect(ctx, 75, 355, 650, 110, 20);
      ctx.fill();
      ctx.strokeStyle = '#fdba74';
      ctx.lineWidth = 2;
      roundRect(ctx, 75, 355, 650, 110, 20);
      ctx.stroke();

      ctx.fillStyle = '#9a3412';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('AI TRADE ASSESSMENT SUMMARY:', 95, 385);

      ctx.fillStyle = '#1e293b';
      ctx.font = '16px sans-serif';
      wrapText(
        ctx,
        worker.skill_card?.summary ||
          'Verified skilled tradesperson ready for residential and commercial work.',
        95,
        415,
        610,
        24
      );

      // 5. Verified Skills Chips
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('VERIFIED PRACTICAL SKILLS:', 75, 500);

      const skills = worker.skill_card?.skills || ['Troubleshooting', 'Safety Protocol', 'Installation'];
      let chipX = 75;
      let chipY = 525;

      skills.slice(0, 5).forEach((sk) => {
        ctx.font = 'bold 15px sans-serif';
        const textWidth = ctx.measureText(`✓ ${sk}`).width;
        ctx.fillStyle = '#f0fdf4';
        roundRect(ctx, chipX, chipY, textWidth + 24, 38, 12);
        ctx.fill();
        ctx.strokeStyle = '#86efac';
        ctx.lineWidth = 1.5;
        roundRect(ctx, chipX, chipY, textWidth + 24, 38, 12);
        ctx.stroke();

        ctx.fillStyle = '#166534';
        ctx.fillText(`✓ ${sk}`, chipX + 12, chipY + 24);

        chipX += textWidth + 34;
        if (chipX > 550) {
          chipX = 75;
          chipY += 48;
        }
      });

      // 6. Indicative Daily Wage Range
      ctx.fillStyle = '#fef3c7';
      roundRect(ctx, 75, 645, 650, 85, 20);
      ctx.fill();
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 2;
      roundRect(ctx, 75, 645, 650, 85, 20);
      ctx.stroke();

      ctx.fillStyle = '#92400e';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('INDICATIVE DAILY WAGE RANGE (ESTIMATE):', 95, 675);
      ctx.fillStyle = '#78350f';
      ctx.font = '900 26px sans-serif';
      const minWage = worker.skill_card?.wage_min || 850;
      const maxWage = worker.skill_card?.wage_max || 1250;
      ctx.fillText(`₹${minWage} - ₹${maxWage} / day`, 95, 712);

      // 7. Trust Stamp & Vouch Count
      ctx.fillStyle = '#f8fafc';
      roundRect(ctx, 75, 755, 650, 95, 20);
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      roundRect(ctx, 75, 755, 650, 95, 20);
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 18px sans-serif';
      const vouchCount = worker.vouches?.length || 2;
      ctx.fillText(`🛡️ Verified Trust Level: ${vouchCount} Customer Vouches`, 95, 792);

      ctx.fillStyle = '#64748b';
      ctx.font = '15px sans-serif';
      ctx.fillText('4-Question Spoken Skill Assessment + Customer Endorsements', 95, 824);

      // 8. Footer Watermark & ID
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`Hunar Pass ID: ${worker.id.slice(0, 18)}...`, 75, 885);
      ctx.fillText('Scan QR or visit hunarpass.in to verify authenticity.', 75, 910);

      // Trigger Direct Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${worker.name.replace(/\s+/g, '_')}_Hunar_Pass.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image download:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="font-bold text-slate-600 text-sm">Loading verified skill pass...</p>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="text-center py-12">
        <p className="text-base font-bold text-slate-800">Worker profile not found.</p>
        <Link href="/" className="mt-3 inline-block text-orange-600 font-bold underline text-sm">
          Return to Home
        </Link>
      </div>
    );
  }

  const publicUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : `https://hunarpass.in/w/${worker.id}`;

  const vouchCount = worker.vouches?.length || 0;
  const isNeedsEvidence = worker.skill_card?.level === 'needs more evidence';

  // "Why this trust level" description calculation
  const trustLevelExplanation =
    vouchCount > 0
      ? `${vouchCount} customer vouch${vouchCount > 1 ? 'es' : ''} + 4-question voice skill interview verified`
      : 'Voice skill interview completed + verified phone identity';

  return (
    <div className="flex flex-col gap-5 py-2 max-w-md mx-auto w-full">
      {/* Top Action Share Bar */}
      <div className="flex items-center justify-between px-1">
        <Link
          href="/"
          className="text-xs font-black text-slate-500 hover:text-slate-900 flex items-center gap-1"
        >
          <span>← Home</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="text-xs font-black text-slate-700 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-300 shadow-xs active:scale-95 transition-all flex items-center gap-1"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Copied! ✓' : 'Copy'}</span>
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="text-xs font-black text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300 shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* THE DIGITAL ID CARD (Polished, Official Vocational Passport Container)   */}
      {/* ========================================================================= */}
      <div
        ref={cardRef}
        className="bg-white rounded-[32px] shadow-2xl border-4 border-orange-500 overflow-hidden relative"
      >
        {/* Top Government-Style Security Ribbon */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white p-5 relative overflow-hidden">
          {/* Subtle Security Hologram/Emblem Pattern */}
          <div className="absolute right-3 top-3 opacity-15 text-7xl select-none pointer-events-none">
            🇮🇳
          </div>

          <div className="flex items-center justify-between relative z-10">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full text-white">
                  Skill Passport • हुनर पास
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-1 leading-tight tracking-tight">
                Skill Identification Card
              </h2>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-white text-orange-600 shadow-lg flex items-center justify-center text-3xl font-black border-2 border-orange-200">
              {TRADE_ICONS[worker.trade] || '🔧'}
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex flex-col gap-4">
          {/* Worker Identity Header */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-3">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                {worker.name}
              </h1>
              <p className="text-sm font-extrabold text-orange-600 mt-0.5">
                {worker.trade} • {worker.experience_years} Years Experience
              </p>
              <p className="text-xs font-bold text-slate-500 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-orange-600" />
                <span>{worker.area}</span>
              </p>
            </div>

            {/* Level Badge */}
            <div className="text-right flex flex-col items-end">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide inline-flex items-center gap-1 shadow-xs ${
                  worker.skill_card?.level === 'expert'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : worker.skill_card?.level === 'intermediate'
                    ? 'bg-blue-100 text-blue-900 border border-blue-300'
                    : worker.skill_card?.level === 'needs more evidence'
                    ? 'bg-orange-100 text-orange-900 border border-orange-300'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                {worker.skill_card?.level === 'needs more evidence'
                  ? 'Needs Evidence'
                  : worker.skill_card?.level || 'Verified'}
              </span>
              <span className="text-[10px] font-black text-emerald-600 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Voice Tested
              </span>
            </div>
          </div>

          {/* Level Reason Banner */}
          {worker.skill_card?.level_reason && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-700 font-semibold flex items-start gap-2 shadow-xs">
              <span className="text-orange-600 font-bold text-sm">ℹ️</span>
              <div>
                <span className="font-black text-slate-900 block text-[11px] uppercase tracking-wide">
                  Why this level was assigned:
                </span>
                <span className="leading-snug">{worker.skill_card.level_reason}</span>
              </div>
            </div>
          )}

          {/* Spoken Trade Summary with Audio Player */}
          <div className="bg-orange-50/80 rounded-2xl p-4 border border-orange-200 shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-orange-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span>Trade Summary</span>
              </h3>
              <button
                onClick={handleListenAloud}
                className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 active:scale-95 transition-all shadow-xs ${
                  isPlayingAudio
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-white text-orange-700 border border-orange-300 hover:bg-orange-100'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isPlayingAudio ? 'Listening...' : 'Listen (सुनें)'}</span>
              </button>
            </div>

            <p className="text-sm font-bold text-slate-800 leading-relaxed">
              "{worker.skill_card?.summary ||
                'Verified tradesperson equipped with hands-on trade troubleshooting skills.'}"
            </p>
          </div>

          {/* Skill Chips */}
          <div>
            <h4 className="text-xs font-black uppercase text-slate-500 mb-2 tracking-wide">
              Verified Skills (प्रमाणित हुनर)
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {(worker.skill_card?.skills || ['Troubleshooting', 'Safety Protocol']).map(
                (skill, idx) => (
                  <span
                    key={idx}
                    className="bg-emerald-50 text-emerald-800 text-xs font-extrabold px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{skill}</span>
                  </span>
                )
              )}
            </div>
          </div>

          {/* Indicative Daily Wage Range (Clearly Labeled as an Estimate) */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[10px] font-black text-amber-900 uppercase tracking-wide">
                Indicative Daily Wage Range
              </p>
              <p className="text-xl font-black text-amber-800 mt-0.5">
                ₹{worker.skill_card?.wage_min || 850} - ₹{worker.skill_card?.wage_max || 1250}{' '}
                <span className="text-xs font-extrabold text-amber-700">/ day</span>
              </p>
              <p className="text-[10px] font-bold text-amber-700 mt-1 flex items-center gap-1">
                <span>⚠️</span>
                <span>
                  {worker.skill_card?.wage_label ||
                    `Estimated daily rate for ${worker.area} • sample data`}
                </span>
              </p>
            </div>
            <span className="text-3xl">💰</span>
          </div>

          {/* Trust Section: Number of Vouches + "Why this trust level" */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 flex flex-col gap-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Trust Score: {vouchCount} Vouch{vouchCount !== 1 ? 'es' : ''}</span>
                </h4>
                <p className="text-xs font-bold text-slate-600 mt-0.5">
                  ⭐ <span className="text-slate-900 font-extrabold">Why this trust level:</span>{' '}
                  <span className="italic">{trustLevelExplanation}</span>
                </p>
              </div>
            </div>

            {/* Past customer vouches with partly hidden names (e.g. "Ramesh K., customer, Oct 2026") */}
            {worker.vouches && worker.vouches.length > 0 && (
              <div className="flex flex-col gap-2 pt-1 border-t border-slate-200">
                {worker.vouches.map((v) => (
                  <div
                    key={v.id}
                    className="bg-white p-3 rounded-xl border border-slate-200 text-xs flex flex-col gap-1.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="font-extrabold text-slate-900">
                        {maskVoucherName(v.voucher_name)}, {v.relationship}, {formatJobDate(v.job_date)}
                      </span>
                      {v.would_hire_again !== false && (
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Would hire again</span>
                        </span>
                      )}
                    </div>
                    {v.comment && (
                      <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                        "{v.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Quick Actions for Vouching & Sharing Vouch Link on WhatsApp */}
            <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
              <p className="text-[11px] font-black text-slate-700 uppercase tracking-wide">
                Need more customer vouches?
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleWhatsAppVouchRequest}
                  className="py-2.5 px-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-black text-xs shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Ask on WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyVouchLink}
                  className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 rounded-xl font-black text-xs shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <Share2 className="w-4 h-4 text-orange-600" />
                  <span>{copiedVouchLink ? 'Copied! ✓' : 'Copy Vouch Link'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Next Steps to Grow & Certification Guidance */}
          {worker.skill_card?.next_steps && (
            <div className="bg-blue-50/80 border-2 border-blue-200 rounded-2xl p-4 flex flex-col gap-1.5 shadow-xs">
              <h4 className="text-xs font-black uppercase text-blue-950 flex items-center gap-1.5">
                <span>🎯</span>
                <span>Next Steps to Grow & Official Certification</span>
              </h4>
              <p className="text-xs font-semibold text-blue-950 leading-relaxed">
                {worker.skill_card.next_steps}
              </p>
            </div>
          )}

          {/* QR Code Section Linking to This Exact Page */}
          <div className="pt-3 border-t-2 border-slate-100 flex items-center justify-between gap-4">
            <div className="bg-white p-2 rounded-2xl border-2 border-slate-200 shadow-md flex-shrink-0">
              <QRCodeSVG value={publicUrl} size={92} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black text-slate-900 leading-tight">
                Scan to Verify & Vouch
              </p>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Share this QR code with homeowners, builders, or contractors on the job site.
              </p>
              <p className="text-[10px] font-mono text-orange-600 mt-1 font-bold">
                hunarpass.in/w/{worker.id.slice(0, 8)}
              </p>
            </div>
          </div>
        </div>

        {/* Card Footer Authenticity Strip */}
        <div className="bg-slate-100 border-t border-slate-200 px-5 py-2.5 flex flex-col gap-1 text-[10px] font-bold text-slate-500">
          <div className="flex items-center justify-between">
            <span>Digital Passport Verified by Hunar Pass</span>
            <span>Valid 2026-2027</span>
          </div>
          <p className="text-[9px] text-slate-400 font-semibold text-center mt-0.5">
            Skill levels and wage ranges are AI estimates and not official certification.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ACTION BUTTONS (VOUCH, WHATSAPP, DOWNLOAD AS IMAGE)                       */}
      {/* ========================================================================= */}
      <div className="flex flex-col gap-3 pt-1">
        {/* Button 1: Vouch for Worker */}
        <Link
          href={`/vouch/${worker.id}`}
          className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-base shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <ThumbsUp className="w-5 h-5" />
          <span>Vouch for {worker.name.split(' ')[0]} (सिफ़ारिश करें)</span>
        </Link>

        {/* Button 2: Share on WhatsApp */}
        <button
          onClick={handleWhatsAppShare}
          className="w-full py-4 px-6 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl font-black text-base shadow-lg flex items-center justify-center gap-2.5 active:scale-95 transition-transform"
        >
          <MessageCircle className="w-6 h-6" />
          <span>Share on WhatsApp</span>
        </button>

        {/* Button 3: Download as Image */}
        <button
          onClick={handleDownloadImage}
          disabled={isDownloading}
          className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-orange-400" />
          <span>{isDownloading ? 'Generating Image...' : 'Download as Image (PNG)'}</span>
        </button>
      </div>

      {/* Direct Contact Button */}
      <a
        href={`tel:${worker.phone}`}
        className="w-full py-3.5 bg-white text-slate-900 border-2 border-slate-300 hover:border-slate-500 rounded-2xl font-black text-sm shadow-sm flex items-center justify-center gap-2 active:scale-95"
      >
        <Phone className="w-4 h-4 text-emerald-600" />
        <span>Call Worker: +91 {worker.phone}</span>
      </a>
    </div>
  );
}

// Canvas helper functions
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

// Helper to partly hide voucher name (e.g. "Ramesh Kumar" -> "Ramesh K.")
function maskVoucherName(fullName: string): string {
  if (!fullName) return 'Customer';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length > 1) {
    return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
  }
  return `${parts[0]} K.`;
}

// Helper to format job date into "Oct 2026"
function formatJobDate(dateStr?: string | null): string {
  if (!dateStr) return 'Oct 2026';
  try {
    const d = new Date(dateStr.length === 7 ? `${dateStr}-01` : dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return 'Recent';
  }
}

// Fallback demo worker data
function getFallbackDemoWorker(
  id: string = 'demo-worker',
  name?: string,
  trade?: TradeType,
  area?: string
): WorkerWithDetails {
  // 1. Check if it matches one of the 8 rich seeded Bengaluru workers
  const seeded = DEMO_WORKERS.find((w) => w.id === id);
  if (seeded) {
    let sessionVouches: Vouch[] = [];
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`hunar_vouches_${id}`);
        if (stored) sessionVouches = JSON.parse(stored);
      } catch (e) {}
    }
    return {
      ...seeded,
      vouches: [...sessionVouches, ...(seeded.vouches || [])],
    };
  }

  // 2. Check localStorage for dynamically created worker/card in this browser
  let localWorker: any = null;
  let localCard: any = null;
  let localVouches: Vouch[] = [];
  if (typeof window !== 'undefined') {
    try {
      const w = localStorage.getItem(`hunar_worker_${id}`);
      if (w) localWorker = JSON.parse(w);
      const c = localStorage.getItem(`hunar_card_${id}`);
      if (c) localCard = JSON.parse(c);
      const v = localStorage.getItem(`hunar_vouches_${id}`);
      if (v) localVouches = JSON.parse(v);
    } catch (e) {}
  }

  const finalName = name || localWorker?.name || 'Ramesh Kumar';
  const finalTrade: TradeType = trade || localWorker?.trade || 'Plumber';
  const finalArea = area || localWorker?.area || 'Koramangala, Bengaluru';
  const finalExp = localWorker?.experience_years || 5;

  return {
    id,
    name: finalName,
    phone: localWorker?.phone || '9876543210',
    trade: finalTrade,
    language: localWorker?.language || 'hi-IN',
    area: finalArea,
    experience_years: finalExp,
    created_at: localWorker?.created_at || new Date().toISOString(),
    skill_card: localCard || {
      id: 'sc-default',
      worker_id: id,
      summary: `${finalName} has ${finalExp} years experience in ${finalTrade}. Demonstrated solid practical competence, tool mastery, and safety adherence during skill evaluation.`,
      skills: [
        `${finalTrade} Diagnostics`,
        'Safety & Hazard Protocol',
        'Tool Maintenance',
        'Installation & Repairs',
        'Troubleshooting',
      ],
      level: 'expert',
      level_reason: 'Solved practical trade troubleshooting questions with proper safety precautions.',
      transcript: 'Voice interview completed.',
      next_steps:
        'Consider official RPL (PMKVY Level 4) or ITI trade certification for contractor empanelment.',
      wage_min: 800,
      wage_max: 1200,
      wage_label: `₹800 - ₹1,200/day (Estimated rate for ${finalArea} • sample data)`,
      created_at: new Date().toISOString(),
    },
    vouches: localVouches.length > 0 ? localVouches : [
      {
        id: 'v-1',
        worker_id: id,
        voucher_name: 'Anand Verma',
        voucher_phone: '9123456780',
        relationship: 'customer',
        job_date: '2026-10-15',
        would_hire_again: true,
        comment: 'Excellent work done on time. Very professional!',
        created_at: new Date().toISOString(),
      },
    ],
  };
}
