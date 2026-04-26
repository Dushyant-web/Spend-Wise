import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.spendwise.admin',
  appName: 'SpendWise Admin',
  webDir: 'out',

  ios: {
    contentInset: 'automatic',
    backgroundColor: '#060504',
  },

  android: {
    path: 'android-admin',
    backgroundColor: '#060504',
    allowMixedContent: false,
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#060504',
      showSpinner: false,
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#060504',
    },
  },
}

export default config
