import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BrandLogo from '../../components/auth/BrandLogo';
import { BRAND_NAME, BRAND_TAGLINE } from '../../constants/brandAssets';
import SignInTextField from '../../components/auth/SignInTextField';
import { SIGN_IN_DEFAULTS } from '../../data/auth';
import { useAuth } from '../../contexts/AuthContext';
import {
  signInWithMobileOrEmail,
  resolveLoginEmail,
} from '../../services/authService';
import { RootStackScreenProps } from '../../navigation/types';
import { authColors } from '../../theme/authColors';

type Props = RootStackScreenProps<'SignIn'>;

export default function SignInScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const {
    setBypassMobileVerification,
    clearOtpFlow,
    markAppUnlocked,
    refreshUnlockWindow,
  } = useAuth();
  const [mobileOrEmail, setMobileOrEmail] = useState(
    SIGN_IN_DEFAULTS.mobileOrEmail
  );
  const [password, setPassword] = useState(SIGN_IN_DEFAULTS.password);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!mobileOrEmail.trim()) {
      setErrorMessage('Enter your mobile number or email.');
      return;
    }
    if (!password) {
      setErrorMessage('Enter your password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setBypassMobileVerification(true);
    clearOtpFlow();

    try {
      await signInWithMobileOrEmail(mobileOrEmail, password);
      await refreshUnlockWindow();
      markAppUnlocked();
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error) {
      setBypassMobileVerification(false);
      const message =
        error instanceof Error ? error.message : 'Unable to sign in right now.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!mobileOrEmail.trim()) {
      setErrorMessage('Enter your registered mobile number or email first.');
      return;
    }

    setErrorMessage(null);
    clearOtpFlow();

    try {
      const email = await resolveLoginEmail(mobileOrEmail);
      navigation.navigate('VerifyMobileNumber', {
        mode: 'forgotPassword',
        email,
        sendOtp: true,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to start password recovery.';
      setErrorMessage(message);
    }
  };

  return (
    <View style={styles.safe}>
      <StatusBar style="light" />

      <View style={[styles.header, { paddingTop: insets.top + 28 }]}>
        <BrandLogo size={104} />
        <Text style={styles.brandTitle}>{BRAND_NAME}</Text>
        <Text style={styles.brandTagline}>{BRAND_TAGLINE}</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.formSection}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.welcome}>Welcome</Text>
          <Text style={styles.welcomeSubtitle}>
            Sign in with your mobile number or email and password
          </Text>

          <SignInTextField
            label="Mobile Number or Email"
            value={mobileOrEmail}
            onChangeText={setMobileOrEmail}
            placeholder="10-digit mobile or email"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            returnKeyType="next"
          />

          <SignInTextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleSignIn}
          />

          <TouchableOpacity
            style={styles.forgotBtn}
            activeOpacity={0.7}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.signInBtn, isSubmitting && styles.signInBtnDisabled]}
            activeOpacity={0.85}
            onPress={handleSignIn}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.signInText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.orLine} />
          </View>

          <View style={styles.registerRow}>
            <Text style={styles.registerPrompt}>Don&apos;t have an account? </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('CreateAccount')}
            >
              <Text style={styles.registerLink}>Register Now</Text>
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
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  header: {
    backgroundColor: authColors.header,
    alignItems: 'center',
    paddingBottom: 36,
    paddingHorizontal: 24,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  brandTagline: {
    fontSize: 14,
    color: authColors.gold,
    fontWeight: '500',
  },
  formSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  formContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  welcome: {
    fontSize: 28,
    fontWeight: '700',
    color: authColors.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: authColors.textMuted,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -6,
    marginBottom: 22,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
    color: authColors.gold,
  },
  signInBtn: {
    height: 52,
    borderRadius: 12,
    backgroundColor: authColors.header,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  signInBtnDisabled: {
    opacity: 0.7,
  },
  errorText: {
    marginBottom: 16,
    fontSize: 13,
    lineHeight: 18,
    color: '#FF3B30',
    textAlign: 'center',
  },
  signInText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  orLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: authColors.divider,
  },
  orText: {
    marginHorizontal: 14,
    fontSize: 12,
    fontWeight: '600',
    color: authColors.textLight,
    letterSpacing: 0.5,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  registerPrompt: {
    fontSize: 14,
    color: authColors.textMuted,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: authColors.gold,
  },
});
