import { supabase } from '../lib/supabase';
import { AGREEMENT_CHARGES, FUND_AMOUNT_MINIMUM } from '../data/fundRequest';
import { getInvestorPortalSettings } from './portalSettingsService';
import { Investment, InvestmentStatus } from '../types/investment';
import { mapInvestmentAmounts } from '../utils/investmentFormat';
import { processUserInvestmentInterest } from './investmentInterestService';
import { normalizeReferralCodeInput } from './referralService';

export type InvestmentRow = {
  id: string;
  user_id: string;
  code: string;
  request_id?: string | null;
  name: string;
  detail_subtitle: string | null;
  status: InvestmentStatus;
  fund_amount: number;
  current_value: number | null;
  interest_rate: number;
  total_earnings: number;
  tds_deducted_amount: number;
  completed_interest_periods: number;
  invested_date: string | null;
  yield_rate: string | null;
  earned_interest: string | null;
  tds_deducted: string | null;
  net_earned: string | null;
  bank_account_id: string;
  nominee_id: string;
  pay_date: string;
  referral_code: string | null;
  agreement_charges: number;
  created_at: string;
  updated_at: string;
};

export type ActiveInvestmentOption = {
  id: string;
  label: string;
  code: string;
  name: string;
  principal: number;
  totalEarnings: number;
  withdrawalAmount: number;
  openPartialAmount: number;
  hasOpenFullWithdrawal: boolean;
  availablePrincipal: number;
};

export type CreateFundRequestInput = {
  userId: string;
  title: string;
  fundAmount: number;
  bankAccountId: string;
  nomineeId: string;
  payDate: string;
  referralCode?: string;
};

function mapInvestmentRow(row: InvestmentRow): Investment {
  const amounts = mapInvestmentAmounts(row);

  return {
    id: row.id,
    code: row.request_id?.trim() || row.code,
    name: row.name,
    detailSubtitle: row.detail_subtitle ?? `${row.name} Investment`,
    status: row.status,
    invested: amounts.invested,
    currentValue: amounts.currentValueDisplay,
    yieldRate: amounts.yieldRate,
    earnedInterest: amounts.earnedInterest,
    tdsDeducted: amounts.tdsDeductedDisplay,
    netEarned: amounts.netEarned,
  };
}

export function validateFundAmount(
  amount: number,
  limits?: { min: number; max: number }
): string | null {
  const min = limits?.min ?? FUND_AMOUNT_MINIMUM;
  const max = limits?.max ?? 10000000;
  if (!amount || amount < min) {
    return `Minimum fund amount is ₹${min.toLocaleString('en-IN')}.`;
  }
  if (amount > max) {
    return `Maximum fund amount is ₹${max.toLocaleString('en-IN')}.`;
  }
  return null;
}

