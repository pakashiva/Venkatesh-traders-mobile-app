-- 1. Payout cycle: auto-pick the next day among 1, 5, 10, 15, 20, 25.
--    Admin can override payout_day; that choice becomes pay_date.
--    Interest still credits on the 30-day mark only after CURRENT_DATE >= pay_date.
-- 2. New referral codes are 6 digits. Existing codes are left unchanged.
-- 3. Withdrawal amount must be greater than zero for every strategy.
-- 4. Investor-safe read of portal settings (no gateway secrets).

-- ---------------------------------------------------------------------------
-- Payout cycle
-- ---------------------------------------------------------------------------
ALTER TABLE public.investments
  ADD COLUMN IF NOT EXISTS payout_day INTEGER;

ALTER TABLE public.investments
  ADD COLUMN IF NOT EXISTS payout_day_overridden BOOLEAN NOT NULL DEFAULT FALSE;

CREATE OR REPLACE FUNCTION public.next_payout_cycle_day(p_date DATE)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_day INTEGER := EXTRACT(DAY FROM p_date)::INTEGER;
  v_cycle INTEGER;
BEGIN
  FOREACH v_cycle IN ARRAY ARRAY[1, 5, 10, 15, 20, 25]
  LOOP
    IF v_cycle > v_day THEN
      RETURN v_cycle;
    END IF;
  END LOOP;
  RETURN 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.pay_date_for_cycle(p_base DATE, p_cycle_day INTEGER)
RETURNS DATE
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_cycle_day IS NULL OR NOT (p_cycle_day = ANY (ARRAY[1, 5, 10, 15, 20, 25])) THEN
    RAISE EXCEPTION 'Payout day must be one of 1, 5, 10, 15, 20, or 25.';
  END IF;

  IF p_cycle_day > EXTRACT(DAY FROM p_base)::INTEGER THEN
    RETURN make_date(
      EXTRACT(YEAR FROM p_base)::INTEGER,
      EXTRACT(MONTH FROM p_base)::INTEGER,
      p_cycle_day
    );
  END IF;

  RETURN (date_trunc('month', p_base) + INTERVAL '1 month')::DATE
    + (p_cycle_day - 1);
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_sync_investment_pay_date()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_base DATE;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_base := COALESCE(NEW.invested_date, CURRENT_DATE);
    IF NEW.payout_day IS NOT NULL
       AND NEW.payout_day IS DISTINCT FROM public.next_payout_cycle_day(v_base)
       AND NEW.payout_day = ANY (ARRAY[1, 5, 10, 15, 20, 25]) THEN
      NEW.payout_day_overridden := TRUE;
      NEW.pay_date := public.pay_date_for_cycle(v_base, NEW.payout_day);
    ELSE
      NEW.payout_day := public.next_payout_cycle_day(v_base);
      NEW.pay_date := public.pay_date_for_cycle(v_base, NEW.payout_day);
      NEW.payout_day_overridden := FALSE;
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.status = 'Active'
     AND OLD.status IS DISTINCT FROM NEW.status
     AND OLD.status IN ('Pending', 'Under Review') THEN
    NEW.invested_date := COALESCE(NEW.invested_date, CURRENT_DATE);
    IF NOT COALESCE(OLD.payout_day_overridden, FALSE) THEN
      NEW.payout_day := public.next_payout_cycle_day(NEW.invested_date);
      NEW.payout_day_overridden := FALSE;
    END IF;
    NEW.pay_date := public.pay_date_for_cycle(NEW.invested_date, NEW.payout_day);
    RETURN NEW;
  END IF;

  IF NEW.payout_day IS DISTINCT FROM OLD.payout_day THEN
    IF NOT (NEW.payout_day = ANY (ARRAY[1, 5, 10, 15, 20, 25])) THEN
      RAISE EXCEPTION 'Payout day must be one of 1, 5, 10, 15, 20, or 25.';
    END IF;
    NEW.payout_day_overridden := TRUE;
    v_base := COALESCE(NEW.invested_date, CURRENT_DATE);
    NEW.pay_date := public.pay_date_for_cycle(v_base, NEW.payout_day);
  END IF;

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'trg_sync_investment_pay_date'
      AND n.nspname = 'public'
      AND c.relname = 'investments'
      AND NOT t.tgisinternal
  ) THEN
    CREATE TRIGGER trg_sync_investment_pay_date
      BEFORE INSERT OR UPDATE OF payout_day, status, invested_date
      ON public.investments
      FOR EACH ROW
      EXECUTE FUNCTION public.trg_sync_investment_pay_date();
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Referral codes: new codes are 6 digits. Existing rows are not rewritten.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  constraint_name text;
  constraint_def text;
