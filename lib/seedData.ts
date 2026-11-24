// ==============================================================================
// HUNAR PASS - SEED & DEMO DATA FOR BENGALURU
// Contains 8 realistic sample workers, 8 sample customer vouches, and 6 sample jobs.
// Clearly marked as DEMO DATA for hackathon demonstration.
// ==============================================================================

import { WorkerWithDetails, Job, TradeType } from '@/types/database';

export const IS_DEMO_DATA_NOTICE = 'Sample data for Bengaluru demonstration • All phone numbers & reviews are simulated';

export const BENGALURU_AREAS = [
  'All Areas',
  'Koramangala, Bengaluru',
  'Indiranagar, Bengaluru',
  'Whitefield, Bengaluru',
  'HSR Layout, Bengaluru',
  'Jayanagar, Bengaluru',
  'BTM Layout, Bengaluru',
  'Malleshwaram, Bengaluru',
  'Electronic City, Bengaluru',
];

export const DEMO_WORKERS: WorkerWithDetails[] = [
  // 1. Ramesh Kumar - Plumber (Expert, 2 vouches)
  {
    id: 'worker-ramesh-kumar',
    name: 'Ramesh Kumar',
    phone: '9876543210',
    trade: 'Plumber',
    language: 'kn-IN',
    area: 'Koramangala, Bengaluru',
    experience_years: 7,
    created_at: '2026-10-01T10:00:00Z',
    skill_card: {
      id: 'sc-ramesh',
      worker_id: 'worker-ramesh-kumar',
      summary: '7 वर्षों के अनुभव के साथ CPVC और UPVC कंसील्ड पाइप फिटिंग और लीकेज रिपेयर के कुशल कारीगर हैं। बूस्टर पंप और सेनेटरी वेयर इंस्टॉलेशन में दक्ष हैं।',
      skills: ['Concealed Pipe Fitting', 'Leak Detection', 'Sanitary Ware Installation', 'Booster Pump Setup', 'Drainage Clearing'],
      level: 'expert',
      level_reason: 'Accurately answered high-pressure fault diagnosis, wall leakage tracing, and dual-pipeline isolation safety.',
      transcript: 'Voice interview in Kannada & Hindi.',
      next_steps: 'Explore solar water heater closed-loop integration and apply for RPL PMKVY Level 4 plumbing certificate.',
      wage_min: 850,
      wage_max: 1250,
      wage_label: '₹850 - ₹1,250/day (Estimated rate for Koramangala • sample data)',
      created_at: '2026-10-01T10:15:00Z',
    },
    vouches: [
      {
        id: 'vouch-1',
        worker_id: 'worker-ramesh-kumar',
        voucher_name: 'Ananya Sharma',
        voucher_phone: '9123456780',
        relationship: 'customer',
        job_date: '2026-10-15',
        would_hire_again: true,
        comment: 'Fixed underground pipe leakage in bathroom within 2 hours. Very clean and punctual work!',
        created_at: '2026-10-16T12:00:00Z',
      },
      {
        id: 'vouch-2',
        worker_id: 'worker-ramesh-kumar',
        voucher_name: 'Shiva Construction',
        voucher_phone: '9988776655',
        relationship: 'employer',
        job_date: '2026-10-28',
        would_hire_again: true,
        comment: 'Reliable lead plumber on our 12-unit residential villa project in HSR Layout.',
        created_at: '2026-10-29T14:30:00Z',
      },
    ],
  },

  // 2. Suresh Gowda - Electrician (Intermediate, 2 vouches)
  {
    id: 'worker-suresh-gowda',
    name: 'Suresh Gowda',
    phone: '9845112233',
    trade: 'Electrician',
    language: 'kn-IN',
    area: 'Indiranagar, Bengaluru',
    experience_years: 5,
    created_at: '2026-10-05T09:30:00Z',
    skill_card: {
      id: 'sc-suresh',
      worker_id: 'worker-suresh-gowda',
      summary: 'ಮನೆ ಮತ್ತು ಕಚೇರಿ ವೈರಿಂಗ್, ಎಂಸಿಬಿ ಟ್ರಿಪ್ ಸಮಸ್ಯೆಗಳು ಮತ್ತು ಇನ್ವರ್ಟರ್ ಬ್ಯಾಟರಿ ಸಂಪರ್ಕದಲ್ಲಿ 5 ವರ್ಷಗಳ ಅನುಭವ ಹೊಂದಿರುವ ನುರಿತ ಎಲೆಕ್ಟ್ರಿಷಿಯನ್.',
      skills: ['DB Box Wiring', 'MCB Short-Circuit Repair', 'Inverter Battery Setup', 'Ceiling Fan Capacitors', 'Conduit Pipe Pulling'],
      level: 'intermediate',
      level_reason: 'Demonstrated precise knowledge of fan regulator capacitor checks, neutral wire balance, and rubber boot safety.',
      transcript: 'Voice interview conducted in Kannada.',
      next_steps: 'Learn industrial 3-phase star-delta motor rewiring and complete ITI wireman credential.',
      wage_min: 800,
      wage_max: 1100,
      wage_label: '₹800 - ₹1,100/day (Estimated rate for Indiranagar • sample data)',
      created_at: '2026-10-05T10:00:00Z',
    },
    vouches: [
      {
        id: 'vouch-3',
        worker_id: 'worker-suresh-gowda',
        voucher_name: 'Kavita Reddy',
        voucher_phone: '9845098765',
        relationship: 'customer',
        job_date: '2026-11-02',
        would_hire_again: true,
        comment: 'Replaced tripped MCB board and wired 3 fans in one afternoon. Very courteous!',
        created_at: '2026-11-03T11:00:00Z',
      },
      {
        id: 'vouch-4',
        worker_id: 'worker-suresh-gowda',
        voucher_name: 'Rajesh Hegde',
        voucher_phone: '9448123456',
        relationship: 'co-worker',
        job_date: '2026-11-10',
        would_hire_again: true,
        comment: 'Worked together on apartment lighting. Very fast conduit wiring.',
        created_at: '2026-11-11T16:00:00Z',
      },
    ],
  },

  // 3. Manjunath K. - Carpenter (Expert, 1 vouch)
  {
    id: 'worker-manjunath-k',
    name: 'Manjunath K.',
    phone: '9845223344',
    trade: 'Carpenter',
    language: 'kn-IN',
    area: 'HSR Layout, Bengaluru',
    experience_years: 8,
    created_at: '2026-10-10T08:00:00Z',
    skill_card: {
      id: 'sc-manjunath',
      worker_id: 'worker-manjunath-k',
      summary: 'Specialist in modular kitchen cabinets, teak wood door frames, hydraulic hinges, and laminate edge banding with 8 years of woodwork mastery.',
      skills: ['Modular Kitchen Fitting', 'Hydraulic Soft-Close Hinges', 'Laminate Edge Banding', 'Solid Wood Joinery', 'Wardrobe Sliding Channels'],
      level: 'expert',
      level_reason: 'Flawlessly described cabinet leveling on uneven floors, millimeter hinge alignment, and dust mask/safety goggles protocol.',
      transcript: 'Voice interview in Kannada & English.',
      next_steps: 'Consider CNC router CAD blueprint reading and PMKVY Level 4 interior woodwork certification.',
      wage_min: 950,
      wage_max: 1350,
      wage_label: '₹950 - ₹1,350/day (Estimated rate for HSR Layout • sample data)',
      created_at: '2026-10-10T08:30:00Z',
    },
    vouches: [
      {
        id: 'vouch-5',
        worker_id: 'worker-manjunath-k',
        voucher_name: 'Urban Woodcraft',
        voucher_phone: '9880011223',
        relationship: 'employer',
        job_date: '2026-10-25',
        would_hire_again: true,
        comment: 'Master craftsman on modular wardrobe projects. Zero alignment defects.',
        created_at: '2026-10-26T10:00:00Z',
      },
    ],
  },

  // 4. Anand Rao - Mason (Intermediate, 1 vouch)
  {
    id: 'worker-anand-rao',
    name: 'Anand Rao',
    phone: '9845334455',
    trade: 'Mason',
    language: 'hi-IN',
    area: 'Whitefield, Bengaluru',
    experience_years: 6,
    created_at: '2026-10-12T11:00:00Z',
    skill_card: {
      id: 'sc-anand',
      worker_id: 'worker-anand-rao',
      summary: '6 वर्षों से ईंट चिनाई, प्लास्टर फिनिशिंग, टाइल बिछाने और कंक्रीट मिक्सिंग के अनुभवी राजमिस्त्री। वाटरप्रूफिंग उपचार में दक्ष।',
      skills: ['Brick & AAC Block Laying', 'Wall Plastering (1:4 Mix)', 'Ceramic & Vitrified Tiling', 'Waterproofing Slurry', 'Level Tube Calibration'],
      level: 'intermediate',
      level_reason: 'Clear explanation of sand-to-cement ratio curing times, water bubble level verification, and safety helmet usage.',
      transcript: 'Voice interview in Hindi.',
      next_steps: 'Learn epoxy grout application and laser self-leveling instrument operation.',
      wage_min: 800,
      wage_max: 1100,
      wage_label: '₹800 - ₹1,100/day (Estimated rate for Whitefield • sample data)',
      created_at: '2026-10-12T11:30:00Z',
    },
    vouches: [
      {
        id: 'vouch-6',
        worker_id: 'worker-anand-rao',
        voucher_name: 'Vikram Builders',
        voucher_phone: '9844055667',
        relationship: 'employer',
        job_date: '2026-11-05',
        would_hire_again: true,
        comment: 'Built a 60-foot compound wall with flawless straight line plaster. Very dedicated.',
        created_at: '2026-11-06T15:00:00Z',
      },
    ],
  },

  // 5. Venkatesh M. - Painter (Intermediate, 1 vouch)
  {
    id: 'worker-venkatesh-m',
    name: 'Venkatesh M.',
    phone: '9845445566',
    trade: 'Painter',
    language: 'kn-IN',
    area: 'Jayanagar, Bengaluru',
    experience_years: 4,
    created_at: '2026-10-15T14:00:00Z',
    skill_card: {
      id: 'sc-venkatesh',
      worker_id: 'worker-venkatesh-m',
      summary: 'ಪುಟ್ಟಿ ಫಿನಿಶಿಂಗ್, ಎಮಲ್ಷನ್ ರೋಲರ್ ಪೇಂಟಿಂಗ್ ಮತ್ತು ವಾಟರ್‌ಪ್ರೂಫ್ ಪ್ರೈಮರ್ ಹಚ್ಚುವಲ್ಲಿ 4 ವರ್ಷಗಳ ಅನುಭವವಿರುವ ಪೇಂಟರ್.',
      skills: ['Wall Putty Smoothing', 'Roller Emulsion Application', 'Exterior Weathercoat Primer', 'Stencil Accent Walls', 'Sanding Protocol'],
      level: 'intermediate',
      level_reason: 'Detailed description of two-coat putty drying times, masking tape application, and ladder stabilizer safety.',
      transcript: 'Voice interview in Kannada.',
      next_steps: 'Learn airless spray gun painting techniques and textured stucco plaster finishes.',
      wage_min: 750,
      wage_max: 1000,
      wage_label: '₹750 - ₹1,000/day (Estimated rate for Jayanagar • sample data)',
      created_at: '2026-10-15T14:30:00Z',
    },
    vouches: [
      {
        id: 'vouch-7',
        worker_id: 'worker-venkatesh-m',
        voucher_name: 'Pooja Nair',
        voucher_phone: '9900112233',
        relationship: 'customer',
        job_date: '2026-11-08',
        would_hire_again: true,
        comment: 'Painted our entire 2BHK flat. No spills on floor tiles, smooth finish!',
        created_at: '2026-11-09T09:00:00Z',
      },
    ],
  },

  // 6. Mohammed Rafiq - Welder (Expert, 1 vouch)
  {
    id: 'worker-mohammed-rafiq',
    name: 'Mohammed Rafiq',
    phone: '9845556677',
    trade: 'Welder',
    language: 'hi-IN',
    area: 'Electronic City, Bengaluru',
    experience_years: 9,
    created_at: '2026-10-18T12:00:00Z',
    skill_card: {
      id: 'sc-rafiq',
      worker_id: 'worker-mohammed-rafiq',
      summary: '9 वर्षों के अनुभव के साथ MS और SS आर्गन/ARC वेल्डिंग, गेट्स, रेलिंग, शेड्स और इंडस्ट्रियल स्ट्रक्चरल फैब्रिकेशन के विशेषज्ञ।',
      skills: ['ARC & MIG Welding', 'Stainless Steel Railings', 'Sliding Gate Fabrication', 'Structural Truss Joints', 'Grinding & Beveling'],
      level: 'expert',
      level_reason: 'Thoroughly answered joint penetration tests, amperage settings per thickness, and DIN 11 welding helmet eye safety.',
      transcript: 'Voice interview in Hindi.',
      next_steps: 'Prepare for TIG high-pressure pipeline 6G certification (IBR approved).',
      wage_min: 900,
      wage_max: 1300,
      wage_label: '₹900 - ₹1,300/day (Estimated rate for Electronic City • sample data)',
      created_at: '2026-10-18T12:30:00Z',
    },
    vouches: [
      {
        id: 'vouch-8',
        worker_id: 'worker-mohammed-rafiq',
        voucher_name: 'Bangalore Fabrication',
        voucher_phone: '9845998877',
        relationship: 'employer',
        job_date: '2026-11-12',
        would_hire_again: true,
        comment: 'Fabricated 40-foot warehouse sliding gate. Solid, heavy welds with zero crack issues.',
        created_at: '2026-11-13T18:00:00Z',
      },
    ],
  },

  // 7. Shiva Prasad - Mechanic (Beginner, 0 vouches)
  {
    id: 'worker-shiva-prasad',
    name: 'Shiva Prasad',
    phone: '9845667788',
    trade: 'Mechanic',
    language: 'kn-IN',
    area: 'BTM Layout, Bengaluru',
    experience_years: 3,
    created_at: '2026-10-22T15:00:00Z',
    skill_card: {
      id: 'sc-shiva',
      worker_id: 'worker-shiva-prasad',
      summary: 'ಟೂ-ವೀಲರ್ ಆಯಿಲ್ ಚೇಂಜ್, ಬ್ರೇಕ್ ಶೂ ರಿಪ್ಲೇಸ್‌ಮೆಂಟ್ ಮತ್ತು ಕಾರ್ಬ್ಯುರೇಟರ್ ಟ್ಯೂನಿಂಗ್‌ನಲ್ಲಿ 3 ವರ್ಷಗಳ ಗ್ಯಾರೇಜ್ ಅನುಭವ.',
      skills: ['Two-Wheeler Servicing', 'Brake Pad Replacement', 'Engine Oil Flushing', 'Spark Plug Cleaning', 'Battery Voltage Check'],
      level: 'beginner',
      level_reason: 'Answered basic scooter maintenance procedures correctly; needs more diagnostics practice with electronic fuel injection.',
      transcript: 'Voice interview in Kannada.',
      next_steps: 'Enroll in OBD-II diagnostic tool training for BS-VI computerized scooters and bikes.',
      wage_min: 600,
      wage_max: 850,
      wage_label: '₹600 - ₹850/day (Estimated rate for BTM Layout • sample data)',
      created_at: '2026-10-22T15:30:00Z',
    },
    vouches: [],
  },

  // 8. Basavaraj N. - Plumber (Needs more evidence, 0 vouches)
  {
    id: 'worker-basavaraj-n',
    name: 'Basavaraj N.',
    phone: '9845778899',
    trade: 'Plumber',
    language: 'kn-IN',
    area: 'Malleshwaram, Bengaluru',
    experience_years: 2,
    created_at: '2026-10-25T16:00:00Z',
    skill_card: {
      id: 'sc-basavaraj',
      worker_id: 'worker-basavaraj-n',
      summary: 'ಮಲ್ಲೇಶ್ವರಂ ಸುತ್ತಮುತ್ತಲಿನ ಮನೆಗಳಲ್ಲಿ ನಲ್ಲಿ ಲೀಕ್ ರಿಪೇರಿ ಮತ್ತು ಸಿಂಕ್ ಪೈಪ್ ಜೋಡಣೆಯಲ್ಲಿ ಸಹಾಯಕ ಪ್ಲಂಬರ್ ಆಗಿ 2 ವರ್ಷಗಳ ಅನುಭವ.',
      skills: ['Tap Washer Replacement', 'PVC Waste Pipe Clearing', 'Teflon Tape Sealing'],
      level: 'needs more evidence',
      level_reason: 'Spoken answers covered only simple tap leaks; more hands-on evidence needed for concealed wall piping.',
      transcript: 'Voice interview in Kannada.',
      next_steps: 'Take a structured 1-month practical workshop on concealed CPVC hot water lines and re-take the voice assessment.',
      wage_min: 500,
      wage_max: 750,
      wage_label: '₹500 - ₹750/day (Estimated rate for Malleshwaram • sample data)',
      created_at: '2026-10-25T16:30:00Z',
    },
    vouches: [],
  },
];

