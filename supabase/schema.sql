-- ==============================================================================
-- HUNAR PASS - DATABASE SCHEMA
-- Voice-First Skill Passport for Blue-Collar Workers in India
-- ==============================================================================
-- Run this entire script in your Supabase SQL Editor:
-- Supabase Dashboard -> SQL Editor -> New Query -> Paste & Click "RUN"
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- TABLE 1: WORKERS
-- Stores the registered tradesperson's basic details and language preference
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    trade TEXT NOT NULL, -- e.g., 'Plumber', 'Electrician', 'Mason', 'Carpenter'
    language TEXT NOT NULL DEFAULT 'hi-IN', -- 'en-IN', 'hi-IN', 'kn-IN'
    area TEXT NOT NULL, -- e.g., 'Koramangala, Bengaluru' or 'Okhla, New Delhi'
    experience_years INTEGER NOT NULL DEFAULT 0 CHECK (experience_years >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for quick lookups by trade, area, and phone
CREATE INDEX IF NOT EXISTS idx_workers_trade ON public.workers(trade);
CREATE INDEX IF NOT EXISTS idx_workers_area ON public.workers(area);
CREATE INDEX IF NOT EXISTS idx_workers_phone ON public.workers(phone);

-- ==============================================================================
-- TABLE 2: SKILL_CARDS
-- Stores AI-generated skill summaries from voice interview transcripts
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.skill_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    skills TEXT[] NOT NULL DEFAULT '{}',
    level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'expert', 'needs more evidence')),
    level_reason TEXT,
    transcript TEXT,
    next_steps TEXT,
    wage_min NUMERIC(10, 2), -- Expected daily/monthly minimum in INR
    wage_max NUMERIC(10, 2), -- Expected daily/monthly maximum in INR
    wage_label TEXT DEFAULT 'Estimated daily rate • sample data',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for worker lookups
CREATE INDEX IF NOT EXISTS idx_skill_cards_worker_id ON public.skill_cards(worker_id);

-- ==============================================================================
-- TABLE 3: VOUCHES
-- One-tap endorsements from customers, co-workers, and past employers
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.vouches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
    voucher_name TEXT NOT NULL,
    voucher_phone TEXT NOT NULL,
    relationship TEXT NOT NULL CHECK (relationship IN ('customer', 'co-worker', 'employer')),
    job_date DATE NOT NULL DEFAULT CURRENT_DATE,
    would_hire_again BOOLEAN NOT NULL DEFAULT true,
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    -- RULE 1: The same voucher_phone cannot vouch for the same worker twice
    CONSTRAINT unique_worker_voucher UNIQUE (worker_id, voucher_phone)
);

CREATE INDEX IF NOT EXISTS idx_vouches_worker_id ON public.vouches(worker_id);

-- ==============================================================================
-- RULE 2: TRIGGER FUNCTION TO PREVENT A WORKER FROM VOUCHING FOR THEMSELVES
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.check_worker_self_vouch()
RETURNS TRIGGER AS $$
DECLARE
    target_worker_phone TEXT;
BEGIN
    -- Fetch the phone number of the worker being vouched for
    SELECT phone INTO target_worker_phone
    FROM public.workers
    WHERE id = NEW.worker_id;

    -- If the voucher's phone matches the worker's own phone, block the vouch
    IF target_worker_phone IS NOT NULL AND target_worker_phone = NEW.voucher_phone THEN
        RAISE EXCEPTION 'A worker cannot vouch for their own profile (worker phone: %, voucher phone: %)',
            target_worker_phone, NEW.voucher_phone;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to vouches table for INSERT and UPDATE
DROP TRIGGER IF EXISTS trg_prevent_self_vouch ON public.vouches;
CREATE TRIGGER trg_prevent_self_vouch
BEFORE INSERT OR UPDATE ON public.vouches
FOR EACH ROW
EXECUTE FUNCTION public.check_worker_self_vouch();

-- ==============================================================================
-- TABLE 4: JOBS
-- Active job listings posted by employers looking for verified trade workers
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    trade TEXT NOT NULL,
    area TEXT NOT NULL,
    pay TEXT NOT NULL, -- e.g., '₹900/day' or '₹26,000/month'
    employer_name TEXT NOT NULL,
    contact TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_jobs_trade ON public.jobs(trade);
