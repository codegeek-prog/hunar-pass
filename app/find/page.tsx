'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  Phone,
  MessageCircle,
  ShieldCheck,
  Award,
  Filter,
  CheckCircle2,
  ExternalLink,
  Briefcase,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { WorkerWithDetails, TradeType } from '@/types/database';
import { DEMO_WORKERS, BENGALURU_AREAS, IS_DEMO_DATA_NOTICE } from '@/lib/seedData';

const TRADES: Array<{ trade: string; icon: string }> = [
  { trade: 'All', icon: '🔍' },
  { trade: 'Plumber', icon: '🚰' },
  { trade: 'Electrician', icon: '⚡' },
  { trade: 'Mason', icon: '🧱' },
  { trade: 'Carpenter', icon: '🪚' },
  { trade: 'Painter', icon: '🎨' },
  { trade: 'Welder', icon: '👨‍🏭' },
  { trade: 'Mechanic', icon: '🔧' },
];

export default function FindWorkersPage() {
  const router = useRouter();

  // Filter States
  const [selectedTrade, setSelectedTrade] = useState<string>('All');
  const [selectedArea, setSelectedArea] = useState<string>('All Areas');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data & Loading States
  const [allWorkers, setAllWorkers] = useState<WorkerWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. Fetch Workers from Supabase or Fallback to Bengaluru Demo Seeds
  useEffect(() => {
    async function fetchWorkers() {
      setIsLoading(true);
      try {
        let sessionWorkers: WorkerWithDetails[] = [];
        if (typeof window !== 'undefined') {
          try {
            for (let i = 0; i < localStorage.length; i++) {
              const k = localStorage.key(i);
              if (k && k.startsWith('hunar_worker_')) {
                const wid = k.replace('hunar_worker_', '');
                const wObj = JSON.parse(localStorage.getItem(k) || '{}');
                const cObj = JSON.parse(localStorage.getItem(`hunar_card_${wid}`) || 'null');
                const vObj = JSON.parse(localStorage.getItem(`hunar_vouches_${wid}`) || '[]');
                if (wObj && wObj.name) {
                  sessionWorkers.push({
                    ...wObj,
                    skill_card: cObj,
                    vouches: vObj,
                  });
                }
              }
            }
          } catch (e) {}
        }

        const { data, error } = await supabase
          .from('workers')
          .select('*, skill_cards(*), vouches(*)')
          .order('created_at', { ascending: false });

        let baseWorkers = DEMO_WORKERS;
        if (data && data.length > 0) {
          baseWorkers = data.map((w: any) => ({
            ...w,
            skill_card: Array.isArray(w.skill_cards) ? w.skill_cards[0] : w.skill_cards,
            vouches: w.vouches || [],
          }));
        }

        const baseIds = new Set(baseWorkers.map((w) => w.id));
        const unlisted = sessionWorkers.filter((w) => !baseIds.has(w.id));
        setAllWorkers([...unlisted, ...baseWorkers]);
      } catch (err) {
        console.warn('Using demo Bengaluru workers:', err);
        setAllWorkers(DEMO_WORKERS);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWorkers();
  }, []);

  // 2. Filter & Rank Workers: Verified-and-Vouched Workers Ranked First
  const filteredAndRankedWorkers = useMemo(() => {
    let result = [...allWorkers];

    // Filter by Trade
    if (selectedTrade !== 'All') {
      result = result.filter(
        (w) => w.trade.toLowerCase() === selectedTrade.toLowerCase()
      );
    }

    // Filter by Area Dropdown
    if (selectedArea !== 'All Areas') {
      const areaKeyword = selectedArea.toLowerCase().replace(', bengaluru', '');
      result = result.filter((w) =>
        w.area.toLowerCase().includes(areaKeyword)
      );
    }

    // Filter by Search Query (Name, Area, or Trade)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.area.toLowerCase().includes(q) ||
          w.trade.toLowerCase().includes(q)
      );
    }

    // Ranking Logic:
    // Rule 1: Verified workers WITH vouches ranked FIRST
    // Rule 2: Higher vouch count ranks higher
    // Rule 3: Skill level: expert (3) > intermediate (2) > beginner (1) > needs more evidence (0)
    // Rule 4: More experience years ranks higher
    const levelScore: Record<string, number> = {
      expert: 3,
      intermediate: 2,
      beginner: 1,
      'needs more evidence': 0,
    };

    result.sort((a, b) => {
      const aVouches = a.vouches?.length || 0;
      const bVouches = b.vouches?.length || 0;

      // 1. Vouched workers first
      if ((aVouches > 0) !== (bVouches > 0)) {
        return aVouches > 0 ? -1 : 1;
      }

      // 2. Vouch count descending
      if (aVouches !== bVouches) {
        return bVouches - aVouches;
      }

      // 3. Level score descending
      const aLevel = levelScore[a.skill_card?.level || 'beginner'] ?? 1;
      const bLevel = levelScore[b.skill_card?.level || 'beginner'] ?? 1;
      if (aLevel !== bLevel) {
        return bLevel - aLevel;
      }

      // 4. Experience years descending
      return b.experience_years - a.experience_years;
    });

    return result;
  }, [allWorkers, selectedTrade, selectedArea, searchQuery]);

  // Contact via WhatsApp with prefilled message
  const handleContactWhatsApp = (worker: WorkerWithDetails, e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanPhone = worker.phone.replace(/\D/g, '');
    const message = `Namaste ${worker.name}! I found your verified ${worker.trade} profile on Hunar Pass. Are you available for work in ${worker.area}?`;
    const url = `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Direct Call
  const handleCallWorker = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="flex flex-col gap-4 py-2 max-w-lg mx-auto w-full">
      
      {/* Top Header & Navigation to Jobs Board */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Find Verified Workers</span>
            </h1>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              Spoken skill assessment + customer vouches
            </p>
          </div>

          <Link
            href="/jobs"
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-xs flex items-center gap-1 active:scale-95 transition-all"
          >
            <Briefcase className="w-3.5 h-3.5 text-orange-400" />
            <span>Job Board</span>
          </Link>
        </div>

        {/* Demo Data Notice Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 flex items-center gap-2 text-[11px] font-bold text-amber-900 shadow-2xs">
          <span>ℹ️</span>
          <span>{IS_DEMO_DATA_NOTICE}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FILTER CONTROLS: TRADE TABS & AREA SELECTOR                               */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-3 border-2 border-slate-200 shadow-sm flex flex-col gap-3">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, area (e.g. Koramangala)..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-slate-200 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Trade Filter Horizontal Scroller */}
        <div>
          <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wide">
            Filter by Trade (हुनर चुनें):
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {TRADES.map((t) => (
              <button
                key={t.trade}
                onClick={() => setSelectedTrade(t.trade)}
                className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 whitespace-nowrap transition-all active:scale-95 shadow-xs ${
                  selectedTrade === t.trade
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.trade}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Area Filter Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-wide whitespace-nowrap flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-orange-600" />
            <span>Area:</span>
          </label>
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl border-2 border-slate-200 font-bold text-xs text-slate-800 bg-white focus:outline-none focus:border-orange-500"
          >
            {BENGALURU_AREAS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        {/* Active Filters Summary & Result Count */}
        <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Showing <strong className="text-orange-600 font-black">{filteredAndRankedWorkers.length}</strong> verified worker{filteredAndRankedWorkers.length !== 1 ? 's' : ''}
          </span>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-bold">
            🛡️ Vouched ranked 1st
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* WORKER CARDS LIST (RANKED WITH VOUCHED WORKERS FIRST)                     */}
      {/* ========================================================================= */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Loading verified workers in Bengaluru...</p>
        </div>
      ) : filteredAndRankedWorkers.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 text-center flex flex-col items-center gap-3">
          <span className="text-4xl">🔍</span>
          <h3 className="text-base font-black text-slate-900">No verified workers found</h3>
          <p className="text-xs text-slate-500 max-w-xs font-medium">
            Try resetting your trade or area filter to explore all 8 verified trade professionals in Bengaluru.
          </p>
          <button
            onClick={() => {
              setSelectedTrade('All');
              setSelectedArea('All Areas');
              setSearchQuery('');
            }}
            className="mt-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-black shadow-sm"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredAndRankedWorkers.map((worker) => {
            const vouchCount = worker.vouches?.length || 0;
            const hasVouches = vouchCount > 0;
            const level = worker.skill_card?.level || 'intermediate';

            return (
              <div
                key={worker.id}
                onClick={() => router.push(`/w/${worker.id}`)}
                className={`bg-white rounded-3xl p-4 border-2 transition-all cursor-pointer hover:shadow-lg active:scale-[0.99] flex flex-col gap-3 relative ${
                  hasVouches
                    ? 'border-orange-400 shadow-md ring-1 ring-orange-200'
                    : 'border-slate-200 shadow-xs'
                }`}
              >
                {/* Ranking Tag for Top Vouched */}
                {hasVouches && (
                  <div className="absolute -top-2.5 right-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-white" />
                    <span>Verified & Vouched</span>
                  </div>
                )}

                {/* Top Row: Worker Identity & Badges */}
                <div className="flex items-start justify-between gap-2 mt-0.5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center text-2xl shadow-xs font-black">
                      {TRADES.find((t) => t.trade === worker.trade)?.icon || '🔧'}
                    </div>

                    <div>
                      <h2 className="text-base font-black text-slate-900 leading-tight flex items-center gap-1.5">
                        <span>{worker.name}</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-50" />
                      </h2>
                      <p className="text-xs font-black text-orange-600 mt-0.5">
                        {worker.trade} • {worker.experience_years} Years Experience
                      </p>
                      <p className="text-[11px] font-bold text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{worker.area}</span>
                      </p>
                    </div>
                  </div>

                  {/* Level Badge */}
                  <div className="text-right flex flex-col items-end gap-1">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide inline-flex items-center gap-1 ${
                        level === 'expert'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : level === 'intermediate'
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : level === 'needs more evidence'
                          ? 'bg-orange-100 text-orange-900 border border-orange-300'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}
                    >
                      <Award className="w-3 h-3" />
                      <span>{level === 'needs more evidence' ? 'Needs Evidence' : level}</span>
                    </span>

                    {/* Vouch Count Badge */}
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg flex items-center gap-1 ${
                        hasVouches
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>{vouchCount} Vouch{vouchCount !== 1 ? 'es' : ''}</span>
                    </span>
                  </div>
                </div>

                {/* Summary Snippet or Skill Chips */}
                {worker.skill_card?.skills && worker.skill_card.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-100">
                    {worker.skill_card.skills.slice(0, 3).map((sk, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-50 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200"
                      >
                        ✓ {sk}
                      </span>
                    ))}
                    {worker.skill_card.skills.length > 3 && (
                      <span className="text-[10px] font-bold text-slate-400 self-center">
                        +{worker.skill_card.skills.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Indicative Daily Rate */}
                {worker.skill_card?.wage_min && (
                  <div className="bg-amber-50/70 border border-amber-200 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-black uppercase text-amber-900">
                      Indicative Daily Rate:
                    </span>
                    <span className="font-black text-amber-900">
                      ₹{worker.skill_card.wage_min} - ₹{worker.skill_card.wage_max}
                      <span className="text-[10px] font-bold text-amber-700"> / day</span>
                    </span>
                  </div>
                )}

                {/* Card Action Buttons (Direct Contact & Profile View) */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
                  {/* Action 1: Call */}
                  <button
                    type="button"
                    onClick={(e) => handleCallWorker(worker.phone, e)}
                    className="py-2.5 px-2 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 rounded-xl font-black text-xs shadow-2xs flex items-center justify-center gap-1 active:scale-95 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call</span>
                  </button>

                  {/* Action 2: WhatsApp */}
                  <button
                    type="button"
                    onClick={(e) => handleContactWhatsApp(worker, e)}
                    className="py-2.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-300 rounded-xl font-black text-xs shadow-2xs flex items-center justify-center gap-1 active:scale-95 transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </button>

                  {/* Action 3: View Full Passport */}
                  <button
                    type="button"
                    onClick={() => router.push(`/w/${worker.id}`)}
                    className="py-2.5 px-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black text-xs shadow-xs flex items-center justify-center gap-1 active:scale-95 transition-all"
                  >
                    <span>Passport</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Sticky Promotion Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-xl mt-2">
        <div>
          <p className="text-xs font-black text-white">Are you a skilled worker?</p>
          <p className="text-[11px] text-slate-400">Speak for 2 mins & get your digital passport</p>
        </div>
        <Link
          href="/create"
          className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black rounded-xl shadow-md active:scale-95 transition-all whitespace-nowrap"
        >
          Create Passport →
        </Link>
      </div>

    </div>
  );
}