export const DEMO_JOBS: Job[] = [
  {
    id: 'job-blr-1',
    title: 'Urgent Plumber for Villa Piping',
    trade: 'Plumber',
    area: 'Whitefield, Bengaluru',
    pay: '₹1,100/day',
    employer_name: 'Prestige Greens Villas',
    contact: '9845012345',
    created_at: '2026-11-20T10:00:00Z',
  },
  {
    id: 'job-blr-2',
    title: 'Electrician for 3BHK Renovation',
    trade: 'Electrician',
    area: 'Indiranagar, Bengaluru',
    pay: '₹950/day',
    employer_name: 'Nexus Interiors',
    contact: '9845023456',
    created_at: '2026-11-21T11:30:00Z',
  },
  {
    id: 'job-blr-3',
    title: 'Lead Carpenter for Modular Kitchens',
    trade: 'Carpenter',
    area: 'HSR Layout, Bengaluru',
    pay: '₹1,200/day',
    employer_name: 'HomeCraft Studios',
    contact: '9845034567',
    created_at: '2026-11-22T09:00:00Z',
  },
  {
    id: 'job-blr-4',
    title: 'Mason for Compound Wall Construction',
    trade: 'Mason',
    area: 'Electronic City, Bengaluru',
    pay: '₹900/day',
    employer_name: 'KBR Infra Projects',
    contact: '9845045678',
    created_at: '2026-11-22T14:15:00Z',
  },
  {
    id: 'job-blr-5',
    title: 'Interior Painter for Duplex Villa',
    trade: 'Painter',
    area: 'Koramangala, Bengaluru',
    pay: '₹850/day',
    employer_name: 'ColorZone Homes',
    contact: '9845056789',
    created_at: '2026-11-23T08:45:00Z',
  },
  {
    id: 'job-blr-6',
    title: 'Structural Welder for Warehouse Gate',
    trade: 'Welder',
    area: 'BTM Layout, Bengaluru',
    pay: '₹1,050/day',
    employer_name: 'Deccan Steel Works',
    contact: '9845067890',
    created_at: '2026-11-24T07:30:00Z',
  },
];

