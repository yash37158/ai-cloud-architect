interface EnvironmentConfig {
  openaiApiKey: string;
  openaiBaseUrl: string;
  enableDebug: boolean;
  maxTokens: number;
  model: string;
}

export const getEnvironmentConfig = (): EnvironmentConfig => {
  return {
    openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    openaiBaseUrl: import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1',
    enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
    maxTokens: parseInt(import.meta.env.VITE_MAX_TOKENS || '2000'),
    model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4',
  };
};

export const isProduction = import.meta.env.PROD;
export const isDevelopment = import.meta.env.DEV;