CREATE INDEX IF NOT EXISTS idx_jobs_area ON public.jobs(area);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- For a 24-hour MVP, allow anonymous read and insert so the app works seamlessly
-- ==============================================================================
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all 4 tables
CREATE POLICY "Allow public read on workers" ON public.workers FOR SELECT USING (true);
CREATE POLICY "Allow public read on skill_cards" ON public.skill_cards FOR SELECT USING (true);
CREATE POLICY "Allow public read on vouches" ON public.vouches FOR SELECT USING (true);
CREATE POLICY "Allow public read on jobs" ON public.jobs FOR SELECT USING (true);

-- Allow public insert access for onboarding & vouching in MVP
CREATE POLICY "Allow public insert on workers" ON public.workers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on skill_cards" ON public.skill_cards FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on vouches" ON public.vouches FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on jobs" ON public.jobs FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- DEMO SEED DATA FOR BENGALURU
-- NOTE: The following records are DEMO DATA for Bengaluru areas to showcase
-- the verified worker directory (/find) and the local job board (/jobs).
-- Contains 8 workers, 8 vouches, and 6 jobs.
-- ==============================================================================
DO $$
DECLARE
    w1 UUID; w2 UUID; w3 UUID; w4 UUID;
    w5 UUID; w6 UUID; w7 UUID; w8 UUID;
