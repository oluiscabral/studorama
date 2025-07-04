// Global type declarations for build-time constants
declare const __APP_VERSION__: string;

// Extend Vite's ImportMetaEnv interface
interface ImportMetaEnv {
  readonly VITE_APP_VERSION: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}