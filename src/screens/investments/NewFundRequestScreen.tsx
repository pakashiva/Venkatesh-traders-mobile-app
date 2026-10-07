import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FormSectionHeader from '../../components/form/FormSectionHeader';
import FormTextField from '../../components/form/FormTextField';
import FormSelectField from '../../components/form/FormSelectField';
import FormCheckbox from '../../components/form/FormCheckbox';
import PayableInfoBanner from '../../components/form/PayableInfoBanner';
import { useAuth } from '../../contexts/AuthContext';
import {
  formatPayableBreakdown,
} from '../../data/fundRequest';
import {
  getUserBankAccounts,
  verifyBankAccountOwnership,
} from '../../services/bankAccountService';
import {
  createFundRequest,
  getUserInvestmentTitles,
  validateFundAmount,
} from '../../services/investmentService';
import {
  lookupReferralCode,
  normalizeReferralCodeInput,
  validateReferralCodeForSubmit,
} from '../../services/referralService';
import {
  getUserNominees,
  verifyNomineeOwnership,
} from '../../services/nomineeService';
import { BankAccount, Nominee } from '../../types/fundRequest';
import { AddFundsStackScreenProps } from '../../navigation/types';
import {
  formatFundLimitHint,
  getInvestorPortalSettings,
  InvestorPortalSettings,
} from '../../services/portalSettingsService';
import { parseInrInput } from '../../utils/currency';
import { resolveAutoPayout } from '../../utils/payoutCycle';
import {
  isInvestmentTitleTaken,
  suggestNextInvestmentTitle,
} from '../../utils/fundTitle';
import {
  isMissingTableError,
  MISSING_INVESTMENTS_TABLE_MESSAGE,
} from '../../utils/supabaseErrors';
import { colors, spacing } from '../../theme/colors';

type Props = AddFundsStackScreenProps<'NewFundRequest'>;

