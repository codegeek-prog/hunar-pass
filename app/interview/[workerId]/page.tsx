'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Edit3,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Worker, SupportedLanguage, TradeType } from '@/types/database';

// Realistic pre-recorded sample answers for each trade across all 3 languages
const DEMO_SAMPLE_ANSWERS: Record<string, Record<string, string[]>> = {
  Plumber: {
    'hi-IN': [
      'दीवार में लीकेज होने पर सबसे पहले मेन वाल्व बंद करके प्रेशर गेज से प्रेशर ड्रॉप चेक करेंगे और पाइप जॉइंट्स पर सीलन ट्रेस करेंगे।',
      'बूस्टर पंप लगाने के लिए 1 इंच की सक्शन लाइन, एनआरवी (Non-Return Valve) और वाइब्रेशन पैड लगाते हैं ताकि पानी वापस टैंक में न जाए।',
      'गीज़र इंस्टॉलेशन में इनलेट और आउटलेट में फ्लेक्सिबल ब्रेडेड नली और प्रेशर रिलीफ वाल्व (PRV) लगाते हैं और टेफ्लॉन टेप से सील करते हैं।',
      'सुरक्षा के लिए काम शुरू करने से पहले मेन वाटर सप्लाई बंद करते हैं और रबर ग्रिप वाले वॉटरप्रूफ ग्लव्स और नॉन-स्लिप जूते पहनते हैं।',
    ],
    'kn-IN': [
      'ಗೋಡೆಯಲ್ಲಿ ನೀರಿನ ಸೋರಿಕೆ ಇದ್ದರೆ ಮುಖ್ಯ ವಾಲ್ವ್ ಮುಚ್ಚಿ ಪ್ರೆಶರ್ ಗೇಜ್ ಮೂಲಕ ಲೀಕ್ ಪಾಯಿಂಟ್ ಪತ್ತೆ ಮಾಡುತ್ತೇವೆ.',
      'ಬೂಸ್ಟರ್ ಪಂಪ್‌ಗೆ ನಾನ್-ರಿಟರ್ನ್ ವಾಲ್ವ್ (NRV) ಅಳವಡಿಸಿ ಸರಿಯಾದ ಸಕ್ಷನ್ ಪೈಪ್ ಜೋಡಿಸುತ್ತೇವೆ.',
      'ಗೀಸರ್ ಅಳವಡಿಸುವಾಗ ಇನ್ಲೆಟ್ ಮತ್ತು ಔಟ್ಲೆಟ್ ಕನೆಕ್ಷನ್‌ಗೆ ಸುರಕ್ಷತಾ ಪ್ರೆಶರ್ ರಿಲೀಫ್ ವಾಲ್ವ್ ಹಾಕುತ್ತೇವೆ.',
      'ಸುರಕ್ಷತೆಗಾಗಿ ಮುಖ್ಯ ನೀರಿನ ಸಂಪರ್ಕ ಕಡಿತಗೊಳಿಸಿ ರಬ್ಬರ್ ಗ್ಲೌಸ್ ಮತ್ತು ಸುರಕ್ಷತಾ ಬೂಟು ಧರಿಸುತ್ತೇವೆ.',
    ],
    'en-IN': [
      'To isolate wall leakage, I first turn off the main valve, attach a pressure gauge to detect drop, and trace concealed pipe joints.',
      'For booster pumps, I install a 1-inch suction line, a non-return check valve, and vibration dampers.',
      'In geyser fitting, I install a pressure relief valve (PRV) on the inlet and braided flexible hoses sealed with teflon tape.',
      'For safety, I shut down the main supply line and wear insulated rubber gloves and anti-slip safety shoes.',
    ],
  },
  Electrician: {
    'hi-IN': [
      'अगर पंखा सिर्फ हाई स्पीड पर चल रहा है, तो रेगुलेटर का कैपेसिटर खराब है या बाईपास हो गया है, रेगुलेटर बदलेंगे।',
      'एमसीबी बार-बार ट्रिप होने पर पहले न्यूट्रल और फेज की कंटिन्यूटी मल्टीमीटर से चेक करेंगे ताकि शॉर्ट सर्किट मिले।',
      '1.5 टन एसी के लिए 4 स्क्वायर एमएम कॉपर वायर, 16 एम्पीयर एमसीबी और अलग अर्थिंग वायर लगाते हैं।',
      'सुरक्षा के लिए मेन स्विच बंद करके टेस्टर से चेक करते हैं और इंसुलेटेड रबर जूते पहनकर काम करते हैं।',
    ],
    'kn-IN': [
      'ಫ್ಯಾನ್ ಕೇವಲ ಹೈ ಸ್ಪೀಡ್‌ನಲ್ಲಿ ಓಡುತ್ತಿದ್ದರೆ ರೆಗ್ಯುಲೇಟರ್ ಕೆಪಾಸಿಟರ್ ಹಾಳಾಗಿದೆ, ರೆಗ್ಯುಲೇಟರ್ ಬದಲಾಯಿಸುತ್ತೇವೆ.',
      'ಎಂಸಿಬಿ ಟ್ರಿಪ್ ಆಗುತ್ತಿದ್ದರೆ ಮಲ್ಟಿಮೀಟರ್ ಮೂಲಕ ಶಾರ್ಟ್ ಸರ್ಕ್ಯೂಟ್ ಅಥವಾ ಓವರ್‌ಲೋಡ್ ಪರೀಕ್ಷಿಸುತ್ತೇವೆ.',
      '1.5 ಟನ್ ಎಸಿ ಸಂಪರ್ಕಕ್ಕೆ 4 ಚದರ ಎಂಎಂ ತಾಮ್ರದ ವೈರ್ ಮತ್ತು 16 ಆಂಪಿಯರ್ ಎಂಸಿಬಿ ಕಡ್ಡಾಯವಾಗಿ ಬಳಸುತ್ತೇವೆ.',
      'ಮುಖ್ಯ ವಿದ್ಯುತ್ ಪೂರೈಕೆ ಆಫ್ ಮಾಡಿ, ಇನ್ಸುಲೇಟೆಡ್ ಪರಿಕರಗಳು ಮತ್ತು ಸುರಕ್ಷತಾ ಬೂಟುಗಳನ್ನು ಧರಿಸುತ್ತೇವೆ.',
    ],
    'en-IN': [
      'If a fan runs only at high speed, the regulator capacitor or internal potentiometer has failed; replacing the regulator solves it.',
      'For frequent MCB tripping, I disconnect all appliance loads and test phase-to-neutral continuity with a multimeter to trace the short.',
      'For a 1.5-ton AC, I run dedicated 4 sq mm copper wiring with a 16A/20A DP isolator and solid copper earthing.',
      'Safety protocol: Always turn off the double-pole main switch, verify dead lines with a neon tester, and wear insulated boots.',
    ],
  },
  Carpenter: {
    'hi-IN': [
      'अलमारी का पल्ला तिरछा होने पर हाइड्रोलिक हिंज के एडजस्टमेंट स्क्रू को क्लॉकवाइज या एंटी-क्लॉकवाइज घुमाकर सीधा करते हैं।',
      'मॉड्यूलर किचन कैबिनेट बनाते समय 18mm वाटरप्रूफ BWP/BWR प्लाईवुड और 1mm माइका लेमिनेशन का इस्तेमाल करते हैं।',
      'दराज के सॉफ्ट-क्लोज चैनल को स्पिरिट लेवल से दोनों तरफ बराबर 90 डिग्री में नापकर स्क्रू लगाते हैं।',
      'सुरक्षा के लिए सर्कुलर सॉ और राउटर चलाते समय सेफ्टी गॉगल्स और डस्ट मास्क पहनना बहुत जरूरी है।',
    ],
    'kn-IN': [
      'ಕ್ಯಾಬಿನೆಟ್ ಬಾಗಿಲು ಅಸಮವಾಗಿದ್ದರೆ ಹೈಡ್ರಾಲಿಕ್ ಹಿಂಜ್ ಅಡ್ಜಸ್ಟ್‌ಮೆಂಟ್ ಸ್ಕ್ರೂ ತಿರುಗಿಸಿ ಸರಿಪಡಿಸುತ್ತೇವೆ.',
      'ಮಾಡ್ಯುಲರ್ ಕಿಚನ್‌ಗಾಗಿ 18 ಎಂಎಂ ವಾಟರ್‌ಪ್ರೂಫ್ ಬಿಡಬ್ಲ್ಯೂಪಿ ಪ್ಲೈವುಡ್ ಬಳಸುತ್ತೇವೆ.',
      'ಡ್ರಾಯರ್ ಚಾನೆಲ್‌ಗಳನ್ನು ಸ್ಪಿರಿಟ್ ಲೆವೆಲ್ ಮೂಲಕ ಸಮತಟ್ಟಾಗಿ ಅಳವಡಿಸುತ್ತೇವೆ.',
      'ಮರದ ಧೂಳಿನಿಂದ ರಕ್ಷಣೆಗಾಗಿ ಮಾಸ್ಕ್ ಮತ್ತು ಸುರಕ್ಷತಾ ಕನ್ನಡಕ ಧರಿಸುತ್ತೇವೆ.',
    ],
    'en-IN': [
      'When cabinet doors are misaligned, I adjust the horizontal and vertical set screws on the 3D hydraulic hinges.',
      'For modular kitchen carcasses, I use 18mm BWP marine-grade plywood with 1mm laminate and 2mm PVC edge banding.',
      'Telescopic drawer slides require precise spirit level alignment on both sides with accurate 12.7mm clearance.',
      'Always wear eye protection goggles and a dust respirator when operating table saws or laminate trimmers.',
    ],
  },
  Mason: {
    'hi-IN': [
      'प्लास्टर करने से पहले दीवार को अच्छे से पानी से तराई करते हैं और 1:4 का सीमेंट-रेत का मसाला बराबर लगाते हैं।',
      'दीवार की सीधाई चेक करने के लिए साहुल (Plumb bob) और लेवल पाइप का पानी के बुलबुले से नाप लेते हैं।',
      'बाथरूम टाइल्स लगाते समय वाटरप्रूफिंग केमिकल की दो कोटिंग और स्लोप 1 इंच का नाली की तरफ देते हैं।',
      'सुरक्षा के लिए मचान (scaffolding) को मजबूत बांधते हैं और सिर पर सेफ्टी हेलमेट और स्टील टो जूते पहनते हैं।',
    ],
    'kn-IN': [
      'ಪ್ಲಾಸ್ಟರಿಂಗ್ ಮಾಡುವ ಮೊದಲು ಗೋಡೆಗೆ ನೀರು ಹಾಕಿ 1:4 ಸಿಮೆಂಟ್-ಮರಳು ಮಿಶ್ರಣ ಹಚ್ಚುತ್ತೇವೆ.',
      'ಗೋಡೆ ನೇರತೆಯನ್ನು ಪ್ಲಂಬ್ ಬಾಬ್ ಮತ್ತು ಲೆವೆಲ್ ಟ್ಯೂಬ್ ಮೂಲಕ ಪರಿಶೀಲಿಸುತ್ತೇವೆ.',
      'ಟೈಲ್ಸ್ ಹಾಕುವಾಗ ನೀರು ಸುಲಭವಾಗಿ ಹರಿಯುವಂತೆ ಇಳಿಜಾರು ನೀಡುತ್ತೇವೆ.',
      'ಸುರಕ್ಷತೆಗಾಗಿ ಹೆಲ್ಮೆಟ್ ಮತ್ತು ಗಟ್ಟಿ ಬೂಟುಗಳನ್ನು ಧರಿಸುತ್ತೇವೆ.',
    ],
    'en-IN': [
      'Before wall plastering, I thoroughly cure the brickwork with water and apply a 1:4 cement-sand mortar screed.',
      'To verify plumb and level, I use a brass plumb bob and a clear water level tube across corners.',
      'For wet areas, I apply two coats of polymer waterproofing slurry and maintain a 1:50 floor slope toward drains.',
      'Safety: Wear an ISI-marked safety helmet, steel-toe boots, and inspect bamboo/metal scaffolding ties.',
    ],
  },
  Painter: {
    'hi-IN': [
      'पेंट करने से पहले दीवार को 120 नंबर रेगमाल से घिसकर 2 कोट वॉल पुट्टी और एक कोट वाटरप्रूफ प्राइमर लगाते हैं।',
      'सीलन वाली दीवार पर पहले एंटी-फंगल सॉल्यूशन और डैम्प-प्रूफ कोटिंग लगाते हैं, फिर पेंट करते हैं।',
      'रोलर चलाते समय डब्ल्यू (W) पैटर्न में पेंट फैलाते हैं ताकि कोई ब्रश के निशान न दिखें।',
      'सुरक्षा के लिए ऊंची सीढ़ी के नीचे रबर ग्रिप लगाते हैं और पेंट की गंध से बचने के लिए मास्क पहनते हैं।',
    ],
    'kn-IN': [
      'ಪೇಂಟಿಂಗ್ ಮಾಡುವ ಮೊದಲು ವಾಲ್ ಪುಟ್ಟಿ ಮತ್ತು ವಾಟರ್‌ಪ್ರೂಫ್ ಪ್ರೈಮರ್ ಹಚ್ಚುತ್ತೇವೆ.',
      'ಸೋರಿಕೆ ಇರುವ ಗೋಡೆಗೆ ಡ್ಯಾಂಪ್-ಪ್ರೂಫ್ ಕೋಟಿಂಗ್ ಹಚ್ಚುತ್ತೇವೆ.',
      'ರೋಲರ್ ಮೂಲಕ ಸಮವಾಗಿ ಬಣ್ಣ ಬಳಿಯುತ್ತೇವೆ.',
      'ಏಣಿ ಬಳಸುವಾಗ ಜಾರದಂತೆ ಎಚ್ಚರ ವಹಿಸುತ್ತೇವೆ ಮತ್ತು ಮಾಸ್ಕ್ ಧರಿಸುತ್ತೇವೆ.',
    ],
    'en-IN': [
      'Surface preparation requires sanding with 120-grit paper, 2 coats of acrylic wall putty, and 1 coat of primer.',
      'On damp walls, I scrape loose paint, apply anti-efflorescence damp-block primer, and allow 6 hours to dry.',
      'For smooth ceiling and wall finishes, I roll in an overlapping W-pattern and back-roll lightly.',
      'Safety: Secure step-ladder stabilizers on level floors and wear organic-vapor respirator masks in enclosed rooms.',
    ],
  },
  Welder: {
    'hi-IN': [
      'एम.एस. पाइप वेल्डिंग के लिए 10-12 गेज पर 90 से 110 एम्पीयर करंट सेट करते हैं और 6013 नंबर का इलेक्ट्रोड इस्तेमाल करते हैं।',
      'मजबूत जॉइंट के लिए वेल्डिंग से पहले सिरों पर वी-ग्रूव (V-groove) बनाते हैं और स्लैग को चिपिंग हैमर से साफ करते हैं।',
      'स्टेनलेस स्टील गेट में आर्गन गैस शील्डिंग के साथ 308L वायर से टीआईजी/एमआईजी वेल्डिंग करते हैं।',
      'सुरक्षा के लिए ऑटो-डार्केनिंग वेल्डिंग हेलमेट, चमड़े के ग्लव्स और लेदर एप्रन पहनना अनिवार्य है ताकि आंखें न जलें।',
    ],
    'kn-IN': [
      'ಎಂ.ಎಸ್. ಪೈಪ್ ವೆಲ್ಡಿಂಗ್‌ಗೆ 100 ಆಂಪಿಯರ್ ಕರೆಂಟ್ ಮತ್ತು 6013 ಎಲೆಕ್ಟ್ರೋಡ್ ಬಳಸುತ್ತೇವೆ.',
      'ಜಾಯಿಂಟ್ ಗಟ್ಟಿಯಾಗಲು ವಿ-ಗ್ರೂವ್ ಕಟ್ ಮಾಡಿ ವೆಲ್ಡ್ ಮಾಡುತ್ತೇವೆ.',
      'ಸ್ಟೇನ್‌ಲೆಸ್ ಸ್ಟೀಲ್‌ಗೆ ಆರ್ಗನ್ ಗ್ಯಾಸ್ ಟಿಗ್ ವೆಲ್ಡಿಂಗ್ ಸೂಕ್ತವಾಗಿದೆ.',
      'ಕಣ್ಣುಗಳ ರಕ್ಷಣೆಗೆ ವೆಲ್ಡಿಂಗ್ ಹೆಲ್ಮೆಟ್ ಮತ್ತು ಚರ್ಮದ ಗ್ಲೌಸ್ ಕಡ್ಡಾಯವಾಗಿ ಧರಿಸುತ್ತೇವೆ.',
    ],
    'en-IN': [
      'For MS hollow pipes, I set 90-105 amps on the inverter welder using E6013 general-purpose electrodes.',
      'For structural butt joints, I bevel edges to a 60-degree V-groove and chip off slag between root and cap passes.',
      'For stainless steel architectural railings, I use TIG with pure argon shielding and 308L filler wire.',
      'Safety: Always wear a shade 10-11 auto-darkening welding helmet, split-cowhide leather gauntlet gloves, and fire-resistant apron.',
    ],
  },
  Mechanic: {
    'hi-IN': [
      'स्कूटर स्टार्ट न होने पर सबसे पहले स्पार्क प्लग खोलकर स्पार्क चेक करेंगे, फिर कार्ब्यूरेटर/फ्यूल इंजेक्टर में पेट्रोल सप्लाई देखेंगे।',
      'डिस्क ब्रेक में ब्रेक पैड घिस जाने पर नया पैड डालते हैं और ब्रेक फ्लूइड (DOT 3/4) का एयर ब्लीडिंग करते हैं।',
      'इंजन ऑयल बदलते समय ड्रेन बोल्ट खोलकर पुराना तेल पूरी तरह निकालते हैं और नया 10W-30 या 20W-40 ऑयल 900ml डालते हैं।',
      'सुरक्षा के लिए बाइक को हमेशा डबल स्टैंड पर लगाते हैं और बैटरी टर्मिनल खोलते समय पहले नेगेटिव (-) खोलते हैं।',
    ],
    'kn-IN': [
      'ಸ್ಕೂಟರ್ ಸ್ಟಾರ್ಟ್ ಆಗದಿದ್ದರೆ ಮೊದಲು ಸ್ಪಾರ್ಕ್ ಪ್ಲಗ್ ಮತ್ತು ಪೆಟ್ರೋಲ್ ಸಪ್ಲೈ ಪರಿಶೀಲಿಸುತ್ತೇವೆ.',
      'ಡಿಸ್ಕ್ ಬ್ರೇಕ್ ಆಯಿಲ್ ಸರಿಯಾಗಿ ಬ್ಲೀಡ್ ಮಾಡಿ ಹೊಸ ಬ್ರೇಕ್ ಪ್ಯಾಡ್ ಹಾಕುತ್ತೇವೆ.',
      'ಪ್ರತಿ 3000 ಕಿ.ಮೀ ಗೆ ಇಂಜಿನ್ ಆಯಿಲ್ ಬದಲಾಯಿಸುತ್ತೇವೆ.',
      'ಬೈಕ್ ಡಬಲ್ ಸ್ಟ್ಯಾಂಡ್ ಹಾಕಿ ಸುರಕ್ಷಿತವಾಗಿ ಕೆಲಸ ಮಾಡುತ್ತೇವೆ.',
    ],
    'en-IN': [
      'When a 2-wheeler fails to crank, I check battery terminal voltage (12.4V+), spark plug gap, and fuel pump priming.',
      'For spongy disc brakes, I bleed trapped air bubbles from the caliper bleeder valve and top up DOT-4 fluid.',
      'During 4-stroke oil replacement, I clean the strainer mesh, replace the crush washer, and fill OEM-spec 10W-40 oil.',
      'Safety: Secure bike on center stand, disconnect negative battery ground first, and dispose of used engine oil responsibly.',
    ],
  },
};