BEGIN
    -- 1. Ramesh Kumar (Plumber, Koramangala, Expert, 7 yrs exp)
    INSERT INTO public.workers (name, phone, trade, language, area, experience_years)
    VALUES ('Ramesh Kumar', '9876543210', 'Plumber', 'kn-IN', 'Koramangala, Bengaluru', 7)
    ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO w1;

    DELETE FROM public.skill_cards WHERE worker_id = w1;
    INSERT INTO public.skill_cards (worker_id, summary, skills, level, level_reason, transcript, next_steps, wage_min, wage_max, wage_label)
    VALUES (w1, '7 वर्षों के अनुभव के साथ CPVC और UPVC कंसील्ड पाइप फिटिंग और लीकेज रिपेयर के कुशल कारीगर हैं। बूस्टर पंप और सेनेटरी वेयर इंस्टॉलेशन में दक्ष हैं।',
            ARRAY['Concealed Pipe Fitting', 'Leak Detection', 'Sanitary Ware Installation', 'Booster Pump Setup', 'Drainage Clearing'],
            'expert', 'Accurately answered high-pressure fault diagnosis, wall leakage tracing, and dual-pipeline isolation safety.',
            'Voice interview in Kannada & Hindi.', 'Explore solar water heater closed-loop integration and apply for RPL PMKVY Level 4.', 850, 1250, '₹850 - ₹1,250/day • sample data');

    DELETE FROM public.vouches WHERE worker_id = w1;
    INSERT INTO public.vouches (worker_id, voucher_name, voucher_phone, relationship, job_date, would_hire_again, comment)
    VALUES (w1, 'Ananya Sharma', '9123456780', 'customer', CURRENT_DATE - INTERVAL '15 days', true, 'Fixed underground pipe leakage in bathroom within 2 hours. Very clean work!'),
           (w1, 'Shiva Construction', '9988776655', 'employer', CURRENT_DATE - INTERVAL '28 days', true, 'Reliable lead plumber on our villa project in HSR Layout.');

    -- 2. Suresh Gowda (Electrician, Indiranagar, Intermediate, 5 yrs exp)
    INSERT INTO public.workers (name, phone, trade, language, area, experience_years)
    VALUES ('Suresh Gowda', '9845112233', 'Electrician', 'kn-IN', 'Indiranagar, Bengaluru', 5)
    ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO w2;

    DELETE FROM public.skill_cards WHERE worker_id = w2;
    INSERT INTO public.skill_cards (worker_id, summary, skills, level, level_reason, transcript, next_steps, wage_min, wage_max, wage_label)
    VALUES (w2, 'ಮನೆ ಮತ್ತು ಕಚೇರಿ ವೈರಿಂಗ್, ಎಂಸಿಬಿ ಟ್ರಿಪ್ ಸಮಸ್ಯೆಗಳು ಮತ್ತು ಇನ್ವರ್ಟರ್ ಬ್ಯಾಟರಿ ಸಂಪರ್ಕದಲ್ಲಿ 5 ವರ್ಷಗಳ ಅನುಭವ ಹೊಂದಿರುವ ನುರಿತ ಎಲೆಕ್ಟ್ರಿಷಿಯನ್.',
            ARRAY['DB Box Wiring', 'MCB Short-Circuit Repair', 'Inverter Battery Setup', 'Ceiling Fan Capacitors', 'Conduit Pipe Pulling'],
            'intermediate', 'Demonstrated precise knowledge of fan regulator capacitor checks, neutral wire balance, and rubber boot safety.',
            'Voice interview in Kannada.', 'Learn industrial 3-phase star-delta motor rewiring and complete ITI wireman credential.', 800, 1100, '₹800 - ₹1,100/day • sample data');

    DELETE FROM public.vouches WHERE worker_id = w2;
    INSERT INTO public.vouches (worker_id, voucher_name, voucher_phone, relationship, job_date, would_hire_again, comment)
    VALUES (w2, 'Kavita Reddy', '9845098765', 'customer', CURRENT_DATE - INTERVAL '8 days', true, 'Replaced tripped MCB board and wired 3 fans in one afternoon. Very courteous!'),
           (w2, 'Rajesh Hegde', '9448123456', 'co-worker', CURRENT_DATE - INTERVAL '20 days', true, 'Worked together on apartment lighting. Very fast conduit wiring.');

    -- 3. Manjunath K. (Carpenter, HSR Layout, Expert, 8 yrs exp)
    INSERT INTO public.workers (name, phone, trade, language, area, experience_years)
    VALUES ('Manjunath K.', '9845223344', 'Carpenter', 'kn-IN', 'HSR Layout, Bengaluru', 8)
    ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO w3;

    DELETE FROM public.skill_cards WHERE worker_id = w3;
    INSERT INTO public.skill_cards (worker_id, summary, skills, level, level_reason, transcript, next_steps, wage_min, wage_max, wage_label)
    VALUES (w3, 'Specialist in modular kitchen cabinets, teak wood door frames, hydraulic hinges, and laminate edge banding with 8 years of woodwork mastery.',
            ARRAY['Modular Kitchen Fitting', 'Hydraulic Soft-Close Hinges', 'Laminate Edge Banding', 'Solid Wood Joinery', 'Wardrobe Sliding Channels'],
            'expert', 'Flawlessly described cabinet leveling on uneven floors, millimeter hinge alignment, and safety goggles protocol.',
            'Voice interview in Kannada & English.', 'Consider CNC router CAD blueprint reading and PMKVY Level 4 interior woodwork certification.', 950, 1350, '₹950 - ₹1,350/day • sample data');

    DELETE FROM public.vouches WHERE worker_id = w3;
    INSERT INTO public.vouches (worker_id, voucher_name, voucher_phone, relationship, job_date, would_hire_again, comment)
    VALUES (w3, 'Urban Woodcraft', '9880011223', 'employer', CURRENT_DATE - INTERVAL '12 days', true, 'Master craftsman on modular wardrobe projects. Zero alignment defects.');

    -- 4. Anand Rao (Mason, Whitefield, Intermediate, 6 yrs exp)
    INSERT INTO public.workers (name, phone, trade, language, area, experience_years)
    VALUES ('Anand Rao', '9845334455', 'Mason', 'hi-IN', 'Whitefield, Bengaluru', 6)
    ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO w4;

    DELETE FROM public.skill_cards WHERE worker_id = w4;
    INSERT INTO public.skill_cards (worker_id, summary, skills, level, level_reason, transcript, next_steps, wage_min, wage_max, wage_label)
    VALUES (w4, '6 वर्षों से ईंट चिनाई, प्लास्टर फिनिशिंग, टाइल बिछाने और कंक्रीट मिक्सिंग के अनुभवी राजमिस्त्री। वाटरप्रूफिंग उपचार में दक्ष।',
            ARRAY['Brick & AAC Block Laying', 'Wall Plastering (1:4 Mix)', 'Ceramic & Vitrified Tiling', 'Waterproofing Slurry', 'Level Tube Calibration'],
            'intermediate', 'Clear explanation of sand-to-cement ratio curing times, water bubble level verification, and helmet usage.',
            'Voice interview in Hindi.', 'Learn epoxy grout application and laser self-leveling instrument operation.', 800, 1100, '₹800 - ₹1,100/day • sample data');

    DELETE FROM public.vouches WHERE worker_id = w4;
    INSERT INTO public.vouches (worker_id, voucher_name, voucher_phone, relationship, job_date, would_hire_again, comment)
    VALUES (w4, 'Vikram Builders', '9844055667', 'employer', CURRENT_DATE - INTERVAL '18 days', true, 'Built a 60-foot compound wall with flawless straight line plaster. Very dedicated.');

    -- 5. Venkatesh M. (Painter, Jayanagar, Intermediate, 4 yrs exp)
    INSERT INTO public.workers (name, phone, trade, language, area, experience_years)
    VALUES ('Venkatesh M.', '9845445566', 'Painter', 'kn-IN', 'Jayanagar, Bengaluru', 4)
    ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO w5;

    DELETE FROM public.skill_cards WHERE worker_id = w5;
    INSERT INTO public.skill_cards (worker_id, summary, skills, level, level_reason, transcript, next_steps, wage_min, wage_max, wage_label)
    VALUES (w5, 'ಪುಟ್ಟಿ ಫಿನಿಶಿಂಗ್, ಎಮಲ್ಷನ್ ರೋಲರ್ ಪೇಂಟಿಂಗ್ ಮತ್ತು ವಾಟರ್‌ಪ್ರೂಫ್ ಪ್ರೈಮರ್ ಹಚ್ಚುವಲ್ಲಿ 4 ವರ್ಷಗಳ ಅನುಭವವಿರುವ ಪೇಂಟರ್.',
            ARRAY['Wall Putty Smoothing', 'Roller Emulsion Application', 'Exterior Weathercoat Primer', 'Stencil Accent Walls', 'Sanding Protocol'],
            'intermediate', 'Detailed description of two-coat putty drying times, masking tape application, and ladder stabilizer safety.',
            'Voice interview in Kannada.', 'Learn airless spray gun painting techniques and textured stucco plaster finishes.', 750, 1000, '₹750 - ₹1,000/day • sample data');

    DELETE FROM public.vouches WHERE worker_id = w5;
    INSERT INTO public.vouches (worker_id, voucher_name, voucher_phone, relationship, job_date, would_hire_again, comment)
    VALUES (w5, 'Pooja Nair', '9900112233', 'customer', CURRENT_DATE - INTERVAL '14 days', true, 'Painted our entire 2BHK flat. No spills on floor tiles, smooth finish!');

    -- 6. Mohammed Rafiq (Welder, Electronic City, Expert, 9 yrs exp)
    INSERT INTO public.workers (name, phone, trade, language, area, experience_years)
    VALUES ('Mohammed Rafiq', '9845556677', 'Welder', 'hi-IN', 'Electronic City, Bengaluru', 9)
    ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO w6;

    DELETE FROM public.skill_cards WHERE worker_id = w6;
    INSERT INTO public.skill_cards (worker_id, summary, skills, level, level_reason, transcript, next_steps, wage_min, wage_max, wage_label)
    VALUES (w6, '9 वर्षों के अनुभव के साथ MS और SS आर्गन/ARC वेल्डिंग, गेट्स, रेलिंग, शेड्स और इंडस्ट्रियल स्ट्रक्चरल फैब्रिकेशन के विशेषज्ञ।',
            ARRAY['ARC & MIG Welding', 'Stainless Steel Railings', 'Sliding Gate Fabrication', 'Structural Truss Joints', 'Grinding & Beveling'],
            'expert', 'Thoroughly answered joint penetration tests, amperage settings per thickness, and DIN 11 welding helmet eye safety.',
            'Voice interview in Hindi.', 'Prepare for TIG high-pressure pipeline 6G certification (IBR approved).', 900, 1300, '₹900 - ₹1,300/day • sample data');

    DELETE FROM public.vouches WHERE worker_id = w6;
    INSERT INTO public.vouches (worker_id, voucher_name, voucher_phone, relationship, job_date, would_hire_again, comment)
    VALUES (w6, 'Bangalore Fabrication', '9845998877', 'employer', CURRENT_DATE - INTERVAL '22 days', true, 'Fabricated 40-foot warehouse sliding gate. Solid, heavy welds with zero crack issues.');

    -- 7. Shiva Prasad (Mechanic, BTM Layout, Beginner, 3 yrs exp)
    INSERT INTO public.workers (name, phone, trade, language, area, experience_years)
    VALUES ('Shiva Prasad', '9845667788', 'Mechanic', 'kn-IN', 'BTM Layout, Bengaluru', 3)
    ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO w7;

    DELETE FROM public.skill_cards WHERE worker_id = w7;
    INSERT INTO public.skill_cards (worker_id, summary, skills, level, level_reason, transcript, next_steps, wage_min, wage_max, wage_label)
    VALUES (w7, 'ಟೂ-ವೀಲರ್ ಆಯಿಲ್ ಚೇಂಜ್, ಬ್ರೇಕ್ ಶೂ ರಿಪ್ಲೇಸ್‌ಮೆಂಟ್ ಮತ್ತು ಕಾರ್ಬ್ಯುರೇಟರ್ ಟ್ಯೂನಿಂಗ್‌ನಲ್ಲಿ 3 ವರ್ಷಗಳ ಗ್ಯಾರೇಜ್ ಅನುಭವ.',
            ARRAY['Two-Wheeler Servicing', 'Brake Pad Replacement', 'Engine Oil Flushing', 'Spark Plug Cleaning', 'Battery Voltage Check'],
            'beginner', 'Answered basic scooter maintenance procedures correctly; needs more diagnostics practice with electronic fuel injection.',
            'Voice interview in Kannada.', 'Enroll in OBD-II diagnostic tool training for BS-VI computerized scooters and bikes.', 600, 850, '₹600 - ₹850/day • sample data');

    -- 8. Basavaraj N. (Plumber, Malleshwaram, Needs More Evidence, 2 yrs exp)
    INSERT INTO public.workers (name, phone, trade, language, area, experience_years)
    VALUES ('Basavaraj N.', '9845778899', 'Plumber', 'kn-IN', 'Malleshwaram, Bengaluru', 2)
    ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO w8;

    DELETE FROM public.skill_cards WHERE worker_id = w8;
    INSERT INTO public.skill_cards (worker_id, summary, skills, level, level_reason, transcript, next_steps, wage_min, wage_max, wage_label)
    VALUES (w8, 'ಮಲ್ಲೇಶ್ವರಂ ಸುತ್ತಮುತ್ತಲಿನ ಮನೆಗಳಲ್ಲಿ ನಲ್ಲಿ ಲೀಕ್ ರಿಪೇರಿ ಮತ್ತು ಸಿಂಕ್ ಪೈಪ್ ಜೋಡಣೆಯಲ್ಲಿ ಸಹಾಯಕ ಪ್ಲಂಬರ್ ಆಗಿ 2 ವರ್ಷಗಳ ಅನುಭವ.',
            ARRAY['Tap Washer Replacement', 'PVC Waste Pipe Clearing', 'Teflon Tape Sealing'],
            'needs more evidence', 'Spoken answers covered only simple tap leaks; more hands-on evidence needed for concealed wall piping.',
            'Voice interview in Kannada.', 'Take a structured 1-month practical workshop on concealed CPVC hot water lines and re-take the assessment.', 500, 750, '₹500 - ₹750/day • sample data');

    -- SEED 6 SAMPLE JOBS FOR BENGALURU
    DELETE FROM public.jobs WHERE contact IN ('9845012345', '9845023456', '9845034567', '9845045678', '9845056789', '9845067890');
    INSERT INTO public.jobs (title, trade, area, pay, employer_name, contact)
    VALUES
        ('Urgent Plumber for Villa Piping', 'Plumber', 'Whitefield, Bengaluru', '₹1,100/day', 'Prestige Greens Villas', '9845012345'),
        ('Electrician for 3BHK Renovation', 'Electrician', 'Indiranagar, Bengaluru', '₹950/day', 'Nexus Interiors', '9845023456'),
        ('Lead Carpenter for Modular Kitchens', 'Carpenter', 'HSR Layout, Bengaluru', '₹1,200/day', 'HomeCraft Studios', '9845034567'),
        ('Mason for Compound Wall Construction', 'Mason', 'Electronic City, Bengaluru', '₹900/day', 'KBR Infra Projects', '9845045678'),
        ('Interior Painter for Duplex Villa', 'Painter', 'Koramangala, Bengaluru', '₹850/day', 'ColorZone Homes', '9845056789'),
        ('Structural Welder for Warehouse Gate', 'Welder', 'BTM Layout, Bengaluru', '₹1,050/day', 'Deccan Steel Works', '9845067890');
END $$;
