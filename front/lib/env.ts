// Configurações de ambiente centralizadas
export const env = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '/api',
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
} as const;

// Validação de variáveis obrigatórias
if (!env.API_URL) {
  throw new Error('API_URL environment variable is required');
}