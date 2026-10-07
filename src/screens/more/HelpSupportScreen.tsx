import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  HELP_SUPPORT_CONTACTS,
  HELP_SUPPORT_HOURS,
  HelpContactItem,
} from '../../data/helpSupport';
import { getInvestorPortalSettings } from '../../services/portalSettingsService';
import { BRAND_LOGO_MARK } from '../../constants/brandAssets';
import { MoreStackScreenProps } from '../../navigation/types';
import { colors, spacing } from '../../theme/colors';

type Props = MoreStackScreenProps<'HelpSupport'>;

export default function HelpSupportScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [contacts, setContacts] = useState<HelpContactItem[]>(
    HELP_SUPPORT_CONTACTS
  );

  useFocusEffect(
    useCallback(() => {
      void getInvestorPortalSettings().then((settings) => {
        setContacts(
          HELP_SUPPORT_CONTACTS.map((item) => {
            if (item.id === 'email') {
              return { ...item, value: settings.supportEmail };
            }
            if (item.id === 'phone') {
              return { ...item, value: settings.supportPhone };
            }
            return item;
          })
        );
      });
    }, [])
  );

  const handleContactPress = async (
    action: 'phone' | 'email' | 'none',
    value: string
  ) => {
    if (action === 'none') {
      return;
    }

    const url =
      action === 'phone'
        ? `tel:${value.replace(/\s/g, '')}`
        : `mailto:${value}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert('Unable to open', 'This action is not supported on your device.');
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert('Unable to open', 'Please try again or contact us manually.');
    }
  };

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Help & Support</Text>
          <Text style={styles.subtitle}>
            Reach our team for help with investments, withdrawals, and account
            queries.
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Image
              source={BRAND_LOGO_MARK}
              style={styles.heroLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.heroTitle}>We are here to help</Text>
          <Text style={styles.heroText}>
            For faster assistance, keep your registered mobile number and
            investment reference handy when you contact us.
          </Text>
        </View>

        <Text style={styles.sectionHeading}>CONTACT DETAILS</Text>
        {contacts.map((item) => {
          const isInteractive = item.action !== 'none';

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.contactCard}
              activeOpacity={isInteractive ? 0.75 : 1}
              onPress={() => handleContactPress(item.action, item.value)}
              disabled={!isInteractive}
            >
              <View style={styles.iconCircle}>
                <Ionicons name={item.icon} size={18} color={colors.primarySoft} />
              </View>
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>{item.label}</Text>
                <Text style={styles.contactValue}>{item.value}</Text>
              </View>
              {isInteractive ? (
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textMuted}
                />
              ) : null}
            </TouchableOpacity>
          );
        })}

        <View style={styles.hoursCard}>
          <View style={styles.hoursRow}>
            <Ionicons name="time-outline" size={18} color={colors.primarySoft} />
            <Text style={styles.hoursTitle}>Support Hours</Text>
          </View>
          <Text style={styles.hoursText}>{HELP_SUPPORT_HOURS}</Text>
        </View>

        <View style={styles.noteCard}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={colors.primarySoft}
          />
          <Text style={styles.noteText}>
            Queries related to KYC, fund activation, or withdrawal status are
            typically resolved within 1–2 business days after verification.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.screen,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerSpacer: {
    width: 36,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.screen,
    paddingTop: 18,
    paddingBottom: 28,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 18,
    alignItems: 'center',
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8DEFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    padding: 8,
  },
  heroLogo: {
    width: 34,
    height: 34,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  heroText: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0EBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactText: {
    flex: 1,
    minWidth: 0,
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  hoursCard: {
    backgroundColor: '#F3F0FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8DEFF',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginTop: 6,
    marginBottom: 12,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  hoursTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  hoursText: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    paddingLeft: 26,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
});
