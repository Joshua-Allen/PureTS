// ============================================================
// utils/Strings.ts  —  Localised string lookup.
//                      Add new keys here before using them.
//                      Add new locales when needed.
// ============================================================

const locales = {
  en: {
    play: 'Play',

    // Replay mode terms
    baseBet: 'Base Bet',
    featureWorthMultiplier: 'Feature Worth Multiplier',
    totalFeatureWorth: 'Total Feature Worth',
    payoutMultiplier: 'Payout Multiplier',

    // Game info terms
    paytable: 'Paytable',
    payline: 'Payline',
    symbolPaytable: 'Symbol Paytable',

    // Popup titles
    selectBetAmount: 'Select Bet Amount',

    // Rules section multi-word phrases
    payLineLower: 'pay line',
    payLineUpper: 'Pay Line',
    linePlays: 'Line Plays',
    playMultipliers: 'Play Multipliers',
    linePlayLower: 'line play',

    // Social mode bonus terms
    buyBonusFeatures: 'Buy bonus features',
    buyBonusFeaturesLong: 'Buy bonus features for 100x current play',

    // Replay disclaimer
    replayDisclaimer: 'This is a replay of a previous bet round. No bets will be placed.',

    // Currency display
    xgc: 'XGC',
    xsc: 'XSC',

    // General terms
    betTitle: 'Bet',
    betsTitle: 'Bets',
    bet: 'bet',
    bets: 'bets',
  },
  en_US: {
    play: 'Play',

    // Replay mode terms
    baseBet: 'Base Play',
    featureWorthMultiplier: 'Play Worth Multiplier',
    totalFeatureWorth: 'Total Play Worth',
    payoutMultiplier: 'Win Multiplier',

    // Game info terms
    paytable: 'Wintable',
    payline: 'Winline',
    symbolPaytable: 'Symbol Wintable',

    // Popup titles
    selectBetAmount: 'Select Play Amount',

    // Rules section multi-word phrases
    payLineLower: 'win line',
    payLineUpper: 'Win Line',
    linePlays: 'Line Plays',
    playMultipliers: 'Play Multipliers',
    linePlayLower: 'line play',

    // Social mode bonus terms
    buyBonusFeatures: 'Get bonus features',
    buyBonusFeaturesLong: 'Get bonus features for 100x current play',

    // Replay disclaimer
    replayDisclaimer: 'This is a replay of a previous play round. No plays will be placed.',

    // Currency display
    xgc: 'GC',
    xsc: 'SC',

    // General terms
    betTitle: 'Play',
    betsTitle: 'Plays',
    bet: 'play',
    bets: 'plays',
  },
} as const;

export type Locale = keyof typeof locales;
export type StringKey = keyof typeof locales['en'];

let currentLocale: Locale = 'en';

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

export function t(key: StringKey): string {
  return locales[currentLocale][key];
}
