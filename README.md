# 🪪 Hunar Pass (हुनर पास / ಹುನರ್ ಪಾಸ್)

> **Voice-First Skill Passport for Blue-Collar Workers in India**  
> *Built for a 24-Hour Hackathon MVP*

---

## 🌟 The Problem & Solution

* **The Problem**: Over 400 million skilled blue-collar workers in India (plumbers, electricians, masons, carpenters, painters, welders, mechanics) have no trusted, portable, or shareable proof of their skills. Consequently, they lose jobs to intermediaries, face wage suppression, and struggle to establish trust with new employers and homeowners.
* **The Solution**: **Hunar Pass** turns a 2-minute spoken conversation into a verified digital skill passport. A worker answers 4 practical voice questions about their trade in their mother tongue (**Hindi**, **Kannada**, or **Indian English**). Anthropic Claude analyzes the transcript to issue an official **Skill Card**. Past customers vouch with one tap, and the worker gets a public profile with a **shareable QR code**, **indicative daily wage estimate**, and **PNG digital ID card**. Employers can search for verified and vouched workers nearby.

---

## ✨ Features Overview

### 1. 🌐 Voice-First Multilingual Landing Page (`/`)
- Headline, subline, and 3-step "How It Works" guide.
- One-tap language switcher for **English**, **हिन्दी (Hindi)**, and **ಕನ್ನಡ (Kannada)** using a unified translation dictionary ([lib/translations.ts](file:///c:/Users/karan/Downloads/New%20folder/lib/translations.ts)).
- **Listen Aloud** button using Web Speech API synthesis for low-literacy users.
- Two huge call-to-action touch buttons: **"I'm a Worker"** (`/create`) and **"I'm Hiring"** (`/find`).

### 2. 👷 Worker Onboarding (`/create`)
- Profile fields: Full name, 10-digit Indian mobile number (`/^[6-9]\d{9}$/`), trade picker, area/city, years of experience stepper, and preferred interview language.
- Big icon dropdown for 7 vocational trades: **Plumber 🚰**, **Electrician ⚡**, **Mason 🧱**, **Carpenter 🪚**, **Painter 🎨**, **Welder 👨‍🏭**, **Mechanic 🔧**.
- Saves to Supabase `workers` table (with offline `localStorage` fallback) and routes directly to the voice interview.

### 3. 🎙️ Practical Voice Interview (`/interview/[workerId]`)
- **Server AI Question Generator**: Calls Anthropic Claude (`claude-3-5-sonnet-20241022`) to generate 4 short, trade-specific practical questions in the worker's chosen language (Q1-Q3 troubleshooting, Q4 safety check).
- **Listen Button**: Reads each question aloud using the browser's `SpeechSynthesis`.
- **Speech-to-Text**: Huge microphone button using browser Web Speech API (`webkitSpeechRecognition`) with live transcript display.
- **Typed Fallback**: Workers can edit or type answers directly if the microphone fails or in loud environments.
- **✨ Demo Mode Toggle**:
  - Located directly in the header banner.
  - One-tap buttons: **"Auto-Fill Answer"**, **"Simulate Voice"** (speaks and types answer live), and **"Fast Track: Fill All 4 & Finish Demo"**.
  - Powered by a comprehensive trade answers dictionary across Hindi, Kannada, and English.
- **Resilient Fallbacks**: If the Claude API times out or hits rate limits, pre-computed verified skill evaluations guarantee a seamless live demo.

### 4. 🧠 AI Skill Assessment Server Route (`/api/analyze-skills`)
- Analyzes interview transcripts with Anthropic Claude and outputs strict JSON:
  - `summary`: 2 to 3 simple sentences in the worker's language.
  - `skills`: 4 to 6 specific demonstrated practical skills.
  - `level`: `beginner`, `intermediate`, `expert`, or `needs more evidence` (with a one-line reason).
  - `next_steps`: Concrete trade learning steps, including official certification advice (e.g., **RPL - PMKVY Level 4** or **ITI**).
  - `indicative_wage_range`: Daily rate in INR based on trade, level, and city, labelled as an estimate with sample data.
- Saves results to the `skill_cards` table and redirects to the public passport.

### 5. 🪪 Public Digital ID Passport (`/w/[workerId]`)
- Polished, mobile-first vocational ID card styled like an official Indian credential.
- Displays worker name, trade icon emblem, experience, area, level badge, level reason, audio summary playback, and verified skill chips.
- **Indicative Wage Range**: Clear daily rate estimate labeled: *"Skill levels and wage ranges are AI estimates and not official certification."*
- **Trust Section**: Displays vouch count, trust explanation, and customer testimonials with privacy-safe name masking (e.g. `Ramesh K., customer, Oct 2026`).
- **QR Code**: Scannable QR code linking to the live profile.
- **WhatsApp Vouch Request**: Dedicated button for workers to ask past clients to vouch with a prefilled message.
- **Download as Image**: Direct HTML5 Canvas PNG generation of the digital card for offline sharing.

### 6. 🤝 1-Tap Customer Vouching (`/vouch/[workerId]`)
- No login or signup required.
- Collects voucher name, mobile number, relationship (**Customer 🏡**, **Co-worker 🤝**, **Contractor 🏗️**), month of job, and 1-tap question: *"Would you hire this person again?"* (**👍 YES** / **👎 NO**).
- **Database Rules Enforced**:
  - **No Duplicate Vouches**: PostgreSQL unique constraint on `(worker_id, voucher_phone)`.
  - **Anti-Self-Vouch**: PostgreSQL trigger blocks workers from vouching for their own phone number.
- Thank-you screen displays confirmation and redirects back to the updated profile.

### 7. 🔍 Employer Discovery Directory (`/find`)
- Interactive filters for **Trade** (horizontal chips) and **Bengaluru Area** (dropdown + search box).
- **Ranking Algorithm**: Verified-and-vouched workers are ranked first, followed by vouch count, skill level, and years of experience.
- Each card has direct **📞 Call** and **💬 WhatsApp** contact buttons with prefilled inquiry messages.

### 8. 💼 Local Trade Job Board (`/jobs`)
- Lists active jobs from the `jobs` table (or fallback Bengaluru demo jobs).
- Filterable by trade, area, and search query.
- **"+ Post a Job" Form**: Simple form to publish new jobs with title, trade, area, pay, employer name, and contact number.

---

## 🛠️ Tech Stack & Security

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS (Mobile-first, tuned for 360px+ viewport)
- **Database**: Supabase (PostgreSQL with RLS, triggers, indexes, and seed data)
- **AI Intelligence**: Anthropic Claude API (`claude-3-5-sonnet-20241022`) called **only from server-side route handlers** (`app/api/`)
- **Speech Technologies**: Browser Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)
- **QR Code Generation**: `qrcode.react` (SVG)
- **Security Check**:
  - `ANTHROPIC_API_KEY` is strictly accessed in server-side routes and **never** exposed to client bundles.
  - `SUPABASE_SERVICE_ROLE_KEY` is strictly server-only.
  - Public client uses only `NEXT_PUBLIC_SUPABASE_ANON_KEY` protected by Row Level Security (RLS).

---

## 📁 Project Structure

```text
hunar-pass/
├── app/
│   ├── api/
│   │   ├── analyze-skills/
│   │   │   └── route.ts             # Claude API skill assessment & wage calculation
│   │   └── generate-questions/
│   │       └── route.ts             # Claude API 4-question practical test generator
│   ├── create/
│   │   └── page.tsx                 # Worker profile creation form (10-digit validation)
│   ├── find/
│   │   └── page.tsx                 # Employer discovery directory (vouched ranked first)
│   ├── interview/[workerId]/
│   │   └── page.tsx                 # Voice interview with Speech API & Demo Mode
│   ├── jobs/
│   │   └── page.tsx                 # Job board with "+ Post a Job" form
│   ├── vouch/[workerId]/
│   │   └── page.tsx                 # 1-tap customer endorsement & rule enforcement
│   ├── w/[workerId]/
│   │   └── page.tsx                 # Public Digital ID Card, QR code, PNG download
│   ├── globals.css                  # Animations & mobile-first utility classes
│   ├── layout.tsx                   # Root mobile frame with persistent disclaimer
│   └── page.tsx                     # Landing page with language switcher
├── lib/
│   ├── seedData.ts                  # 8 Bengaluru workers, 8 vouches, 6 jobs demo data
│   ├── supabase.ts                  # Browser Supabase client
│   ├── supabaseServer.ts            # Server-side Supabase client
│   ├── translations.ts              # Unified translations for English, Hindi, Kannada
│   └── wages.ts                     # Indicative daily wage range reference table
├── supabase/
│   └── schema.sql                   # Tables, constraints, trigger & Bengaluru seeds
├── types/
│   └── database.ts                  # TypeScript interfaces for database schema
├── preview.html                     # Interactive standalone mobile simulator
├── .env.example                     # Environment variables template
├── next.config.mjs
├── package.json
└── tsconfig.json
```

---

## 🚀 Quick Setup Guide

### 1. Prerequisites
- Node.js 18.17+ or Node.js 20+
- A free Supabase account ([supabase.com](https://supabase.com))
- An Anthropic API key ([console.anthropic.com](https://console.anthropic.com))

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Supabase Database
1. Create a new project on [Supabase](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Open [supabase/schema.sql](file:///c:/Users/karan/Downloads/New%20folder/supabase/schema.sql) in this repository, copy its contents, and run it in the SQL Editor.
   - This creates the 4 tables (`workers`, `skill_cards`, `vouches`, `jobs`), the `check_worker_self_vouch` trigger, RLS policies, and inserts 8 demo workers, 8 vouches, and 6 Bengaluru jobs.

### 4. Set Environment Variables
Create a file named `.env.local` in the root folder:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Anthropic Claude API Key (Server-side only)
ANTHROPIC_API_KEY=sk-ant-api03-...

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in Chrome or Edge.

---

## 📱 Mobile & Live Demo Testing (360px Viewport)

### Emulating a Mobile Device
1. Open Chrome or Edge DevTools (`F12` or `Ctrl + Shift + I`).
2. Toggle the device toolbar (`Ctrl + Shift + M`).
3. Set responsive width to **360px** (e.g. Samsung Galaxy S8 / Android 360x740).
4. Every page is styled with large touch targets, readable font sizes, and horizontal scrollbars removed.

### Live Demo Presentation Tips
1. **Noisy Hall / Mic Fallback**:
   - On the interview page (`/interview/...`), tap the **"✨ Demo Mode: ON"** button in the header.
   - Tap **"⚡ Auto-Fill Answer"** to load pre-recorded trade answers or **"Simulate Voice"** to hear them read aloud.
   - Tap **"🚀 Fast Track: Fill All 4 & Finish Demo"** for a 5-second complete flow walkthrough.
2. **Testing Self-Vouching**:
   - Go to `/vouch/...` for Ramesh Kumar.
   - Try submitting with his registered phone `9876543210` to see the live self-vouch rejection.
3. **Testing Duplicate Vouching**:
   - Enter `9123456780` (already vouched) to see the duplicate vouch prevention.
4. **Standalone Simulator**:
   - Open [preview.html](file:///c:/Users/karan/Downloads/New%20folder/preview.html) directly in any browser for an interactive zero-dependency preview.

---

## ⚖️ Disclaimer
*Skill levels and wage ranges are AI estimates based on spoken interview responses and are not official vocational certifications (such as government ITI or PMKVY).*
