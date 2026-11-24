import { TradeType, SkillLevel, IndicativeWageRange } from '@/types/database';

// Small indicative daily wage lookup table (INR) by trade and assessed level
// Clearly marked as sample data estimates based on Indian metro markets
const WAGE_BASE_TABLE: Record<
  TradeType,
  Record<SkillLevel, { min: number; max: number }>
> = {
  Plumber: {
    beginner: { min: 550, max: 750 },
    intermediate: { min: 800, max: 1100 },
    expert: { min: 1150, max: 1550 },
    'needs more evidence': { min: 500, max: 800 },
  },
  Electrician: {
    beginner: { min: 600, max: 800 },
    intermediate: { min: 850, max: 1200 },
    expert: { min: 1250, max: 1700 },
    'needs more evidence': { min: 550, max: 850 },
  },
  Mason: {
    beginner: { min: 550, max: 700 },
    intermediate: { min: 750, max: 1050 },
    expert: { min: 1100, max: 1450 },
    'needs more evidence': { min: 500, max: 750 },
  },
  Carpenter: {
    beginner: { min: 600, max: 800 },
    intermediate: { min: 850, max: 1250 },
    expert: { min: 1300, max: 1750 },
    'needs more evidence': { min: 550, max: 850 },
  },
  Painter: {
    beginner: { min: 500, max: 700 },
    intermediate: { min: 750, max: 1000 },
    expert: { min: 1050, max: 1400 },
    'needs more evidence': { min: 500, max: 750 },
  },
  Welder: {
    beginner: { min: 600, max: 800 },
    intermediate: { min: 850, max: 1200 },
    expert: { min: 1250, max: 1650 },
    'needs more evidence': { min: 550, max: 850 },
  },
  Mechanic: {
    beginner: { min: 650, max: 850 },
    intermediate: { min: 900, max: 1300 },
    expert: { min: 1350, max: 1800 },
    'needs more evidence': { min: 600, max: 900 },
  },
};

export function getIndicativeWageRange(
  trade: TradeType,
  level: SkillLevel,
  area: string = 'Bengaluru'
): IndicativeWageRange {
  const tradeTable = WAGE_BASE_TABLE[trade] || WAGE_BASE_TABLE['Plumber'];
  const baseRange = tradeTable[level] || tradeTable['intermediate'];

  // Check if metropolitan city (Bengaluru, Mumbai, Delhi, Gurgaon, Noida, Hyderabad, Pune, Chennai)
  const isMetro = /(bengaluru|bangalore|mumbai|delhi|noida|gurgaon|gurugram|hyderabad|pune|chennai)/i.test(
    area
  );

  const multiplier = isMetro ? 1.0 : 0.85;
  const min = Math.round((baseRange.min * multiplier) / 50) * 50;
  const max = Math.round((baseRange.max * multiplier) / 50) * 50;

  const cityName = area ? area.split(',')[0].trim() : 'Local Area';

  return {
    min,
    max,
    label: `₹${min} - ₹${max}/day (Estimated rate for ${cityName} • sample data)`,
  };
}
