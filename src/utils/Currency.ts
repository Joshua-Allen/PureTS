// ============================================================
// utils/Currency.ts  —  Format microcent amounts for display.
// ============================================================

interface CurrencyMeta {
  symbol:      string;
  decimals:    number;
  symbolAfter: boolean;
}

const CURRENCY_META: Record<string, CurrencyMeta> = {
  USD: { symbol: '$',    decimals: 2, symbolAfter: false },
  CAD: { symbol: 'CA$',  decimals: 2, symbolAfter: false },
  JPY: { symbol: '¥',    decimals: 0, symbolAfter: false },
  EUR: { symbol: '€',    decimals: 2, symbolAfter: false },
  RUB: { symbol: '₽',    decimals: 2, symbolAfter: false },
  CNY: { symbol: 'CN¥',  decimals: 2, symbolAfter: false },
  PHP: { symbol: '₱',    decimals: 2, symbolAfter: false },
  INR: { symbol: '₹',    decimals: 2, symbolAfter: false },
  IDR: { symbol: 'Rp',   decimals: 0, symbolAfter: false },
  KRW: { symbol: '₩',    decimals: 0, symbolAfter: false },
  BRL: { symbol: 'R$',   decimals: 2, symbolAfter: false },
  MXN: { symbol: 'MX$',  decimals: 2, symbolAfter: false },
  DKK: { symbol: 'KR',   decimals: 2, symbolAfter: true  },
  PLN: { symbol: 'zl',   decimals: 2, symbolAfter: true  },
  VND: { symbol: '₫',    decimals: 0, symbolAfter: true  },
  TRY: { symbol: '₺',    decimals: 2, symbolAfter: false },
  CLP: { symbol: 'CLP',  decimals: 0, symbolAfter: true  },
  ARS: { symbol: 'ARS',  decimals: 2, symbolAfter: true  },
  PEN: { symbol: 'S/',   decimals: 2, symbolAfter: false },
  XGC: { symbol: 'GC',   decimals: 2, symbolAfter: true  },
  XSC: { symbol: 'SC',   decimals: 2, symbolAfter: true  },
};

export interface FormatCurrencyOptions {
  /** US mode: translate XGC → GC and XSC → SC */
  usMode?: boolean;
  /** Social mode: always render XSC / SC as "<amount> SC" */
  social?: boolean;
}

/**
 * Format a microcent amount for display.
 * @param microcents  Raw amount in microcents (1,000,000 = 1.00)
 * @param currency    ISO currency code or Stake Engine code (e.g. 'USD', 'XGC')
 * @param options     Optional US mode / social mode flags
 */
export function formatCurrency(
  microcents: number,
  currency:   string,
  options:    FormatCurrencyOptions = {},
): string {
  const { usMode = false, social = false } = options;

  const base = microcents / 1_000_000;

  // US mode: remap internal codes to display codes.
  let displayCurrency = currency;
  if (usMode && currency === 'XGC') displayCurrency = 'GC';
  if (usMode && currency === 'XSC') displayCurrency = 'SC';

  const meta: CurrencyMeta = CURRENCY_META[currency] ?? {
    symbol:      displayCurrency,
    decimals:    2,
    symbolAfter: true,
  };

  const formatted = base.toFixed(meta.decimals);

  // Social mode: SC always renders as "<amount> SC".
  if (social && (currency === 'XSC' || displayCurrency === 'SC')) {
    return `${formatted} SC`;
  }

  // US mode non-standard codes.
  if (usMode && (displayCurrency === 'GC' || displayCurrency === 'SC')) {
    return `${formatted} ${displayCurrency}`;
  }

  return meta.symbolAfter
    ? `${formatted} ${meta.symbol}`
    : `${meta.symbol}${formatted}`;
}
