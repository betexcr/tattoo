import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.inkandsoul.app',
  appName: 'INK & SOUL',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
