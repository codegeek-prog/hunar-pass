// ==============================================================================
// Hunar Pass - Unified Translations File
// Supports English, Hindi (हिन्दी), and Kannada (ಕನ್ನಡ)
// ==============================================================================

export type SupportedLanguage = 'en' | 'hi' | 'kn';

export interface TranslationContent {
  appName: string;
  langName: string;
  speechCode: string;
  headline: string;
  subline: string;
  workerBtn: string;
  workerSub: string;
  hiringBtn: string;
  hiringSub: string;
  listenAudio: string;
  howItWorksTitle: string;
  steps: {
    icon: string;
    number: string;
    title: string;
    desc: string;
  }[];
  popularTrades: string;
  trades: {
    plumber: string;
    electrician: string;
    mason: string;
    carpenter: string;
    painter: string;
    welder: string;
    mechanic: string;
  };
  trustBadge: string;
}

export const translations: Record<SupportedLanguage, TranslationContent> = {
  en: {
    appName: 'Hunar Pass',
    langName: 'English',
    speechCode: 'en-IN',
    headline: 'Your skill deserves proof.',
    subline: 'Speak about your work. Get a skill passport. Find better jobs.',
    workerBtn: "I'm a worker",
    workerSub: 'Answer 3 voice questions to get your card',
    hiringBtn: "I'm hiring",
    hiringSub: 'Find verified tradespeople nearby',
    listenAudio: 'Listen to this page',
    howItWorksTitle: 'How it works',
    steps: [
      {
        icon: '🎙️',
        number: '1',
        title: 'Speak your answers',
        desc: 'Answer 3 simple spoken questions about your trade tools and experience.',
      },
      {
        icon: '✨',
        number: '2',
        title: 'Get your AI Skill Card',
        desc: 'AI generates a certified skill passport with fair daily wage rates.',
      },
      {
        icon: '🪪',
        number: '3',
        title: 'Vouch & share QR',
        desc: 'Past customers vouch with one tap. Show your QR code to win high-paying jobs.',
      },
    ],
    popularTrades: 'Select your trade',
    trades: {
      plumber: 'Plumber',
      electrician: 'Electrician',
      mason: 'Mason',
      carpenter: 'Carpenter',
      painter: 'Painter',
      welder: 'Welder',
      mechanic: 'Mechanic',
    },
    trustBadge: 'Free • Voice-First • No Middlemen',
  },

  hi: {
    appName: 'हुनर पास',
    langName: 'हिन्दी',
    speechCode: 'hi-IN',
    headline: 'आपके हुनर को प्रमाण मिलना चाहिए।',
    subline: 'अपने काम के बारे में बोलें। स्किल पासपोर्ट पाएं। बेहतर काम खोजें।',
    workerBtn: 'मैं कारीगर हूँ',
    workerSub: 'बोलकर 2 मिनट में अपना हुनर कार्ड बनाएं',
    hiringBtn: 'मुझे काम कराना है',
    hiringSub: 'आस-पास के सत्यापित कामगार खोजें',
    listenAudio: 'यह पेज सुनें',
    howItWorksTitle: 'यह कैसे काम करता है',
    steps: [
      {
        icon: '🎙️',
        number: '1',
        title: 'बोलकर उत्तर दें',
        desc: 'अपनी भाषा में अपने काम, औजारों और अनुभव से जुड़े 3 आसान सवालों के जवाब दें।',
      },
      {
        icon: '✨',
        number: '2',
        title: 'AI हुनर कार्ड तैयार करेगा',
        desc: 'AI आपकी आवाज़ से सत्यापित स्किल कार्ड और उचित दैनिक मजदूरी तय करेगा।',
      },
      {
        icon: '🪪',
        number: '3',
        title: 'QR दिखाएं और सिफ़ारिश पाएं',
        desc: 'ग्राहक 1 टैप में सिफ़ारिश करेंगे। बड़ा काम पाने के लिए अपना QR कोड दिखाएं।',
      },
    ],
    popularTrades: 'अपना काम चुनें',
    trades: {
      plumber: 'प्लंबर',
      electrician: 'इलेक्ट्रीशियन',
      mason: 'राजमिस्त्री',
      carpenter: 'बढ़ई',
      painter: 'पेंटर',
      welder: 'वेल्डर',
      mechanic: 'मैकेनिक',
    },
    trustBadge: 'मुफ़्त • बोलकर बनाएं • कोई दलाल नहीं',
  },

  kn: {
    appName: 'ಹುನರ್ ಪಾಸ್',
    langName: 'ಕನ್ನಡ',
    speechCode: 'kn-IN',
    headline: 'ನಿಮ್ಮ ಕೌಶಲ್ಯಕ್ಕೆ ಸಾಕ್ಷಿ ಬೇಕು.',
    subline: 'ನಿಮ್ಮ ಕೆಲಸದ ಬಗ್ಗೆ ಮಾತನಾಡಿ. ಕೌಶಲ್ಯ ಪಾಸ್‌ಪೋರ್ಟ್ ಪಡೆಯಿರಿ. ಉತ್ತಮ ಉದ್ಯೋಗಗಳನ್ನು ಕಂಡುಕೊಳ್ಳಿ.',
    workerBtn: 'ನಾನು ಕೆಲಸಗಾರ',
    workerSub: '2 ನಿಮಿಷದಲ್ಲಿ ಧ್ವನಿಯ ಮೂಲಕ ಕಾರ್ಡ್ ಮಾಡಿ',
    hiringBtn: 'ನಾನು ಕೆಲಸ ಕೊಡುತ್ತೇನೆ',
    hiringSub: 'ಹತ್ತಿರದ ಪರಿಶೀಲಿಸಿದ ಕೆಲಸಗಾರರನ್ನು ಹುಡುಕಿ',
    listenAudio: 'ಪುಟವನ್ನು ಆಲಿಸಿ',
    howItWorksTitle: 'ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ',
    steps: [
      {
        icon: '🎙️',
        number: '1',
        title: 'ಮಾತನಾಡಿ ಉತ್ತರಿಸಿ',
        desc: 'ನಿಮ್ಮ ವ್ಯಾಪಾರ ಮತ್ತು ಅನುಭವದ ಬಗ್ಗೆ 3 ಸುಲಭ ಪ್ರಶ್ನೆಗಳಿಗೆ ನಿಮ್ಮದೇ ಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಿ.',
      },
      {
        icon: '✨',
        number: '2',
        title: 'AI ಕೌಶಲ್ಯ ಕಾರ್ಡ್ ಪಡೆಯಿರಿ',
        desc: 'AI ನಿಮ್ಮ ಧ್ವನಿಯಿಂದ ದೈನಂದಿನ ನ್ಯಾಯಯುತ ಕೂಲಿಯೊಂದಿಗೆ ಅಧಿಕೃತ ಕಾರ್ಡ್ ನೀಡುತ್ತದೆ.',
      },
      {
        icon: '🪪',
        number: '3',
        title: 'QR ಕೋಡ್ ಮತ್ತು ಭರವಸೆ',
        desc: 'ಹಿಂದಿನ ಗ್ರಾಹಕರು ಒಂದೇ ಟ್ಯಾಪ್‌ನಲ್ಲಿ ಭರವಸೆ ನೀಡುತ್ತಾರೆ. QR ಕೋಡ್ ತೋರಿಸಿ ಕೆಲಸ ಪಡೆಯಿರಿ.',
      },
    ],
    popularTrades: 'ನಿಮ್ಮ ಕೆಲಸ ಆಯ್ಕೆಮಾಡಿ',
    trades: {
      plumber: 'ಪ್ಲಂಬರ್',
      electrician: 'ಎಲೆಕ್ಟ್ರಿಷಿಯನ್',
      mason: 'ಮೇಸ್ತ್ರಿ',
      carpenter: 'ಬಡಗಿ',
      painter: 'ಪೇಂಟರ್',
      welder: 'ವೆಲ್ಡರ್',
      mechanic: 'ಮೆಕ್ಯಾನಿಕ್',
    },
    trustBadge: 'ಉಚಿತ • ಧ್ವನಿ ಪ್ರಥಮ • ಮಧ್ಯವರ್ತಿಗಳಿಲ್ಲ',
  },
};
