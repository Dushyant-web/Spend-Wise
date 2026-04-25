import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.spendwise.app',
  appName: 'SpendWise',
  // 'out' is where `next build` puts static export files
  webDir: 'out',

  server: {
    // During `npx cap run ios/android` in dev, point to your local Next.js server
    // Comment this out for production builds
    // url: 'http://192.168.x.x:3000',
    // cleartext: true,
  },

  ios: {
    contentInset: 'automatic',
    backgroundColor: '#060504',
  },

  android: {
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
