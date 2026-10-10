import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AccountTypeSelector from '../../components/bank/AccountTypeSelector';
import RegistrationDateField from '../../components/registration/RegistrationDateField';
import RegistrationSectionHeader from '../../components/registration/RegistrationSectionHeader';
import RegistrationTextField from '../../components/registration/RegistrationTextField';
import FormSelectField from '../../components/form/FormSelectField';
import FormCheckbox from '../../components/form/FormCheckbox';
import {
  REGISTRATION_AUTHORIZATION_TEXT,
  REGISTRATION_FORM_DEFAULTS,
  REGISTRATION_MPIN_HINT,
  REGISTRATION_PASSWORD_HINT,
  REGISTRATION_SECURITY_TEXT,
  RELATIONSHIP_OPTIONS,
} from '../../data/registrationForm';
import PasswordInput from '../../components/auth/PasswordInput';
import { beginRegistration } from '../../services/registrationService';
import { useAuth } from '../../contexts/AuthContext';
import { detectBankNameFromIfsc } from '../../utils/bankName';
import { RootStackScreenProps } from '../../navigation/types';
import { RegistrationFormErrors } from '../../types/registrationForm';
import { authColors } from '../../theme/authColors';
import { colors, spacing } from '../../theme/colors';
import {
  hasFormErrors,
  validateRegistrationForm,
} from '../../utils/validateRegistrationForm';

type Props = RootStackScreenProps<'CreateAccount'>;

