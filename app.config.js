module.exports = {
  expo: {
    name: 'Venkatesh Traders',
    slug: 'mobile-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',

    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },

    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.pakashiva.mobileapp',
    },

    android: {
      package: 'com.pakashiva.mobileapp',
      softwareKeyboardLayoutMode: 'resize',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
    },

    plugins: [
      '@react-native-community/datetimepicker',
      'expo-font',
    ],

    web: {
      favicon: './assets/favicon.png',
    },

    extra: {
      supabaseUrl:
        process.env.EXPO_PUBLIC_SUPABASE_URL ??
        process.env.NEXT_PUBLIC_SUPABASE_URL,

      supabasePublishableKey:
        process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,

      otpApiBaseUrl:
        process.env.EXPO_PUBLIC_OTP_API_BASE_URL ??
        'https://api.notify.elvatech.in',

      otpAppId:
        process.env.EXPO_PUBLIC_OTP_APP_ID ??
        'eNandi',

      otpApiKey:
        process.env.EXPO_PUBLIC_OTP_API_KEY,

      otpBrandId:
        process.env.EXPO_PUBLIC_OTP_BRAND_ID ??
        'elva-sales',

      eas: {
        projectId: '3f958438-fa09-4245-ae4d-bdb16cb9e278',
      },
    },
  },
};
