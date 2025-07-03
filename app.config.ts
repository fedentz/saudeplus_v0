import 'dotenv/config';

export default ({ config }: any) => ({
  ...config,
  name: "SaudePlus",
  slug: "tu-saudeplus",
  version: "1.0.0",
  extra: {
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    AUTH_DOMAIN: process.env.AUTH_DOMAIN,
    PROJECT_ID: process.env.PROJECT_ID,
    STORAGE_BUCKET: process.env.STORAGE_BUCKET,
    MESSAGING_SENDER_ID: process.env.MESSAGING_SENDER_ID,
    APP_ID: process.env.APP_ID,
    MEASUREMENT_ID: process.env.MEASUREMENT_ID,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  },
});