// Helper to return demo workers sorted with verified-and-vouched workers first
export function getSortedDemoWorkers(tradeFilter: string = 'All', areaFilter: string = 'All Areas'): WorkerWithDetails[] {
  let list = [...DEMO_WORKERS];

  if (tradeFilter !== 'All') {
    list = list.filter((w) => w.trade.toLowerCase() === tradeFilter.toLowerCase());
  }

  if (areaFilter !== 'All Areas') {
    list = list.filter((w) => w.area.toLowerCase().includes(areaFilter.toLowerCase().replace(', bengaluru', '')));
  }

  // Ranking logic:
  // 1. Has vouches (vouch count > 0) comes first
  // 2. Highest vouch count descending
  // 3. Skill level weight: expert (3) > intermediate (2) > beginner (1) > needs more evidence (0)
  // 4. Experience years descending
  const levelScore: Record<string, number> = {
    expert: 3,
    intermediate: 2,
    beginner: 1,
    'needs more evidence': 0,
  };

  list.sort((a, b) => {
    const aVouches = a.vouches?.length || 0;
    const bVouches = b.vouches?.length || 0;

    // Rule: Vouched workers first
    if ((aVouches > 0) !== (bVouches > 0)) {
      return aVouches > 0 ? -1 : 1;
    }

    // Then more vouches first
    if (aVouches !== bVouches) {
      return bVouches - aVouches;
    }

    // Then skill level
    const aLevel = levelScore[a.skill_card?.level || 'beginner'] ?? 1;
    const bLevel = levelScore[b.skill_card?.level || 'beginner'] ?? 1;
    if (aLevel !== bLevel) {
      return bLevel - aLevel;
    }

    // Then experience
    return b.experience_years - a.experience_years;
  });

  return list;
}
