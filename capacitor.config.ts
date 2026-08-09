import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.qorelab.serviceflow",
  appName: "ServiceFlow",
  webDir: ".vercel/output/static",
  server: {
    url: "https://serviceflow-frontend-xi.vercel.app",
    cleartext: false,
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
