import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { TradeType, SupportedLanguage } from '@/types/database';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { trade, experienceYears, language } = body as {
      trade: TradeType;
      experienceYears: number;
      language: SupportedLanguage;
    };

    if (!trade) {
      return NextResponse.json({ error: 'Trade is required' }, { status: 400 });
    }

    const safeLang: SupportedLanguage = language || 'hi-IN';
    const safeExp = experienceYears || 3;

    // Check if Anthropic API key is provided
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey && apiKey !== 'sk-ant-api03-...') {
      try {
        const anthropic = new Anthropic({ apiKey });

        const langInstructions =
          safeLang === 'hi-IN'
            ? 'Write all questions in natural spoken Hindi (Devanagari script).'
            : safeLang === 'kn-IN'
            ? 'Write all questions in natural spoken Kannada (Kannada script).'
            : 'Write all questions in simple, clear Indian English.';

        const systemPrompt = `You are a master vocational assessor for blue-collar Indian trades (plumbers, electricians, masons, carpenters, painters, welders, mechanics).
Generate exactly 4 short, practical spoken interview questions testing genuine on-the-job trade knowledge for a ${trade} with ${safeExp} years of field experience.

RULES:
1. Questions 1, 2, and 3 must test real, practical troubleshooting & tool knowledge (e.g., for an electrician: "A ceiling fan runs at top speed but will not spin at low speed. What component would you check first?", or for a plumber: "How do you detect a concealed pipe leak behind bathroom tiles without breaking everything?").
2. Question 4 MUST be a practical workplace safety question (e.g. earthing safety, goggles/gloves, ladder stability, or fire safety).
3. Keep each question short, simple, and direct (1 to 2 sentences max) so it is easy to listen to.
4. ${langInstructions}
5. Return ONLY a valid JSON array of 4 question strings. Do not include markdown formatting or backticks.
Format:
["Question 1", "Question 2", "Question 3", "Question 4 (Safety)"]`;

        const response = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 600,
          temperature: 0.3,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: `Generate 4 practical questions for a ${trade} with ${safeExp} years experience in language ${safeLang}.`,
            },
          ],
        });

        const text =
          response.content[0].type === 'text' ? response.content[0].text : '';

        const cleaned = text
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();

        const questions = JSON.parse(cleaned);

        if (Array.isArray(questions) && questions.length === 4) {
          return NextResponse.json({ success: true, questions, source: 'claude' });
        }
      } catch (apiError) {
        console.warn('Claude API question generation failed, using robust trade fallback:', apiError);
      }
    }

    // Fallback: Fixed set of practical trade questions so demo NEVER breaks
    const fallbackQuestions = getFallbackQuestions(trade, safeLang);
    return NextResponse.json({
      success: true,
      questions: fallbackQuestions,
      source: 'fallback',
    });
  } catch (error: any) {
    console.error('Error in generate-questions route:', error);
    return NextResponse.json(
      {
        success: true,
        questions: getFallbackQuestions('Plumber', 'hi-IN'),
        source: 'emergency_fallback',
      },
      { status: 200 }
    );
  }
}

