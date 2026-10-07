import { supabase } from '../lib/supabase';
import {
  AGREEMENT_CHARGES,
  FUND_AMOUNT_MINIMUM,
} from '../data/fundRequest';
import { HELP_SUPPORT_CONTACTS } from '../data/helpSupport';

export type InvestorPortalSettings = {
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  minInvestmentAmount: number;
  maxInvestmentAmount: number;
};

const FALLBACK_EMAIL =
  HELP_SUPPORT_CONTACTS.find((item) => item.id === 'email')?.value ??
  'support@roxrufinancial.in';
const FALLBACK_PHONE =
  HELP_SUPPORT_CONTACTS.find((item) => item.id === 'phone')?.value ??
  '+91 98234 56781';

const FALLBACK: InvestorPortalSettings = {
  platformName: 'Venkatesh Traders',
  supportEmail: FALLBACK_EMAIL,
  supportPhone: FALLBACK_PHONE,
  minInvestmentAmount: FUND_AMOUNT_MINIMUM,
  maxInvestmentAmount: 10000000,
};

function asNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function getInvestorPortalSettings(): Promise<InvestorPortalSettings> {
  const { data, error } = await supabase.rpc('get_investor_portal_settings');
  if (error || !data || typeof data !== 'object') {
    return FALLBACK;
  }

  const row = data as Record<string, unknown>;
  return {
    platformName: String(row.platform_name ?? FALLBACK.platformName),
    supportEmail: String(row.support_email ?? FALLBACK.supportEmail).trim(),
    supportPhone: String(row.support_phone ?? FALLBACK.supportPhone).trim(),
    minInvestmentAmount: asNumber(
      row.min_investment_amount,
      FALLBACK.minInvestmentAmount
    ),
    maxInvestmentAmount: asNumber(
      row.max_investment_amount,
      FALLBACK.maxInvestmentAmount
    ),
  };
}

export function formatFundLimitHint(settings: InvestorPortalSettings): string {
  const min = settings.minInvestmentAmount.toLocaleString('en-IN');
  const max = settings.maxInvestmentAmount.toLocaleString('en-IN');
  return `Minimum ₹${min} · Maximum ₹${max}. Agreement charges ₹${AGREEMENT_CHARGES.toLocaleString('en-IN')} are added separately.`;
}
