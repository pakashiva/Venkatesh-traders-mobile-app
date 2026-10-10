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
import { useAuth } from '../../contexts/AuthContext';
import { unlockWithMpin, signOut } from '../../services/authService';
import { validateMpin } from '../../utils/validateMpin';
import { RootStackScreenProps } from '../../navigation/types';
import { authColors } from '../../theme/authColors';

type Props = RootStackScreenProps<'MpinLock'>;

export default function MpinLockScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { session, markAppUnlocked, clearOtpFlow, refreshUnlockWindow } =
    useAuth();
  const [mpin, setMpin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUnlock = async () => {
    const mpinError = validateMpin(mpin);
    if (mpinError) {
      setErrorMessage(mpinError);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await unlockWithMpin(mpin);
      await refreshUnlockWindow();
      markAppUnlocked();
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to unlock right now.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotMpin = () => {
    const email = session?.user?.email?.trim().toLowerCase();
    if (!email) {
      setErrorMessage(
        'Account email is missing. Sign out and use Forgot Password on the sign-in screen.'
      );
      return;
    }

    clearOtpFlow();
    navigation.navigate('VerifyMobileNumber', {
      mode: 'forgotMpin',
      email,
      sendOtp: true,
    });
  };

  const handleUsePassword = async () => {
    try {
      await signOut();
    } catch {
      // Still go to sign-in.
    }
    navigation.reset({
      index: 0,
      routes: [{ name: 'SignIn' }],
    });
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
          <Text style={styles.welcome}>Enter MPIN</Text>
          <Text style={styles.welcomeSubtitle}>
            Enter your 4-digit MPIN to unlock the app
          </Text>

          <SignInTextField
            label="MPIN"
            value={mpin}
            onChangeText={(text) => setMpin(text.replace(/\D/g, '').slice(0, 4))}
            placeholder="4-digit MPIN"
            secureTextEntry
            keyboardType="number-pad"
            returnKeyType="done"
            maxLength={4}
            onSubmitEditing={handleUnlock}
          />

          <TouchableOpacity
            style={styles.forgotBtn}
            activeOpacity={0.7}
            onPress={handleForgotMpin}
          >
            <Text style={styles.forgotText}>Forgot MPIN?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.signInBtn, isSubmitting && styles.signInBtnDisabled]}
            activeOpacity={0.85}
            onPress={handleUnlock}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.signInText}>Unlock</Text>
            )}
          </TouchableOpacity>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <TouchableOpacity
            style={styles.altBtn}
            activeOpacity={0.7}
            onPress={handleUsePassword}
          >
            <Text style={styles.altText}>Sign in with password / switch account</Text>
          </TouchableOpacity>
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
  altBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  altText: {
    fontSize: 13,
    fontWeight: '600',
    color: authColors.textMuted,
  },
});
