'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  MapPin,
  Phone,
  MessageCircle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Users,
  AlertCircle,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Job, TradeType } from '@/types/database';
import { DEMO_JOBS, BENGALURU_AREAS, IS_DEMO_DATA_NOTICE } from '@/lib/seedData';

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

export default function JobsPage() {
  // Filter States
  const [selectedTrade, setSelectedTrade] = useState<string>('All');
  const [selectedArea, setSelectedArea] = useState<string>('All Areas');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Jobs List State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Post a Job Form Modal / Expansion State
  const [showPostJob, setShowPostJob] = useState<boolean>(false);
  const [title, setTitle] = useState('');
  const [trade, setTrade] = useState<TradeType>('Plumber');
  const [area, setArea] = useState('Koramangala, Bengaluru');
  const [pay, setPay] = useState('₹1,000/day');
  const [employerName, setEmployerName] = useState('');
  const [contact, setContact] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<boolean>(false);

  // 1. Fetch Jobs from Supabase or Fallback to Bengaluru Demo Seeds
  useEffect(() => {
    async function loadJobs() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          setJobs(data);
        } else {
          setJobs(DEMO_JOBS);
        }
      } catch (err) {
        console.warn('Using demo Bengaluru jobs:', err);
        setJobs(DEMO_JOBS);
      } finally {
        setIsLoading(false);
      }
    }

    loadJobs();
  }, []);

  // 2. Filter Jobs
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    if (selectedTrade !== 'All') {
      result = result.filter(
        (j) => j.trade.toLowerCase() === selectedTrade.toLowerCase()
      );
    }

    if (selectedArea !== 'All Areas') {
      const areaKeyword = selectedArea.toLowerCase().replace(', bengaluru', '');
      result = result.filter((j) =>
        j.area.toLowerCase().includes(areaKeyword)
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.employer_name.toLowerCase().includes(q) ||
          j.area.toLowerCase().includes(q)
      );
    }

    return result;
  }, [jobs, selectedTrade, selectedArea, searchQuery]);

  // 3. Handle Submit Post a Job
  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Please enter a job title (काम का शीर्षक लिखें)');
      return;
    }

    if (!employerName.trim()) {
      setFormError('Please enter the employer or company name');
      return;
    }

    const cleanContact = contact.replace(/\D/g, '').replace(/^91/, '').replace(/^0/, '');
    if (!/^[6-9]\d{9}$/.test(cleanContact)) {
      setFormError('Please enter a valid 10-digit Indian mobile number starting with 6-9');
      return;
    }

    setIsSubmitting(true);

    try {
      const newJobRecord = {
        title: title.trim(),
        trade,
        area: area.trim(),
        pay: pay.trim() || '₹900/day',
        employer_name: employerName.trim(),
        contact: cleanContact,
      };

      const { data, error } = await supabase
        .from('jobs')
        .insert(newJobRecord)
        .select()
        .single();

      if (!error && data) {
        setJobs((prev) => [data, ...prev]);
      } else {
        // Fallback optimistic update
        const localJob: Job = {
          id: 'job-user-' + Date.now(),
          ...newJobRecord,
          created_at: new Date().toISOString(),
        };
        setJobs((prev) => [localJob, ...prev]);
      }

      setFormSuccess(true);
      setTitle('');
      setEmployerName('');
      setContact('');

      setTimeout(() => {
        setFormSuccess(false);
        setShowPostJob(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to post job:', err);
      setFormError('Failed to post job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp apply link
  const handleApplyWhatsApp = (job: Job) => {
    const cleanPhone = job.contact.replace(/\D/g, '');
    const message = `Namaste ${job.employer_name}! I saw your job post on Hunar Pass for "${job.title}" (${job.trade}) in ${job.area}. I am a verified skilled worker interested in this job.`;
    const url = `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col gap-4 py-2 max-w-lg mx-auto w-full">
      
      {/* Top Header & Navigation to Worker Directory */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Local Trade Jobs</span>
            </h1>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              Daily wage & monthly jobs in Bengaluru
            </p>
          </div>

          <Link
            href="/find"
            className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black rounded-xl shadow-xs flex items-center gap-1 active:scale-95 transition-all"
          >
            <Users className="w-3.5 h-3.5 text-white" />
            <span>Find Workers</span>
          </Link>
        </div>

        {/* Demo Data Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 flex items-center gap-2 text-[11px] font-bold text-amber-900 shadow-2xs">
          <span>ℹ️</span>
          <span>{IS_DEMO_DATA_NOTICE}</span>
        </div>
      </div>

      {/* Primary Action: Post a Job Trigger Button */}
      <button
        onClick={() => {
          setShowPostJob(!showPostJob);
          setFormError(null);
        }}
        className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
      >
        <Plus className="w-5 h-5" />
        <span>{showPostJob ? 'Close Job Form (फॉर्म बंद करें)' : '+ Post a Job (नया काम पोस्ट करें)'}</span>
      </button>

      {/* ========================================================================= */}
      {/* POST A JOB FORM (INLINE / ACCORDION)                                      */}
      {/* ========================================================================= */}
      {showPostJob && (
        <div className="bg-white rounded-3xl p-5 border-4 border-emerald-500 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-base font-black text-slate-900 leading-tight">
                Post a Trade Job (काम पोस्ट करें)
              </h3>
              <p className="text-[11px] font-bold text-slate-500">
                Connect directly with verified plumbers, electricians, and tradespeople
              </p>
            </div>
            <span className="text-2xl">📋</span>
          </div>

          {formError && (
            <div className="bg-red-50 border-2 border-red-300 text-red-700 p-2.5 rounded-xl text-xs font-bold">
              ⚠️ {formError}
            </div>
          )}

          {formSuccess ? (
            <div className="bg-emerald-50 border-2 border-emerald-400 text-emerald-800 p-4 rounded-2xl text-center flex flex-col items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              <p className="text-sm font-black">Job Posted Successfully!</p>
              <p className="text-xs font-semibold text-emerald-700">
                Your listing is now live for verified workers in Bengaluru.
              </p>
            </div>
          ) : (
            <form onSubmit={handlePostJob} className="flex flex-col gap-3">
              {/* 1. Job Title */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 uppercase mb-1">
                  Job Title (काम का शीर्षक) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Urgent Plumber for 2-Day Villa Piping"
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* 2. Trade Selector */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 uppercase mb-1">
                  Required Trade (ज़रूरी हुनर) <span className="text-red-500">*</span>
                </label>
                <select
                  value={trade}
                  onChange={(e) => setTrade(e.target.value as TradeType)}
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-xs text-slate-900 bg-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Plumber">🚰 Plumber (प्लंबर)</option>
                  <option value="Electrician">⚡ Electrician (इलेक्ट्रीशियन)</option>
                  <option value="Mason">🧱 Mason (राजमिस्त्री)</option>
                  <option value="Carpenter">🪚 Carpenter (बढ़ई)</option>
                  <option value="Painter">🎨 Painter (पेंटर)</option>
                  <option value="Welder">👨‍🏭 Welder (वेल्डर)</option>
                  <option value="Mechanic">🔧 Mechanic (मैकेनिक)</option>
                </select>
              </div>

              {/* 3. Area in Bengaluru */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 uppercase mb-1">
                  Job Location (इलाका) <span className="text-red-500">*</span>
                </label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-xs text-slate-900 bg-white focus:outline-none focus:border-emerald-500"
                >
                  {BENGALURU_AREAS.filter((a) => a !== 'All Areas').map((a) => (
                    <option key={a} value={a}>
                      📍 {a}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Pay / Wage */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 uppercase mb-1">
                  Pay / Daily Wage (मज़दूरी) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={pay}
                  onChange={(e) => setPay(e.target.value)}
                  placeholder="e.g. ₹1,000/day or ₹26,000/month"
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* 5. Employer Name */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 uppercase mb-1">
                  Employer / Contractor Name (कंपनी / मालिक का नाम) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={employerName}
                  onChange={(e) => setEmployerName(e.target.value)}
                  placeholder="e.g. Prestige Builders or Anita R."
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* 6. Contact Mobile Number */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 uppercase mb-1">
                  Contact Mobile Number (संपर्क नंबर) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-slate-100 border-2 border-r-0 border-slate-300 rounded-l-xl font-black text-xs text-slate-600">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="9845012345"
                    className="w-full px-3 py-2.5 rounded-r-xl border-2 border-slate-300 font-bold text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 mt-1"
              >
                <span>{isSubmitting ? 'Posting Job...' : 'Publish Job Listing →'}</span>
              </button>
            </form>
          )}
        </div>
      )}

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
            placeholder="Search jobs by title, area, or company..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-slate-200 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
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
                    ? 'bg-emerald-600 text-white shadow-md'
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
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Area:</span>
          </label>
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl border-2 border-slate-200 font-bold text-xs text-slate-800 bg-white focus:outline-none focus:border-emerald-500"
          >
            {BENGALURU_AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        {/* Active Filters Summary */}
        <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Showing <strong className="text-emerald-700 font-black">{filteredJobs.length}</strong> active job listing{filteredJobs.length !== 1 ? 's' : ''}
          </span>
          <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-bold">
            Bengaluru Region
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* JOB LISTINGS CARDS                                                        */}
      {/* ========================================================================= */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Loading active jobs in Bengaluru...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 text-center flex flex-col items-center gap-3">
          <span className="text-4xl">💼</span>
          <h3 className="text-base font-black text-slate-900">No active jobs found</h3>
          <p className="text-xs text-slate-500 max-w-xs font-medium">
            No listings match your current trade and area filters. Tap below to post the first job!
          </p>
          <button
            onClick={() => setShowPostJob(true)}
            className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-sm"
          >
            + Post a Job Now
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredJobs.map((job) => {
            const tradeIcon = TRADES.find((t) => t.trade === job.trade)?.icon || '🔧';

            return (
              <div
                key={job.id}
                className="bg-white rounded-3xl p-4 border-2 border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
              >
                {/* Top Row: Title, Employer & Trade Icon */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-xl shadow-xs font-black flex-shrink-0">
                      {tradeIcon}
                    </div>

                    <div>
                      <h2 className="text-base font-black text-slate-900 leading-tight">
                        {job.title}
                      </h2>
                      <p className="text-xs font-extrabold text-slate-600 mt-0.5">
                        {job.employer_name}
                      </p>
                      <p className="text-[11px] font-bold text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{job.area}</span>
                      </p>
                    </div>
                  </div>

                  {/* Pay Tag */}
                  <div className="text-right flex-shrink-0">
                    <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-xl text-xs font-black shadow-2xs block">
                      {job.pay}
                    </span>
                    <span className="text-[9px] uppercase font-black text-slate-400 mt-1 block">
                      {job.trade}
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Direct Action Contact Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  {/* Action 1: Call Employer */}
                  <a
                    href={`tel:${job.contact}`}
                    className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 rounded-xl font-black text-xs shadow-2xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call: +91 {job.contact}</span>
                  </a>

                  {/* Action 2: Apply on WhatsApp */}
                  <button
                    onClick={() => handleApplyWhatsApp(job)}
                    className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-300 rounded-xl font-black text-xs shadow-2xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Apply on WhatsApp</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Switcher Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-xl mt-2">
        <div>
          <p className="text-xs font-black text-white">Looking for verified tradespeople?</p>
          <p className="text-[11px] text-slate-400">Browse verified profiles with customer vouches</p>
        </div>
        <Link
          href="/find"
          className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black rounded-xl shadow-md active:scale-95 transition-all whitespace-nowrap"
        >
          View Workers →
        </Link>
      </div>

    </div>
  );
}
