export default () => ({
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_change_in_prod',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  eval: {
    tokenSecret: process.env.EVAL_TOKEN_SECRET || 'dev_eval_secret',
    linkExpiryDays: parseInt(process.env.EVAL_LINK_DEFAULT_EXPIRY_DAYS || '7', 10),
    sessionMaxMinutes: parseInt(process.env.EVAL_SESSION_MAX_DURATION_MINUTES || '20', 10),
  },
  azure: {
    speech: {
      key: process.env.AZURE_SPEECH_KEY,
      region: process.env.AZURE_SPEECH_REGION || 'eastus',
      ttsVoice: process.env.AZURE_TTS_VOICE || 'es-MX-DaliaNeural',
      sttLanguage: process.env.AZURE_STT_LANGUAGE || 'es-MX',
    },
    openai: {
      key: process.env.AZURE_OPENAI_KEY,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-10-21',
      deploymentGpt4o: process.env.AZURE_OPENAI_DEPLOYMENT_GPT4O || 'gpt-4o',
      deploymentGpt4oMini: process.env.AZURE_OPENAI_DEPLOYMENT_GPT4O_MINI || 'gpt-4o-mini',
    },
  },
  storage: {
    endpoint: process.env.STORAGE_ENDPOINT,
    region: process.env.STORAGE_REGION || 'auto',
    accessKey: process.env.STORAGE_ACCESS_KEY,
    secretKey: process.env.STORAGE_SECRET_KEY,
    bucket: process.env.STORAGE_BUCKET_NAME || 'andrea-files',
    publicUrl: process.env.STORAGE_PUBLIC_URL,
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    from: process.env.EMAIL_FROM || 'noreply@andrea.app',
    fromName: process.env.EMAIL_FROM_NAME || 'ANDREA',
  },
});
