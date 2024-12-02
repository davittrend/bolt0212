/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Firebase Config
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;

  // Pinterest Config
  readonly VITE_PINTEREST_API_URL: string;
  readonly VITE_PINTEREST_CLIENT_ID: string;
  readonly VITE_PINTEREST_CLIENT_SECRET: string;

  // Netlify Config
  readonly VITE_NETLIFY_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}