export default function NewFundRequestScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const autoPayout = useMemo(() => resolveAutoPayout(), []);
  const [portalSettings, setPortalSettings] =
    useState<InvestorPortalSettings | null>(null);

  const [fundAmount, setFundAmount] = useState('');
  const [fundTitle, setFundTitle] = useState('Investment 1');
  const [existingTitles, setExistingTitles] = useState<string[]>([]);
  const [bankAccountId, setBankAccountId] = useState<string | null>(null);
  const [nomineeId, setNomineeId] = useState<string | null>(null);
  const [hasReferralCode, setHasReferralCode] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const payable = useMemo(
    () => formatPayableBreakdown(fundAmount),
    [fundAmount]
  );

  const loadFormOptions = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) {
      setBankAccounts([]);
      setNominees([]);
      setExistingTitles([]);
      setFundTitle('Investment 1');
      setIsLoadingOptions(false);
      return;
    }

    setIsLoadingOptions(true);

    try {
      const [accounts, nomineeList, titles, settings] = await Promise.all([
        getUserBankAccounts(userId),
        getUserNominees(userId),
        getUserInvestmentTitles(userId),
        getInvestorPortalSettings(),
      ]);
      setBankAccounts(accounts);
      setNominees(nomineeList);
      setExistingTitles(titles);
      setFundTitle(suggestNextInvestmentTitle(titles));
      setPortalSettings(settings);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load form data.';
      console.error('NewFundRequest options error:', message);
      Alert.alert('Unable to load form', message);
    } finally {
      setIsLoadingOptions(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    loadFormOptions();
  }, [loadFormOptions]);

  useEffect(() => {
    if (!hasReferralCode) {
      setReferrerName(null);
      return;
    }

    const normalized = normalizeReferralCodeInput(referralCode);
    if (!normalized || normalized.length < 6) {
      setReferrerName(null);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      void lookupReferralCode(normalized).then((result) => {
        if (!cancelled) {
          setReferrerName(result.valid ? result.referrerName : null);
        }
      });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [hasReferralCode, referralCode]);

  const goBackToInvestments = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MyInvestments');
    }
  };

  const handleSubmit = async () => {
    const userId = session?.user?.id;
    if (!userId) {
      Alert.alert('Sign in required', 'Please sign in to submit a fund request.');
      return;
    }

    if (!agreedToTerms) {
      Alert.alert(
        'Terms required',
        'You must agree to the Terms & Conditions before submitting.'
      );
      return;
    }

    const title = fundTitle.trim();
    if (!title) {
      Alert.alert('Title required', 'Please enter a title for this fund.');
      return;
    }

    if (isInvestmentTitleTaken(title, existingTitles)) {
      Alert.alert(
        'Title already used',
        'Please choose a different fund title. Each investment name must be unique.'
      );
      return;
    }

    const amount = parseInrInput(fundAmount);
    const amountError = validateFundAmount(
      amount,
      portalSettings
        ? {
            min: portalSettings.minInvestmentAmount,
            max: portalSettings.maxInvestmentAmount,
          }
        : undefined
    );
    if (amountError) {
      Alert.alert('Invalid amount', amountError);
      return;
    }

    if (!bankAccountId) {
      Alert.alert('Bank account required', 'Please select a source bank account.');
      return;
    }

    if (!nomineeId) {
      Alert.alert('Nominee required', 'Please select a nominee.');
      return;
    }

    if (hasReferralCode && referralCode.trim()) {
      const validation = await validateReferralCodeForSubmit(referralCode);
      if (!validation.valid) {
        Alert.alert(
          'Invalid referral code',
          validation.errorMessage ??
            'Please enter a valid referral code or leave it blank.'
        );
        return;
      }
    }

    if (bankAccounts.length === 0) {
      Alert.alert(
        'No bank accounts',
        'Add a bank account before submitting a fund request.'
      );
      return;
    }

    if (nominees.length === 0) {
      Alert.alert(
        'No nominees',
        'Add a nominee before submitting a fund request.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const ownsBank = await verifyBankAccountOwnership(userId, bankAccountId);
      const ownsNominee = await verifyNomineeOwnership(userId, nomineeId);

      if (!ownsBank) {
        Alert.alert('Invalid bank account', 'Please select a valid bank account.');
        return;
      }

      if (!ownsNominee) {
        Alert.alert('Invalid nominee', 'Please select a valid nominee.');
        return;
      }

      await createFundRequest({
        userId,
        title,
        fundAmount: amount,
        bankAccountId,
        nomineeId,
        payDate: autoPayout.payDateIso,
        referralCode: hasReferralCode
          ? normalizeReferralCodeInput(referralCode)
          : undefined,
      });

      navigation.navigate('MyInvestments');
    } catch (error) {
      const message = isMissingTableError(error)
        ? MISSING_INVESTMENTS_TABLE_MESSAGE
        : error instanceof Error
          ? error.message
          : 'Failed to submit fund request. Please try again.';
      Alert.alert('Submission failed', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goBackToInvestments}
          activeOpacity={0.7}
          hitSlop={8}
          style={styles.headerIconBtn}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Fund Request</Text>
        <TouchableOpacity
          onPress={goBackToInvestments}
          activeOpacity={0.7}
          style={styles.closeBtn}
        >
          <Ionicons name="close" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {isLoadingOptions ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color={colors.primarySoft} />
            </View>
          ) : null}

          <FormSectionHeader icon="wallet-outline" title="FUND DETAILS" />

          <FormTextField
            label="Title"
            required
            placeholder="Investment 1"
            hint="Default is Investment 1, 2, 3… You can rename it. Titles must be unique."
            value={fundTitle}
            onChangeText={setFundTitle}
            autoCapitalize="words"
          />

          <FormTextField
            label="Fund Amount (in ₹)"
            required
            placeholder="e.g. 1,00,000"
            hint={
              portalSettings
                ? formatFundLimitHint(portalSettings)
                : 'Loading investment limits...'
            }
            value={fundAmount}
            onChangeText={setFundAmount}
            keyboardType="numeric"
          />

          <FormSelectField
            label="Select Paydate"
            required
            labelIcon={
              <Ionicons name="calendar-outline" size={15} color={colors.textPrimary} />
            }
            placeholder="Choose a date"
            value={autoPayout.label}
            options={[{ id: autoPayout.label, label: autoPayout.label }]}
            onChange={() => {}}
            editable={false}
          />
          <Text style={styles.paydateHint}>
            Auto-set to the next payout day (1st, 5th, 10th, 15th, 20th, or
            25th). Admin can change this when approving the request.
          </Text>

          <FormSelectField
            label="Source Bank Account"
            required
            labelIcon={
              <Ionicons name="card-outline" size={15} color={colors.textPrimary} />
            }
            placeholder={
              bankAccounts.length === 0
                ? 'No bank accounts found'
                : 'Select account'
            }
            value={bankAccountId}
            options={bankAccounts.map((a) => ({
              id: a.id,
              label: a.label,
            }))}
            onChange={setBankAccountId}
          />

          <FormSectionHeader icon="person-outline" title="NOMINEE DETAILS" />

          <FormSelectField
            label="Select Nominee"
            required
            placeholder={
              nominees.length === 0 ? 'No nominees found' : 'Select an existing nominee'
            }
            value={nomineeId}
            options={nominees.map((n) => ({
              id: n.id,
              label: n.name,
            }))}
            onChange={setNomineeId}
          />

          <FormCheckbox
            checked={hasReferralCode}
            onChange={setHasReferralCode}
            label="I have a Referral Code (Optional)"
          />

          {hasReferralCode ? (
            <View>
              <FormTextField
                label="Referral Code"
                placeholder="e.g. 482913rahulsharma"
                value={referralCode}
                onChangeText={(text) =>
                  setReferralCode(normalizeReferralCodeInput(text))
                }
                autoCapitalize="none"
                autoCorrect={false}
              />
              {referrerName ? (
                <Text style={styles.referrerName}>
                  Referrer: {referrerName}
                </Text>
              ) : null}
            </View>
          ) : null}

          <PayableInfoBanner
            totalDisplay={payable.displayTotal}
            detail={payable.detail}
          />

          <FormCheckbox
            checked={agreedToTerms}
            onChange={setAgreedToTerms}
            label="I agree to the Terms & Conditions and understand all risks associated with this investment."
          />

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              activeOpacity={0.8}
              onPress={goBackToInvestments}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
              activeOpacity={0.85}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitText}>Submit Fund</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  referrerName: {
    marginTop: -8,
    marginBottom: 12,
    fontSize: 13,
    fontWeight: '600',
    color: colors.successText,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.screen,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -6,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginLeft: 4,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F2F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.screen,
    paddingTop: 12,
    paddingBottom: 28,
  },
  loadingWrap: {
    alignItems: 'center',
    marginBottom: 8,
  },
  paydateHint: {
    marginTop: -8,
    marginBottom: 14,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5A6577',
  },
  submitBtn: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