// Robust fallback questions for all 7 trades across English, Hindi, and Kannada
function getFallbackQuestions(trade: TradeType, lang: SupportedLanguage): string[] {
  const tradeData: Record<
    TradeType,
    Record<SupportedLanguage, [string, string, string, string]>
  > = {
    Plumber: {
      'en-IN': [
        'A kitchen sink drain is blocked with grease and water is backing up. What tool and technique do you use to clear it quickly?',
        'How do you check for a concealed pipe leakage behind bathroom tiles without breaking unnecessary walls?',
        'When joining CPVC and UPVC pipes, which solvent cement and fitting technique ensures zero leakage under high pressure?',
        'Safety question: What precautions do you take before opening a high-pressure main supply line or working inside a dark drainage pit?',
      ],
      'hi-IN': [
        'किचन सिंक में कचरा और तेल जमने से पानी उल्टा आ रहा है। आप इसे खोलने के लिए कौन सा औज़ार और तरीका इस्तेमाल करेंगे?',
        'बाथरूम की दीवार में टाइल्स के पीछे छिपी हुई पाइप लीकेज का पता आप बिना पूरी दीवार तोड़े कैसे लगाते हैं?',
        'CPVC और UPVC पाइप जोड़ते समय कौन सा सॉल्वेंट सीमेंट इस्तेमाल करते हैं ताकि पानी का प्रेशर आने पर जोड़ न छूटे?',
        'सुरक्षा सवाल: मुख्य पानी की हाई-प्रेशर लाइन खोलने या गहरे नाले/टैंक में उतरने से पहले आप क्या सावधानियां बरतते हैं?',
      ],
      'kn-IN': [
        'ಅಡಿಗೆಮನೆಯ ಸಿಂಕ್‌ನಲ್ಲಿ ನೀರು ಸರಾಗವಾಗಿ ಹರಿಯದೆ ನಿಲ್ಲುತ್ತಿದೆ. ಅದನ್ನು ಸರಿಪಡಿಸಲು ನೀವು ಯಾವ ಉಪಕರಣ ಮತ್ತು ವಿಧಾನ ಬಳಸುತ್ತೀರಿ?',
        'ಬಾತ್‌ರೂಮ್ ಗೋಡೆಯ ಟೈಲ್ಸ್ ಒಡೆಯದೆ ಒಳಗಿರುವ ಪೈಪ್ ಸೋರಿಕೆಯನ್ನು ನೀವು ಹೇಗೆ ಪತ್ತೆ ಹಚ್ಚುತ್ತೀರಿ?',
        'CPVC ಮತ್ತು UPVC ಪೈಪ್‌ಗಳನ್ನು ಜೋಡಿಸುವಾಗ ಸೋರಿಕೆಯಾಗದಂತೆ ನೀವು ಯಾವ ಗಮ್ ಮತ್ತು ವಿಧಾನ ಬಳಸುತ್ತೀರಿ?',
        'ಸುರಕ್ಷತಾ ಪ್ರಶ್ನೆ: ಹೈ-ಪ್ರೆಶರ್ ಮುಖ್ಯ ನೀರಿನ ಪೈಪ್ ಲೈನ್ ತೆರೆಯುವ ಮೊದಲು ನೀವು ಯಾವ ಸುರಕ್ಷತಾ ಮುನ್ನೆಚ್ಚರಿಕೆಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳುತ್ತೀರಿ?',
      ],
    },
    Electrician: {
      'en-IN': [
        'A ceiling fan works normally at high speed, but does not rotate at low regulator speeds. What component would you test first?',
        'In a house, the MCB trips immediately every time a refrigerator or geyser is turned on. How do you find the exact short-circuit fault?',
        'How do you determine the correct wire gauge (1.5 sq mm vs 2.5 sq mm vs 4 sq mm) for an air conditioner installation?',
        'Safety question: What steps do you take to verify the line is dead before touching live distribution board wires, and do you use insulated shoes?',
      ],
      'hi-IN': [
        'एक पंखा फुल स्पीड पर चलता है, लेकिन रेगुलेटर कम करने पर रुक जाता है। आप सबसे पहले किस पार्ट की जांच करेंगे?',
        'गीज़र या फ्रिज ऑन करते ही MCB तुरंत ट्रिप हो जाती है। आप फॉल्ट या शॉर्ट-सर्किट का पता कैसे लगाते हैं?',
        'डेढ़ टन AC या गीज़र की वायरिंग के लिए आप कितने mm का तार इस्तेमाल करते हैं और क्यों?',
        'सुरक्षा सवाल: मेन डिस्ट्रीब्यूशन बॉक्स में काम करने से पहले आप लाइन बंद होने की पुष्टि कैसे करते हैं और सुरक्षा उपकरण क्या पहनते हैं?',
      ],
      'kn-IN': [
        'ಸೀಲಿಂಗ್ ಫ್ಯಾನ್ ಪೂರ್ಣ ವೇಗದಲ್ಲಿ ತಿರುಗುತ್ತದೆ ಆದರೆ ರೆಗ್ಯುಲೇಟರ್ ಕಡಿಮೆ ಮಾಡಿದಾಗ ತಿರುಗುವುದಿಲ್ಲ. ನೀವು ಮೊದಲು ಏನನ್ನು ಪರಿಶೀಲಿಸುತ್ತೀರಿ?',
        'ಗೀಸರ್ ಅಥವಾ ಫ್ರಿಜ್ ಆನ್ ಮಾಡಿದ ತಕ್ಷಣ MCB ಟ್ರಿಪ್ ಆಗುತ್ತದೆ. ಈ ಶಾರ್ಟ್ ಸರ್ಕ್ಯೂಟ್ ಅನ್ನು ನೀವು ಹೇಗೆ ಪತ್ತೆ ಮಾಡುತ್ತೀರಿ?',
        'ಎಸಿ ಅಥವಾ ವಾಟರ್ ಹೀಟರ್‌ಗೆ ಎಷ್ಟು mm ವೈರ್ ಬಳಸಬೇಕು ಎಂಬುದನ್ನು ನೀವು ಹೇಗೆ ನಿರ್ಧರಿಸುತ್ತೀರಿ?',
        'ಸುರಕ್ಷತಾ ಪ್ರಶ್ನೆ: ಮುಖ್ಯ ಸ್ವಿಚ್ ಬೋರ್ಡ್‌ನಲ್ಲಿ ಕೆಲಸ ಮಾಡುವ ಮೊದಲು ವಿದ್ಯುತ್ ಸಂಪರ್ಕ ಕಡಿತಗೊಂಡಿದೆ ಎಂದು ಹೇಗೆ ಖಚಿತಪಡಿಸಿಕೊಳ್ಳುತ್ತೀರಿ?',
      ],
    },
    Mason: {
      'en-IN': [
        'What is the ideal cement-to-sand ratio you mix for 9-inch exterior brick wall masonry versus wall plastering?',
        'A terrace roof is developing rainwater dampness and hairline cracks. How do you prepare the surface and apply waterproofing coat?',
        'How do you ensure proper water level and right-angle alignment while laying floor tiles in a large living room?',
        'Safety question: What safety checks do you carry out on bamboo scaffolding or wooden planks before climbing to work at height?',
      ],
      'hi-IN': [
        '9 इंच की ईंट की दीवार की चिनाई और दीवार के प्लास्टर के लिए आप सीमेंट और रेत का क्या अनुपात (मसाला) बनाते हैं?',
        'छत पर बारिश का पानी रिस रहा है और दरारें दिख रही हैं। आप वॉटरप्रूफिंग का काम किस तरह शुरू और पूरा करेंगे?',
        'कमरे में फर्श की टाइलें लगाते समय लेवल और गुनिया (right-angle) सही रखने के लिए आप क्या करते हैं?',
        'सुरक्षा सवाल: ऊंचाई पर प्लास्टर या चिनाई करते समय आप मचान (scaffolding) और सुरक्षा पेटी की क्या जांच करते हैं?',
      ],
      'kn-IN': [
        'ಗೋಡೆ ಕಟ್ಟಲು ಮತ್ತು ಗಾರೆ (ಪ್ಲಾಸ್ಟರಿಂಗ್) ಮಾಡಲು ನೀವು ಸಿಮೆಂಟ್ ಮತ್ತು ಮರಳನ್ನು ಯಾವ ಪ್ರಮಾಣದಲ್ಲಿ ಮಿಶ್ರಣ ಮಾಡುತ್ತೀರಿ?',
        'ಮನೆಯ ಮೇಲ್ಛಾವಣಿಯಲ್ಲಿ ಮಳೆ ನೀರು ಸೋರುತ್ತಿದ್ದರೆ, ನೀವು ವಾಟರ್‌ಪ್ರೂಫಿಂಗ್ ಕೆಲಸವನ್ನು ಹೇಗೆ ಮಾಡುತ್ತೀರಿ?',
        'ಮನೆಯಲ್ಲಿ ನೆಲದ ಟೈಲ್ಸ್ ಹಾಕುವಾಗ ಲೆವೆಲ್ ಮತ್ತು ಸರಿಯಾದ ಕೋನವನ್ನು ಹೇಗೆ ಕಾಪಾಡಿಕೊಳ್ಳುತ್ತೀರಿ?',
        'ಸುರಕ್ಷತಾ ಪ್ರಶ್ನೆ: ಎತ್ತರದಲ್ಲಿ ಗಾರೆ ಕೆಲಸ ಮಾಡುವಾಗ ಸಾರವೆ (ಸ್ಕಫೋಲ್ಡಿಂಗ್) ಸುರಕ್ಷತೆಯನ್ನು ನೀವು ಹೇಗೆ ಪರೀಕ್ಷಿಸುತ್ತೀರಿ?',
      ],
    },
    Carpenter: {
      'en-IN': [
        'A heavy solid wooden flush door is rubbing against the floor when closing. What tool and adjustment do you use to fix it?',
        'When pasting laminate sunmica on waterproof plywood, how do you prevent air bubbles and edge peeling over time?',
        'How do you adjust soft-close hydraulic hinges on modular kitchen cabinet doors to align them perfectly straight?',
        'Safety question: When operating a high-speed electric circular saw or router machine, what eye and hand safety precautions do you follow?',
      ],
      'hi-IN': [
        'एक भारी लकड़ी का दरवाजा फर्श से रगड़ खा रहा है और ठीक से बंद नहीं हो रहा। आप रंदे या कब्जों से इसे कैसे ठीक करेंगे?',
        'प्लाईवुड पर सनमाइका (लैमिनेट) चिपकाते समय फेविकोल कैसे लगाते हैं ताकि हवा के बुलबुले न बनें और किनारे न उखड़ें?',
        'मॉड्यूलर किचन के कैबिनेट दरवाजों में हाइड्रोलिक कब्जों (hinges) की सेटिंग सीधी करने के लिए आप क्या करते हैं?',
        'सुरक्षा सवाल: कटर मशीन या राउटर चलाते समय आंखों की सुरक्षा और उंगलियों के बचाव के लिए क्या सावधानी जरूरी है?',
      ],
      'kn-IN': [
        'ಬಾಗಿಲು ಮುಚ್ಚುವಾಗ ನೆಲಕ್ಕೆ ಉಜ್ಜಿಕೊಳ್ಳುತ್ತಿದೆ. ಅದನ್ನು ಸರಿಪಡಿಸಲು ನೀವು ಯಾವ ಉಪಕರಣದಿಂದ ಸರಿಮಾಡುತ್ತೀರಿ?',
        'ಪ್ಲೈವುಡ್ ಮೇಲೆ ಸನ್ಮೈಕಾ ಅಂಟಿಸುವಾಗ ಗಾಳಿಯ ಗುಳ್ಳೆಗಳು ಬಾರದಂತೆ ಹೇಗೆ ಮುನ್ನೆಚ್ಚರಿಕೆ ವಹಿಸುತ್ತೀರಿ?',
        'ಮಾಡ್ಯುಲರ್ ಕಿಚನ್ ಬಾಗಿಲುಗಳ ಹೈಡ್ರಾಲಿಕ್ ಹಿಂಜ್‌ಗಳನ್ನು ಸರಿಯಾಗಿ ಜೋಡಿಸಲು ನೀವು ಏನು ಮಾಡುತ್ತೀರಿ?',
        'ಸುರಕ್ಷತಾ ಪ್ರಶ್ನೆ: ಕಟಿಂಗ್ ಮಿಷನ್ ಬಳಸುವಾಗ ಕಣ್ಣು ಮತ್ತು ಕೈಗಳ ರಕ್ಷಣೆಗೆ ನೀವು ಯಾವ ಮುನ್ನೆಚ್ಚರಿಕೆ ತೆಗೆದುಕೊಳ್ಳುತ್ತೀರಿ?',
      ],
    },
    Painter: {
      'en-IN': [
        'An interior wall has severe moisture efflorescence (shora/saltpeter) peeling off paint. How do you scrape and treat it before repainting?',
        'How many coats of wall putty and primer do you apply on new plastered walls, and what sanding grit paper do you use?',
        'What is the difference in preparation between applying acrylic exterior weatherproof emulsion versus interior royale finish?',
        'Safety question: When painting with oil-based enamel paints or using a tall extension ladder, what ventilation and mask precautions do you take?',
      ],
      'hi-IN': [
        'दीवार पर सीलन और शोरा (सफेद पपड़ी) आ रही है जिससे पेंट झड़ रहा है। दोबारा पेंट करने से पहले आप इसे कैसे साफ और तैयार करेंगे?',
        'नए प्लास्टर वाली दीवार पर पुट्टी के कितने कोट और कौन से नंबर का रेगमार (सैंडपेपर) इस्तेमाल करते हैं?',
        'घर के बाहर का वेदरप्रूफ पेंट और अंदर का रॉयल फिनिश पेंट करने की तैयारी में क्या फर्क होता है?',
        'सुरक्षा सवाल: ऊंची सीढ़ी पर चढ़कर पेंट करते समय और इनैमल पेंट की गंध से बचने के लिए आप क्या सुरक्षा बरतते हैं?',
      ],
      'kn-IN': [
        'ಗೋಡೆಯಲ್ಲಿ ತೇವಾಂಶದಿಂದ ಸುಣ್ಣ ಉದುರುತ್ತಿದ್ದರೆ, ಬಣ್ಣ ಹಚ್ಚುವ ಮೊದಲು ಗೋಡೆಯನ್ನು ಹೇಗೆ ಸಿದ್ಧಪಡಿಸುತ್ತೀರಿ?',
        'ಹೊಸ ಗೋಡೆಗೆ ಪುಟ್ಟಿ ಹಚ್ಚುವಾಗ ಎಷ್ಟು ಕೋಟ್ ಹಾಕಬೇಕು ಮತ್ತು ಯಾವ ಸ್ಯಾಂಡ್‌ಪೇಪರ್ ಬಳಸುತ್ತೀರಿ?',
        'ಎಣ್ಣೆ ಬಣ್ಣ (ಇನಾಮೆಲ್) ಅಥವಾ ಎಮಲ್ಷನ್ ಬಣ್ಣ ಹಚ್ಚುವಾಗ ನೀವು ಯಾವ ಕ್ರಮ ಅನುಸರಿಸುತ್ತೀರಿ?',
        'ಸುರಕ್ಷತಾ ಪ್ರಶ್ನೆ: ಎತ್ತರದ ಏಣಿ ಮೇಲೆ ನಿಂತು ಬಣ್ಣ ಬಳಿಯುವಾಗ ನೀವು ಯಾವ ಮುನ್ನೆಚ್ಚರಿಕೆ ವಹಿಸುತ್ತೀರಿ?',
      ],
    },
    Welder: {
      'en-IN': [
        'When welding thin 1.2mm square pipes for a gate versus thick 10mm structural I-beams, how do you adjust current (amperage)?',
        'How do you prevent metal distortion and warping when welding a long iron balcony railing?',
        'What welding rod number (e.g. 6013 vs 7018) do you select for general MS gate fabrication?',
        'Safety question: What shade of welding helmet glass and leather safety gloves do you wear to prevent arc-eye flash and UV burns?',
      ],
      'hi-IN': [
        'गेट के पतले पाइप (1.2mm) और भारी एंगल/गाटर वेल्डिंग करते समय आप वेल्डिंग मशीन का करंट (amperage) कैसे सेट करते हैं?',
        'लंबी लोहे की रेलिंग की वेल्डिंग करते समय गर्मी से लोहा टेढ़ा (twist) न हो, इसके लिए आप क्या तरीका अपनाते हैं?',
        'सामान्य MS पाइप और गेट बनाने के लिए आप कौन से नंबर का वेल्डिंग रॉड चुनते हैं?',
        'सुरक्षा सवाल: वेल्डिंग की चमक से आंखें और त्वचा जलने से बचने के लिए आप कौन सा शीशा (shade glass) और सुरक्षा दस्ताने पहनते हैं?',
      ],
      'kn-IN': [
        'ತೆಳುವಾದ ಪೈಪ್ ಮತ್ತು ದಪ್ಪ ಕಬ್ಬಿಣವನ್ನು ವೆಲ್ಡಿಂಗ್ ಮಾಡುವಾಗ ಮಿಷನ್ ಕರೆಂಟ್ (ಆಂಪಿಯರ್) ಹೇಗೆ ಹೊಂದಿಸುತ್ತೀರಿ?',
        'ಉದ್ದವಾದ ಕಬ್ಬಿಣದ ರೇಲಿಂಗ್ ವೆಲ್ಡ್ ಮಾಡುವಾಗ ಅದು ಬಾಗದಂತೆ ನೀವು ಯಾವ ವಿಧಾನ ಬಳಸುತ್ತೀರಿ?',
        'ಸಾಮಾನ್ಯ ಗೇಟ್ ತಯಾರಿಕೆಗೆ ಯಾವ ನಂಬರ್ ವೆಲ್ಡಿಂಗ್ ರಾಡ್ ಸೂಕ್ತ?',
        'ಸುರಕ್ಷತಾ ಪ್ರಶ್ನೆ: ವೆಲ್ಡಿಂಗ್ ಸ್ಪಾರ್ಕ್‌ನಿಂದ ಕಣ್ಣುಗಳು ಮತ್ತು ಮುಖವನ್ನು ರಕ್ಷಿಸಲು ನೀವು ಯಾವ ಸುರಕ್ಷತಾ ಗ್ಲಾಸ್ ಬಳಸುತ್ತೀರಿ?',
      ],
    },
    Mechanic: {
      'en-IN': [
        'An engine cranks continuously but refuses to start. What two basic checks (fuel supply vs ignition spark) do you perform first?',
        'A vehicle pulls strongly to one side whenever the driver applies brakes. What mechanical component would you inspect?',
        'How do you determine if engine oil needs urgent replacement, and what symptoms indicate a worn-out clutch plate?',
        'Safety question: When lifting a vehicle with a hydraulic trolley jack, why must you always place jack stands before going underneath?',
      ],
      'hi-IN': [
        'गाड़ी का सेल्फ घूम रहा है लेकिन इंजन स्टार्ट नहीं हो रहा। आप पेट्रोल/डीजल सप्लाई और करंट (स्पार्क प्लग) में सबसे पहले क्या चेक करेंगे?',
        'ब्रेक दबाते ही गाड़ी एक तरफ खिंचती है। आप ब्रेक पैड, डिस्क या कैलिपर में क्या खराबी ढूंढेंगे?',
        'क्लच प्लेट घिस जाने पर गाड़ी चलाने में क्या लक्षण दिखाई देते हैं और इंजन ऑयल कब बदलना चाहिए?',
        'सुरक्षा सवाल: हाइड्रोलिक जैक पर गाड़ी उठाने के बाद नीचे घुसने से पहले जैक स्टैंड लगाना क्यों अनिवार्य है?',
      ],
      'kn-IN': [
        'ವಾಹನದ ಸೆಲ್ಫ್ ತಿರುಗುತ್ತಿದ್ದರೂ ಎಂಜಿನ್ ಸ್ಟಾರ್ಟ್ ಆಗುತ್ತಿಲ್ಲ. ನೀವು ಮೊದಲು ಪೆಟ್ರೋಲ್ ಸರಬರಾಜು ಅಥವಾ ಸ್ಪಾರ್ಕ್ ಪ್ಲಗ್‌ನಲ್ಲಿ ಏನನ್ನು ಪರೀಕ್ಷಿಸುತ್ತೀರಿ?',
        'ಬ್ರೇಕ್ ಹಾಕಿದಾಗ ಗಾಡಿ ಒಂದು ಬದಿಗೆ ಎಳೆಯುತ್ತಿದ್ದರೆ, ನೀವು ಯಾವ ಭಾಗವನ್ನು ಸರಿಪಡಿಸುತ್ತೀರಿ?',
        'ಕ್ಲಚ್ ಪ್ಲೇಟ್ ಹಾಳಾಗಿದೆ ಎಂದು ನೀವು ಹೇಗೆ ಗುರುತಿಸುತ್ತೀರಿ?',
        'ಸುರಕ್ಷತಾ ಪ್ರಶ್ನೆ: ಹೈಡ್ರಾಲಿಕ್ ಜ್ಯಾಕ್ ಮೇಲೆ ವಾಹನ ಎತ್ತಿದ ನಂತರ ಕೆಳಗೆ ಹೋಗುವ ಮೊದಲು ನೀವು ಯಾವ ಸುರಕ್ಷತಾ ಕ್ರಮಗಳನ್ನು ಕೈಗೊಳ್ಳುತ್ತೀರಿ?',
      ],
    },
  };

  const selectedTrade = tradeData[trade] || tradeData['Plumber'];
  return selectedTrade[lang] || selectedTrade['en-IN'];
}