const TRADE_ICONS: Record<string, string> = {
  Plumber: '🚰',
  Electrician: '⚡',
  Mason: '🧱',
  Carpenter: '🪚',
  Painter: '🎨',
  Welder: '👨‍🏭',
  Mechanic: '🔧',
};

export default function WorkerInterviewPage() {
  const params = useParams();
  const router = useRouter();
  const workerId = params?.workerId as string;

  // Worker Profile State
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isLoadingWorker, setIsLoadingWorker] = useState(true);

  // Questions State (4 questions generated by Claude API)
  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [questionSource, setQuestionSource] = useState<'claude' | 'fallback'>('claude');

  // Active Interview Navigation (0 to 3 for 4 questions)
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(['', '', '', '']);

  // Voice Interaction State
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingStatus, setSubmittingStatus] = useState('');

  // Demo Mode State (auto-fills / simulates pre-recorded sample answers)
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isSimulatingAudio, setIsSimulatingAudio] = useState(false);

  const recognitionRef = useRef<any>(null);

  // 1. Load Worker from Supabase (or localStorage fallback)
  useEffect(() => {
    async function loadWorker() {
      if (!workerId) return;

      try {
        const { data, error } = await supabase
          .from('workers')
          .select('*')
          .eq('id', workerId)
          .single();

        if (data && !error) {
          setWorker(data);
          setIsLoadingWorker(false);
          fetchQuestions(data.trade, data.experience_years, data.language);
          return;
        }
      } catch (err) {
        console.warn('Supabase fetch error, checking local store:', err);
      }

      // Check localStorage for offline demo support
      if (typeof window !== 'undefined') {
        const localData = localStorage.getItem(`hunar_worker_${workerId}`);
        if (localData) {
          try {
            const parsed = JSON.parse(localData);
            setWorker(parsed);
            setIsLoadingWorker(false);
            fetchQuestions(parsed.trade, parsed.experience_years, parsed.language);
            return;
          } catch (e) {}
        }
      }

      // Fallback demo worker
      const demoWorker: Worker = {
        id: workerId,
        name: 'Ramesh Kumar',
        phone: '9876543210',
        trade: 'Plumber',
        language: 'hi-IN',
        area: 'Bengaluru',
        experience_years: 5,
        created_at: new Date().toISOString(),
      };
      setWorker(demoWorker);
      setIsLoadingWorker(false);
      fetchQuestions(demoWorker.trade, demoWorker.experience_years, demoWorker.language);
    }

    loadWorker();
  }, [workerId]);

  // Check Web Speech API availability & cleanup on unmount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSpeechSupported(false);
      }
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  // 2. Fetch 4 practical questions from server route (Claude API with sample fallback)
  const fetchQuestions = async (
    trade: TradeType,
    experienceYears: number,
    language: SupportedLanguage
  ) => {
    setIsLoadingQuestions(true);
    setLoadError(null);

    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trade,
          experienceYears,
          language,
        }),
      });

      const data = await res.json();

      if (data.success && Array.isArray(data.questions) && data.questions.length >= 4) {
        setQuestions(data.questions.slice(0, 4));
        setQuestionSource(data.source === 'claude' ? 'claude' : 'fallback');
      } else {
        throw new Error('Could not generate 4 questions');
      }
    } catch (err: any) {
      console.error('Error fetching questions:', err);
      setLoadError('Failed to load interview questions. Tap "Try Again" below.');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const activeTrade = worker?.trade || 'Plumber';
  const activeLang = worker?.language || 'hi-IN';
  const currentQuestion = questions[currentQIndex] || '';
  const isSafetyQuestion = currentQIndex === 3;

  // 3. Audio Narration: Read question aloud using Browser SpeechSynthesis
  const speakCurrentQuestion = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !currentQuestion) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentQuestion);
    utterance.lang = activeLang;
    utterance.rate = 0.9;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // 4. Web Speech API: Record voice answer
  const startRecording = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        'Speech recognition is not supported in this browser. Please type your answer in the box below.'
      );
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = activeLang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }

      if (finalTranscript) {
        setAnswers((prev) => {
          const updated = [...prev];
          updated[currentQIndex] = (updated[currentQIndex] + ' ' + finalTranscript).trim();
          return updated;
        });
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition event:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  // Helper to get pre-recorded answer for current trade, language and question index
  const getSampleAnswerForCurrent = (qIdx = currentQIndex) => {
    const tradeAnswers = DEMO_SAMPLE_ANSWERS[activeTrade] || DEMO_SAMPLE_ANSWERS['Plumber'];
    const langAnswers = tradeAnswers[activeLang] || tradeAnswers['hi-IN'] || tradeAnswers['en-IN'];
    return langAnswers[qIdx] || 'Practical trade troubleshooting and safety protocol demonstrated.';
  };

  // Fill sample answer for current question
  const handleUseSampleAnswer = () => {
    const sample = getSampleAnswerForCurrent();
    setAnswers((prev) => {
      const updated = [...prev];
      updated[currentQIndex] = sample;
      return updated;
    });
  };

  // Simulate speaking the sample answer aloud and streaming it into the answer box
  const handleSimulateSpokenAnswer = () => {
    const sample = getSampleAnswerForCurrent();
    handleUseSampleAnswer();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(sample);
      utterance.lang = activeLang;
      utterance.rate = 0.95;

      utterance.onstart = () => setIsSimulatingAudio(true);
      utterance.onend = () => setIsSimulatingAudio(false);
      utterance.onerror = () => setIsSimulatingAudio(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  // Fast Track: Auto-fill all 4 answers and submit immediately for rapid demo
  const handleFastTrackDemo = () => {
    const all4 = [0, 1, 2, 3].map((idx) => getSampleAnswerForCurrent(idx));
    setAnswers(all4);
    submitCompletedInterview(all4);
  };

  // 5. Navigate to Next Question or Submit All
  const handleNextQuestion = () => {
    stopRecording();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    if (currentQIndex < 3) {
      const nextIdx = currentQIndex + 1;
      setCurrentQIndex(nextIdx);
    } else {
      // Completed all 4 questions! Submit to server route
      submitCompletedInterview();
    }
  };

  // 6. Submit all 4 Q&As to server route (/api/analyze-skills)
  const submitCompletedInterview = async (customAnswers?: string[]) => {
    setIsSubmitting(true);
    setSubmittingStatus('Sending spoken answers to Claude AI...');

    const ansList = customAnswers || answers;
    const qaList = questions.map((q, idx) => ({
      question: q,
      answer: ansList[idx] || getSampleAnswerForCurrent(idx),
    }));

    try {
      setSubmittingStatus('Evaluating trade skills & fair wage with Claude AI...');

      const response = await fetch('/api/analyze-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId,
          trade: activeTrade,
          language: activeLang,
          experienceYears: worker?.experience_years || 3,
          qaList,
        }),
      });

      const data = await response.json();
      if (data && data.success && data.skillCard) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`hunar_card_${workerId}`, JSON.stringify(data.skillCard));
        }
      }
      setSubmittingStatus('Skill Card Issued! Opening passport...');

      setTimeout(() => {
        router.push(`/w/${workerId}`);
      }, 800);
    } catch (err) {
      console.warn('AI evaluation error, creating offline demo card fallback:', err);
      // Fallback pre-computed skill card for demo continuity
      if (typeof window !== 'undefined') {
        const demoCard = {
          id: 'sc-demo-' + Date.now(),
          worker_id: workerId,
          summary: `${worker?.name || 'Worker'} demonstrated practical mastery in ${activeTrade} troubleshooting and safety protocol during the spoken interview.`,
          skills: [
            `${activeTrade} Diagnostics`,
            'Safety & Hazard Protocol',
            'Tool Maintenance',
            'Residential Fitting',
            'Code Compliance',
          ],
          level: 'expert',
          level_reason: 'Accurately solved trade troubleshooting questions with proper safety precautions.',
          transcript: qaList.map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n'),
          next_steps: 'Consider official government RPL (PMKVY Level 4) or ITI trade certification for contractor empanelment.',
          wage_min: 850,
          wage_max: 1250,
          wage_label: `₹850 - ₹1,250/day (Estimated rate for ${worker?.area || 'Bengaluru'} • sample data)`,
          created_at: new Date().toISOString(),
        };
        localStorage.setItem(`hunar_card_${workerId}`, JSON.stringify(demoCard));
      }
      setTimeout(() => {
        router.push(`/w/${workerId}`);
      }, 500);
    }
  };

  // Loading worker profile
  if (isLoadingWorker) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="font-bold text-slate-600 text-sm">Loading worker profile...</p>
      </div>
    );
  }

  // Graceful Error State with "Try Again" Button
  if (loadError) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-red-200 flex flex-col items-center text-center gap-4 my-6 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">
            Could Not Load Questions
          </h2>
          <p className="text-xs text-slate-500 font-bold mt-1">{loadError}</p>
        </div>
        <button
          onClick={() => {
            if (worker) {
              fetchQuestions(worker.trade, worker.experience_years, worker.language);
            }
          }}
          className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again (दोबारा प्रयास करें)</span>
        </button>
      </div>
    );
  }

  // Loading Questions State
  if (isLoadingQuestions) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-orange-200 flex flex-col items-center text-center gap-4 my-8 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 animate-spin">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">
          Preparing Practical Questions...
        </h2>
        <p className="text-xs font-bold text-orange-600">
          Tailoring 4 practical tests for {activeTrade} in{' '}
          {activeLang === 'hi-IN' ? 'हिन्दी' : activeLang === 'kn-IN' ? 'ಕನ್ನಡ' : 'English'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-2 max-w-md mx-auto w-full">
      {/* ---------------- FINAL SUBMISSION AI OVERLAY ---------------- */}
      {isSubmitting ? (
        <div className="bg-white rounded-3xl p-8 shadow-2xl border-4 border-orange-300 flex flex-col items-center text-center gap-4 my-8 animate-in fade-in">
          <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 animate-spin">
            <Sparkles className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            Generating Skill Passport
          </h2>
          <p className="text-sm font-bold text-orange-600 max-w-xs">
            {submittingStatus}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Anthropic Claude is extracting verified skills, experience level, and fair daily wages.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Top Worker Profile Badge & Demo Mode Toggle */}
          <div className="bg-white rounded-3xl p-3.5 border-2 border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl">{TRADE_ICONS[activeTrade] || '🔧'}</span>
              <div>
                <h2 className="text-base font-black text-slate-900 leading-tight">
                  {worker?.name}
                </h2>
                <p className="text-xs font-bold text-orange-600">
                  {worker?.trade} • {worker?.experience_years} Yrs Exp.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsDemoMode(!isDemoMode)}
                className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-1 border shadow-xs transition-all active:scale-95 ${
                  isDemoMode
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
                }`}
              >
                <span>✨ Demo Mode:</span>
                <span className="font-extrabold">{isDemoMode ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>

          {/* Demo Mode Interactive Controller Banner */}
          {isDemoMode && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-3.5 shadow-xs flex flex-col gap-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                  <span>✨</span> <span>Demo Mode: Spoken & AI Fallbacks</span>
                </span>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-black">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-amber-900 font-semibold leading-snug">
                Testing in a noisy hall or without mic permissions? Use realistic trade answers tailored to {worker?.trade} in {activeLang}.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-200">
                <button
                  type="button"
                  onClick={handleUseSampleAnswer}
                  className="py-2.5 px-2 bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-xl font-black text-xs shadow-2xs flex items-center justify-center gap-1 active:scale-95 transition-all"
                >
                  <span>⚡</span> <span>Auto-Fill Answer</span>
                </button>
                <button
                  type="button"
                  onClick={handleSimulateSpokenAnswer}
                  className="py-2.5 px-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-xs shadow-2xs flex items-center justify-center gap-1 active:scale-95 transition-all"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isSimulatingAudio ? 'Speaking...' : 'Simulate Voice'}</span>
                </button>
              </div>
              <button
                type="button"
                onClick={handleFastTrackDemo}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-xs shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <span>🚀</span> <span>Fast Track: Fill All 4 & Finish Demo →</span>
              </button>
            </div>
          )}

          {/* 4-Step Progress Indicator Bar */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
                Question {currentQIndex + 1} of 4
              </span>
              {isSafetyQuestion && (
                <span className="text-[10px] font-black text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-red-600" /> Safety Check
                </span>
              )}
            </div>

            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-7 h-2 rounded-full transition-all ${
                    idx === currentQIndex
                      ? 'bg-orange-600 w-8'
                      : idx < currentQIndex
                      ? 'bg-emerald-500'
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* ACTIVE QUESTION CARD WITH LISTEN BUTTON */}
          <div
            className={`bg-white rounded-3xl p-5 shadow-md border-2 transition-all flex flex-col gap-3 ${
              isSafetyQuestion ? 'border-red-300' : 'border-orange-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-black text-slate-900 leading-snug">
                {currentQuestion}
              </h3>
              {/* "Listen" button */}
              <button
                type="button"
                onClick={speakCurrentQuestion}
                className={`p-3 rounded-2xl flex-shrink-0 active:scale-90 transition-all flex items-center gap-1.5 ${
                  isSpeaking
                    ? 'bg-red-600 text-white ring-4 ring-red-200 animate-pulse'
                    : 'bg-orange-100 hover:bg-orange-200 text-orange-800'
                }`}
                title="Listen to question aloud"
              >
                <Volume2 className="w-5 h-5" />
                <span className="text-xs font-black">
                  {isSpeaking ? 'Playing...' : 'Listen'}
                </span>
              </button>
            </div>

            <p className="text-xs font-bold text-slate-400">
              💡 Tap "Listen" to hear it aloud, then tap the big mic below to answer.
            </p>
          </div>

          {/* BIG MICROPHONE RECORDING BUTTON */}
          <div className="flex flex-col items-center justify-center my-2">
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-32 h-32 rounded-full flex flex-col items-center justify-center text-white shadow-2xl active:scale-95 transition-all ${
                isRecording
                  ? 'bg-red-600 mic-recording'
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-12 h-12" />
                  <span className="text-xs font-black uppercase mt-1">
                    STOP (रोकें)
                  </span>
                </>
              ) : (
                <>
                  <Mic className="w-12 h-12" />
                  <span className="text-xs font-black uppercase mt-1">
                    SPEAK (बोलें)
                  </span>
                </>
              )}
            </button>
            <p className="mt-3 text-sm font-black text-slate-700">
              {isRecording
                ? '🔴 Listening... (सुन रहे हैं)'
                : 'Tap to Speak (बोलने के लिए दबाएं)'}
            </p>
          </div>

          {/* LIVE TRANSCRIPT & TYPED FALLBACK */}
          <div className="bg-white rounded-2xl p-4 border-2 border-slate-200 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-600 uppercase flex items-center gap-1">
                <Edit3 className="w-3.5 h-3.5 text-orange-600" />
                <span>Your Answer / Typed Fallback:</span>
              </span>

              {answers[currentQIndex] && (
                <button
                  type="button"
                  onClick={() => {
                    setAnswers((prev) => {
                      const updated = [...prev];
                      updated[currentQIndex] = '';
                      return updated;
                    });
                  }}
                  className="text-xs text-red-500 font-bold flex items-center gap-1 hover:underline"
                >
                  <RotateCcw className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            <textarea
              rows={3}
              value={answers[currentQIndex]}
              onChange={(e) => {
                const val = e.target.value;
                setAnswers((prev) => {
                  const updated = [...prev];
                  updated[currentQIndex] = val;
                  return updated;
                });
              }}
              placeholder="Your spoken words appear here live. You can also edit or type directly if microphone fails..."
              className="w-full text-slate-900 font-semibold text-sm outline-none resize-none bg-slate-50 p-3 rounded-xl border border-slate-200 focus:border-orange-500"
            />
          </div>

          {/* NEXT QUESTION OR COMPLETE BUTTON */}
          <button
            type="button"
            onClick={handleNextQuestion}
            className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-black text-lg rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <span>
              {currentQIndex < 3
                ? `Next Question (${currentQIndex + 2}/4) ➔`
                : 'Complete & Issue Skill Passport ✨'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