export async function getUserInvestments(userId: string): Promise<Investment[]> {
  await processUserInvestmentInterest(userId);

  const { data, error } = await supabase
    .from('investments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapInvestmentRow(row as InvestmentRow));
}

export async function getInvestmentByIdForUser(
  userId: string,
  investmentId: string
): Promise<Investment | null> {
  await processUserInvestmentInterest(userId);

  const { data, error } = await supabase
    .from('investments')
    .select('*')
    .eq('user_id', userId)
    .eq('id', investmentId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return mapInvestmentRow(data as InvestmentRow);
}

export async function getActiveInvestmentsForWithdrawal(
  userId: string
): Promise<ActiveInvestmentOption[]> {
  await processUserInvestmentInterest(userId);

  const { data, error } = await supabase
    .from('investments')
    .select('id, code, request_id, name, fund_amount, total_earnings, current_value')
    .eq('user_id', userId)
    .eq('status', 'Active')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const investmentIds = (data ?? []).map((row) => row.id);
  const openByInvestment = await getOpenWithdrawalTotals(investmentIds);

  return (data ?? [])
    .map((row) => {
      const principal = Number(row.fund_amount);
      const totalEarnings = Number(row.total_earnings ?? 0);
      const withdrawalAmount =
        row.current_value != null
          ? Number(row.current_value)
          : principal + totalEarnings;
      const open = openByInvestment.get(row.id) ?? {
        openPartialAmount: 0,
        hasOpenFullWithdrawal: false,
      };
      const availablePrincipal = Math.max(
        0,
        principal - open.openPartialAmount
      );

      return {
        id: row.id,
        code: (row as { request_id?: string | null }).request_id?.trim() || row.code,
        name: row.name,
        label: `${
          (row as { request_id?: string | null }).request_id?.trim() || row.code
        } · ${row.name}`,
        principal,
        totalEarnings,
        withdrawalAmount,
        openPartialAmount: open.openPartialAmount,
        hasOpenFullWithdrawal: open.hasOpenFullWithdrawal,
        availablePrincipal,
      };
    })
    .filter((row) => !row.hasOpenFullWithdrawal);
}

async function getOpenWithdrawalTotals(
  investmentIds: string[]
): Promise<
  Map<string, { openPartialAmount: number; hasOpenFullWithdrawal: boolean }>
> {
  const map = new Map<
    string,
    { openPartialAmount: number; hasOpenFullWithdrawal: boolean }
  >();

  if (investmentIds.length === 0) {
    return map;
  }

  const { data, error } = await supabase
    .from('withdrawals')
    .select('investment_id, withdrawal_amount, strategy, status')
    .in('investment_id', investmentIds)
    .in('status', ['Processing', 'Approved']);

  if (error) {
    throw new Error(error.message);
  }

  for (const row of data ?? []) {
    const current = map.get(row.investment_id) ?? {
      openPartialAmount: 0,
      hasOpenFullWithdrawal: false,
    };

    if (row.strategy === 'full') {
      current.hasOpenFullWithdrawal = true;
    } else if (row.status === 'Processing') {
      current.openPartialAmount += Number(row.withdrawal_amount);
    }

    map.set(row.investment_id, current);
  }

  return map;
}

export async function getActiveInvestmentForUser(
  userId: string,
  investmentId: string
): Promise<ActiveInvestmentOption | null> {
  await processUserInvestmentInterest(userId);

  const { data, error } = await supabase
    .from('investments')
    .select(
      'id, code, request_id, name, fund_amount, total_earnings, current_value, status'
    )
    .eq('user_id', userId)
    .eq('id', investmentId)
    .eq('status', 'Active')
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const openByInvestment = await getOpenWithdrawalTotals([data.id]);
  const open = openByInvestment.get(data.id) ?? {
    openPartialAmount: 0,
    hasOpenFullWithdrawal: false,
  };

  const principal = Number(data.fund_amount);
  const totalEarnings = Number(data.total_earnings ?? 0);
  const withdrawalAmount =
    data.current_value != null
      ? Number(data.current_value)
      : principal + totalEarnings;

  const displayCode =
    (data as { request_id?: string | null }).request_id?.trim() || data.code;

  return {
    id: data.id,
    code: displayCode,
    name: data.name,
    label: `${displayCode} · ${data.name}`,
    principal,
    totalEarnings,
    withdrawalAmount,
    openPartialAmount: open.openPartialAmount,
    hasOpenFullWithdrawal: open.hasOpenFullWithdrawal,
    availablePrincipal: Math.max(0, principal - open.openPartialAmount),
  };
}

export async function getUserInvestmentTitles(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('investments')
    .select('name')
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? [])
    .map((row) => (typeof row.name === 'string' ? row.name : ''))
    .filter(Boolean);
}

export async function createFundRequest(
  input: CreateFundRequestInput
): Promise<Investment> {
  const settings = await getInvestorPortalSettings();
  const amountError = validateFundAmount(input.fundAmount, {
    min: settings.minInvestmentAmount,
    max: settings.maxInvestmentAmount,
  });
  if (amountError) {
    throw new Error(amountError);
  }

  const title = input.title.trim();
  if (!title) {
    throw new Error('Fund title is required.');
  }

  const existingTitles = await getUserInvestmentTitles(input.userId);
  const taken = existingTitles.some(
    (name) => name.trim().toLowerCase() === title.toLowerCase()
  );
  if (taken) {
    throw new Error(
      'An investment with this title already exists. Please choose a different name.'
    );
  }

  const { data, error } = await supabase
    .from('investments')
    .insert({
      user_id: input.userId,
      fund_amount: input.fundAmount,
      bank_account_id: input.bankAccountId,
      nominee_id: input.nomineeId,
      pay_date: input.payDate,
      referral_code: input.referralCode
        ? normalizeReferralCodeInput(input.referralCode)
        : null,
      agreement_charges: AGREEMENT_CHARGES,
      status: 'Pending',
      name: title,
      detail_subtitle: title,
      current_value: input.fundAmount,
      interest_rate: 0.05,
      tds_percent: 0.1,
      total_earnings: 0,
      tds_deducted_amount: 0,
      completed_interest_periods: 0,
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapInvestmentRow(data as InvestmentRow);
}