export default function CreateAccountScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const {
    setOtpFlow,
    clearOtpFlow,
    setBypassMobileVerification,
  } = useAuth();
  const [form, setForm] = useState(REGISTRATION_FORM_DEFAULTS);
  const [errors, setErrors] = useState<RegistrationFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSubmit = async () => {
    const nextErrors = validateRegistrationForm(form);
    setErrors(nextErrors);

    if (hasFormErrors(nextErrors)) {
      Alert.alert(
        'Check your form',
        'Please complete all required fields and fix any errors before submitting.'
      );
      return;
    }

    setIsSubmitting(true);
    // Mark registration OTP flow before signup creates a session,
    // so AuthNavigationHandler does not send the user to Home early.
    setBypassMobileVerification(false);
    setOtpFlow('registration');

    try {
      const result = await beginRegistration(form);
      navigation.replace('VerifyMobileNumber', {
        mode: 'registration',
        sendOtp: true,
        mobileNumber: result.mobileNumber,
      });
    } catch (error) {
      clearOtpFlow();
      const message =
        error instanceof Error
          ? error.message
          : 'Registration failed. Please try again.';
      Alert.alert('Registration failed', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.safe}>
      <StatusBar style="light" />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 32 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.securityBanner}>
            <Ionicons
              name="shield-checkmark"
              size={18}
              color={colors.successText}
            />
            <Text style={styles.securityText}>{REGISTRATION_SECURITY_TEXT}</Text>
          </View>

          <RegistrationSectionHeader
            number={1}
            title="Personal Details"
            description="Enter your legal details as per official documents"
          />

          <RegistrationTextField
            label="Full Name"
            required
            value={form.fullName}
            onChangeText={(text) => updateField('fullName', text)}
            error={errors.fullName}
            autoCapitalize="words"
          />
          <RegistrationTextField
            label="Mobile Number"
            required
            value={form.mobileNumber}
            onChangeText={(text) => updateField('mobileNumber', text)}
            error={errors.mobileNumber}
            keyboardType="phone-pad"
          />
          <RegistrationTextField
            label="Email Address"
            required
            value={form.emailAddress}
            onChangeText={(text) => updateField('emailAddress', text)}
            error={errors.emailAddress}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <RegistrationDateField
            label="Date of Birth"
            required
            value={form.dateOfBirth}
            onChange={(value) => updateField('dateOfBirth', value)}
            error={errors.dateOfBirth}
          />
          <RegistrationTextField
            label="Full Address"
            required
            value={form.address}
            onChangeText={(text) => updateField('address', text)}
            error={errors.address}
            placeholder="House / street, area, city, state, PIN code"
            multiline
          />

          <RegistrationSectionHeader
            number={2}
            title="KYC Documents Verification"
            description="Enter Aadhaar and PAN numbers for compliance"
          />

          <RegistrationTextField
            label="Aadhaar Card Number"
            required
            value={form.aadhaarNumber}
            onChangeText={(text) => updateField('aadhaarNumber', text)}
            error={errors.aadhaarNumber}
            keyboardType="number-pad"
          />

          <RegistrationTextField
            label="PAN Card Number"
            required
            value={form.panNumber}
            onChangeText={(text) => updateField('panNumber', text.toUpperCase())}
            error={errors.panNumber}
            autoCapitalize="characters"
          />

          <RegistrationSectionHeader
            number={3}
            title="Bank Account Details"
            description="For easy deposits and secure payouts"
          />

          <RegistrationTextField
            label="Account Holder Name"
            required
            value={form.accountHolderName}
            onChangeText={(text) => updateField('accountHolderName', text)}
            error={errors.accountHolderName}
            autoCapitalize="words"
          />
          <RegistrationTextField
            label="Account Number"
            required
            value={form.accountNumber}
            onChangeText={(text) =>
              updateField('accountNumber', text.replace(/[^\d]/g, ''))
            }
            error={errors.accountNumber}
            keyboardType="number-pad"
          />
          <RegistrationTextField
            label="Confirm Account Number"
            required
            value={form.confirmAccountNumber}
            onChangeText={(text) =>
              updateField('confirmAccountNumber', text.replace(/[^\d]/g, ''))
            }
            error={errors.confirmAccountNumber}
            keyboardType="number-pad"
          />
          <RegistrationTextField
            label="IFSC Code"
            required
            value={form.ifscCode}
            onChangeText={(text) => {
              const nextIfsc = text.toUpperCase();
              const detectedBank = detectBankNameFromIfsc(nextIfsc);
              setForm((prev) => ({
                ...prev,
                ifscCode: nextIfsc,
                ...(detectedBank ? { bankName: detectedBank } : {}),
              }));
              if (errors.ifscCode) {
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.ifscCode;
                  return next;
                });
              }
              if (detectedBank && errors.bankName) {
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.bankName;
                  return next;
                });
              }
            }}
            error={errors.ifscCode}
            autoCapitalize="characters"
          />

          <AccountTypeSelector
            value={form.accountType}
            onChange={(type) => updateField('accountType', type)}
          />

          <RegistrationTextField
            label="Bank Name"
            required
            value={form.bankName}
            onChangeText={(text) => updateField('bankName', text)}
            placeholder="Auto-detected from IFSC or enter manually"
            error={errors.bankName}
          />

          <RegistrationTextField
            label="Branch Name"
            required
            value={form.branchName}
            onChangeText={(text) => updateField('branchName', text)}
            placeholder="Enter branch name"
            error={errors.branchName}
            autoCapitalize="words"
          />

          <RegistrationSectionHeader
            number={4}
            title="Nominee Details"
            description="Nominate a successor for your digital assets"
          />

          <RegistrationTextField
            label="Nominee Name"
            required
            value={form.nomineeName}
            onChangeText={(text) => updateField('nomineeName', text)}
            error={errors.nomineeName}
            autoCapitalize="words"
          />

          <FormSelectField
            label="Relationship"
            required
            placeholder="Select relationship"
            value={form.relationship}
            options={RELATIONSHIP_OPTIONS}
            onChange={(id) => updateField('relationship', id)}
          />
          {errors.relationship ? (
            <Text style={styles.fieldError}>{errors.relationship}</Text>
          ) : null}

          <RegistrationTextField
            label="Nominee Aadhaar Number"
            required
            value={form.nomineeAadhaar}
            onChangeText={(text) => updateField('nomineeAadhaar', text)}
            error={errors.nomineeAadhaar}
            keyboardType="number-pad"
          />
          <RegistrationTextField
            label="Nominee's Mobile"
            required
            value={form.nomineeMobile}
            onChangeText={(text) => updateField('nomineeMobile', text)}
            error={errors.nomineeMobile}
            keyboardType="phone-pad"
          />
          <RegistrationTextField
            label="Nominee's PAN"
            required
            value={form.nomineePan}
            onChangeText={(text) =>
              updateField('nomineePan', text.toUpperCase())
            }
            error={errors.nomineePan}
            autoCapitalize="characters"
          />

          <RegistrationSectionHeader
            number={5}
            title="Set Password & MPIN"
            description="Password for sign-in; MPIN to unlock the app on this device"
          />

          <PasswordInput
            label="Password"
            required
            value={form.password}
            onChangeText={(text) => updateField('password', text)}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
          {errors.password ? (
            <Text style={styles.fieldError}>{errors.password}</Text>
          ) : null}

          <PasswordInput
            label="Confirm Password"
            required
            value={form.confirmPassword}
            onChangeText={(text) => updateField('confirmPassword', text)}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
          {errors.confirmPassword ? (
            <Text style={styles.fieldError}>{errors.confirmPassword}</Text>
          ) : null}

          <Text style={styles.passwordHint}>{REGISTRATION_PASSWORD_HINT}</Text>

          <PasswordInput
            label="MPIN"
            required
            value={form.mpin}
            onChangeText={(text) =>
              updateField('mpin', text.replace(/\D/g, '').slice(0, 4))
            }
            keyboardType="number-pad"
            maxLength={4}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
          {errors.mpin ? (
            <Text style={styles.fieldError}>{errors.mpin}</Text>
          ) : null}

          <PasswordInput
            label="Confirm MPIN"
            required
            value={form.confirmMpin}
            onChangeText={(text) =>
              updateField('confirmMpin', text.replace(/\D/g, '').slice(0, 4))
            }
            keyboardType="number-pad"
            maxLength={4}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
          />
          {errors.confirmMpin ? (
            <Text style={styles.fieldError}>{errors.confirmMpin}</Text>
          ) : null}

          <Text style={styles.passwordHint}>{REGISTRATION_MPIN_HINT}</Text>

          <FormCheckbox
            checked={form.authorized}
            onChange={(next) => updateField('authorized', next)}
            checkedColor={authColors.header}
            label={REGISTRATION_AUTHORIZATION_TEXT}
          />
          {errors.authorized ? (
            <Text style={styles.fieldError}>{errors.authorized}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitText}>Submit Registration</Text>
            )}
          </TouchableOpacity>
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
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: authColors.header,
    paddingHorizontal: spacing.screen,
    paddingBottom: 14,
    gap: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screen,
    paddingTop: 16,
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.successBg,
    borderWidth: 1,
    borderColor: '#B7E4C7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 22,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colors.successText,
    fontWeight: '500',
  },
  fieldError: {
    marginTop: -10,
    marginBottom: 12,
    fontSize: 12,
    color: '#FF3B30',
  },
  passwordHint: {
    fontSize: 12,
    lineHeight: 18,
    color: authColors.textMuted,
    marginTop: -8,
    marginBottom: 16,
  },
  submitBtn: {
    height: 52,
    borderRadius: 12,
    backgroundColor: authColors.header,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
