export type AIProvider = 'openrouter' | 'local';

export interface AIConfig {
  provider: AIProvider;
  openrouterApiKey: string;
  openrouterModel: string;
  localBaseUrl: string;
  localModel: string;
}

export const FREE_MODELS = [
  'nvidia/nemotron-3-super-120b-a12b:free',
  'nvidia/nemotron-3.5-lightning:free',
  'google/gemma-4-31b-it:free',
  'thinkingmachines/inkling:free',
];

// The key is only seeded from .env.local during local development. Vite inlines
// VITE_* vars into the bundle at build time, so reading it in a production build
// would publish the key to anyone who opens the deployed JS. In production the
// user supplies their own key via Settings, stored in their own browser.
export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'openrouter',
  openrouterApiKey: import.meta.env.DEV ? (import.meta.env.VITE_OPENROUTER_API_KEY ?? '') : '',
  openrouterModel: import.meta.env.VITE_OPENROUTER_MODEL ?? FREE_MODELS[0],
  localBaseUrl: 'http://localhost:11434/v1',
  localModel: 'llama3.1',
};

const STORAGE_KEY = 'gymbudy:ai-config';

export function loadAIConfig(): AIConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_AI_CONFIG;
    return { ...DEFAULT_AI_CONFIG, ...(JSON.parse(raw) as Partial<AIConfig>) };
  } catch {
    return DEFAULT_AI_CONFIG;
  }
}

export function saveAIConfig(config: AIConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {}
}

export function isAIConfigured(config: AIConfig = loadAIConfig()): boolean {
  return config.provider === 'local' || config.openrouterApiKey.trim().length > 0;
}