BEGIN
  SELECT con.conname, pg_get_constraintdef(con.oid)
  INTO constraint_name, constraint_def
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
  WHERE nsp.nspname = 'public'
    AND rel.relname = 'referral_codes'
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) ILIKE '%referral_code%'
  LIMIT 1;

  -- Drops the CHECK rule only so 6-digit codes are allowed. No rows are deleted.
  IF constraint_name IS NOT NULL AND constraint_def NOT ILIKE '%[0-9]{6}$%' THEN
    EXECUTE format(
      'ALTER TABLE public.referral_codes DROP CONSTRAINT %I',
      constraint_name
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'referral_codes_format'
      AND conrelid = 'public.referral_codes'::regclass
  ) THEN
    ALTER TABLE public.referral_codes
      ADD CONSTRAINT referral_codes_format
      CHECK (
        referral_code ~ '^[0-9]{6}$'
        OR referral_code ~ '^[0-9]{6}[a-z0-9]+$'
        OR referral_code ~ '^[A-Z0-9]{8}$'
      );
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.generate_unique_referral_code(p_user_id uuid DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
VOLATILE
AS $$
DECLARE
  result text;
  attempts int := 0;
BEGIN
  -- p_user_id is unused. Kept so existing callers do not break.
  LOOP
    result := lpad((floor(random() * 1000000))::int::text, 6, '0');

    IF NOT EXISTS (
      SELECT 1 FROM public.referral_codes WHERE referral_code = result
    ) THEN
      RETURN result;
    END IF;

    attempts := attempts + 1;
    IF attempts > 200 THEN
      RAISE EXCEPTION 'Could not generate a unique referral code.';
    END IF;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_valid_referral_code_format(p_code text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT
    p_code ~ '^[0-9]{6}$'
    OR p_code ~ '^[0-9]{6}[a-z0-9]+$'
    OR upper(p_code) ~ '^[A-Z0-9]{8}$';
$$;

-- ---------------------------------------------------------------------------
-- Withdrawals must be greater than zero
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_withdrawal_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_principal NUMERIC(15, 2);
  v_total_earnings NUMERIC(15, 2);
  v_current_value NUMERIC(15, 2);
  v_full_amount NUMERIC(15, 2);
  v_open_full_count INTEGER;
  v_open_partial_sum NUMERIC(15, 2);
  v_available_principal NUMERIC(15, 2);
BEGIN
  IF NEW.withdrawal_amount IS NULL OR NEW.withdrawal_amount <= 0 THEN
    RAISE EXCEPTION 'Withdrawal amount must be greater than zero.';
  END IF;

  SELECT fund_amount, total_earnings, current_value
  INTO v_principal, v_total_earnings, v_current_value
  FROM public.investments
  WHERE id = NEW.investment_id
    AND user_id = NEW.user_id
    AND status = 'Active';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Active investment not found for withdrawal.';
  END IF;

  SELECT COUNT(*)
  INTO v_open_full_count
  FROM public.withdrawals
  WHERE investment_id = NEW.investment_id
    AND status IN ('Processing', 'Approved')
    AND strategy = 'full';

  IF v_open_full_count > 0 THEN
    RAISE EXCEPTION 'A full withdrawal request is already open for this fund. Wait for it to be rejected before requesting again.';
  END IF;

  SELECT COALESCE(SUM(withdrawal_amount), 0)
  INTO v_open_partial_sum
  FROM public.withdrawals
  WHERE investment_id = NEW.investment_id
    AND status = 'Processing'
    AND strategy = 'partial';

  v_available_principal := v_principal - v_open_partial_sum;

  IF NEW.strategy = 'partial' THEN
    IF NEW.withdrawal_amount > v_available_principal THEN
      RAISE EXCEPTION 'Withdrawal amount exceeds available principal for this fund (₹%).',
        to_char(GREATEST(v_available_principal, 0), 'FM9999999990.00');
    END IF;

    IF NEW.withdrawal_amount >= v_principal THEN
      RAISE EXCEPTION 'Use full withdrawal to withdraw the entire principal.';
    END IF;
  ELSE
    IF v_open_partial_sum > 0 THEN
      RAISE EXCEPTION 'Clear or wait for open partial withdrawal requests before requesting a full withdrawal.';
    END IF;

    v_full_amount := COALESCE(v_current_value, v_principal + COALESCE(v_total_earnings, 0));
    IF v_full_amount <= 0 THEN
      RAISE EXCEPTION 'Withdrawal amount must be greater than zero.';
    END IF;
    IF ABS(NEW.withdrawal_amount - v_full_amount) > 0.01 THEN
      RAISE EXCEPTION 'Full withdrawal amount must equal current investment value.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Public investor settings (email, phone, min/max). No API secrets.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_investor_portal_settings()
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.admin_portal_settings%ROWTYPE;
BEGIN
  SELECT * INTO v_row FROM public.admin_portal_settings WHERE id = 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Portal settings are not configured.';
  END IF;

  RETURN json_build_object(
    'platform_name', v_row.platform_name,
    'support_email', v_row.support_email,
    'support_phone', v_row.support_phone,
    'min_investment_amount', v_row.min_investment_amount,
    'max_investment_amount', v_row.max_investment_amount
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_investor_portal_settings() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_investor_portal_settings() TO anon, authenticated;
