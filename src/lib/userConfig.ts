import { db } from './db';
import { userConfigs } from './db/schema';
import { eq } from 'drizzle-orm';
import { loadConfig } from './config';

interface UserConfigData {
  providers?: Record<string, any>;
  models?: Record<string, any>;
  customOpenaiBaseUrl?: string;
  customOpenaiKey?: string;
}

interface ConfigProviders {
  OPENAI?: { API_KEY?: string };
  GROQ?: { API_KEY?: string };
  ANTHROPIC?: { API_KEY?: string };
  GEMINI?: { API_KEY?: string };
  OLLAMA?: { API_URL?: string; API_KEY?: string };
  DEEPSEEK?: { API_KEY?: string };
  AIMLAPI?: { API_KEY?: string };
  LM_STUDIO?: { API_URL?: string };
  LEMONADE?: { API_URL?: string; API_KEY?: string };
  CUSTOM_OPENAI?: { API_URL?: string; API_KEY?: string; MODEL_NAME?: string };
}

// Get user configuration with fallback to global config
export const getUserConfig = async (
  userId: string,
): Promise<UserConfigData> => {
  try {
    const userConfig = await db.query.userConfigs.findFirst({
      where: eq(userConfigs.userId, userId),
    });

    if (userConfig) {
      return {
        providers: userConfig.providers || {},
        models: userConfig.models || {},
        customOpenaiBaseUrl: userConfig.customOpenaiBaseUrl || undefined,
        customOpenaiKey: userConfig.customOpenaiKey || undefined,
      };
    }

    // Return empty config if no user config exists
    return {
      providers: {},
      models: {},
    };
  } catch (error) {
    console.error('Error loading user config:', error);
    return {
      providers: {},
      models: {},
    };
  }
};

// Create or update user configuration
export const updateUserConfig = async (
  userId: string,
  configData: UserConfigData,
): Promise<void> => {
  try {
    const existingConfig = await db.query.userConfigs.findFirst({
      where: eq(userConfigs.userId, userId),
    });

    const now = new Date().toISOString();

    if (existingConfig) {
      // Update existing config
      await db
        .update(userConfigs)
        .set({
          providers: configData.providers || {},
          models: configData.models || {},
          customOpenaiBaseUrl: configData.customOpenaiBaseUrl,
          customOpenaiKey: configData.customOpenaiKey,
          updatedAt: now,
        })
        .where(eq(userConfigs.userId, userId));
    } else {
      // Create new config
      await db.insert(userConfigs).values({
        userId,
        providers: configData.providers || {},
        models: configData.models || {},
        customOpenaiBaseUrl: configData.customOpenaiBaseUrl,
        customOpenaiKey: configData.customOpenaiKey,
        createdAt: now,
        updatedAt: now,
      });
    }
  } catch (error) {
    console.error('Error updating user config:', error);
    throw error;
  }
};

// Helper functions to get specific values with fallback to global config
export const getUserOpenaiApiKey = async (userId: string): Promise<string> => {
  const userConfig = await getUserConfig(userId);
  const providers = userConfig.providers as ConfigProviders;
  return providers?.OPENAI?.API_KEY || loadConfig().MODELS.OPENAI.API_KEY || '';
};

export const getUserGroqApiKey = async (userId: string): Promise<string> => {
  const userConfig = await getUserConfig(userId);
  const providers = userConfig.providers as ConfigProviders;
  return providers?.GROQ?.API_KEY || loadConfig().MODELS.GROQ.API_KEY || '';
};

export const getUserAnthropicApiKey = async (
  userId: string,
): Promise<string> => {
  const userConfig = await getUserConfig(userId);
  const providers = userConfig.providers as ConfigProviders;
  return (
    providers?.ANTHROPIC?.API_KEY || loadConfig().MODELS.ANTHROPIC.API_KEY || ''
  );
};

export const getUserGeminiApiKey = async (userId: string): Promise<string> => {
  const userConfig = await getUserConfig(userId);
  const providers = userConfig.providers as ConfigProviders;
  return providers?.GEMINI?.API_KEY || loadConfig().MODELS.GEMINI.API_KEY || '';
};

export const getUserOllamaApiEndpoint = async (
  userId: string,
): Promise<string> => {
  const userConfig = await getUserConfig(userId);
  const providers = userConfig.providers as ConfigProviders;
  return providers?.OLLAMA?.API_URL || loadConfig().MODELS.OLLAMA.API_URL || '';
};

export const getUserOllamaApiKey = async (userId: string): Promise<string> => {
  const userConfig = await getUserConfig(userId);
  const providers = userConfig.providers as ConfigProviders;
  return providers?.OLLAMA?.API_KEY || loadConfig().MODELS.OLLAMA.API_KEY || '';
};

export const getUserDeepseekApiKey = async (
  userId: string,
): Promise<string> => {
  const userConfig = await getUserConfig(userId);
  const providers = userConfig.providers as ConfigProviders;
  return (
    providers?.DEEPSEEK?.API_KEY || loadConfig().MODELS.DEEPSEEK.API_KEY || ''
  );
};

export const getUserAimlApiKey = async (userId: string): Promise<string> => {
  const userConfig = await getUserConfig(userId);
  const providers = userConfig.providers as ConfigProviders;
  return (
    providers?.AIMLAPI?.API_KEY || loadConfig().MODELS.AIMLAPI.API_KEY || ''
  );
};

export const getUserLMStudioApiEndpoint = async (
  userId: string,
): Promise<string> => {
  const userConfig = await getUserConfig(userId);
  const providers = userConfig.providers as ConfigProviders;
  return (
    providers?.LM_STUDIO?.API_URL || loadConfig().MODELS.LM_STUDIO.API_URL || ''
  );
};

export const getUserLemonadeApiEndpoint = async (
  userId: string,
): Promise<string> => {
  const userConfig = await getUserConfig(userId);
  const providers = userConfig.providers as ConfigProviders;
  return (
    providers?.LEMONADE?.API_URL || loadConfig().MODELS.LEMONADE.API_URL || ''
  );
};

export const getUserLemonadeApiKey = async (
  userId: string,
): Promise<string> => {
  const userConfig = await getUserConfig(userId);
  const providers = userConfig.providers as ConfigProviders;
  return (
    providers?.LEMONADE?.API_KEY || loadConfig().MODELS.LEMONADE.API_KEY || ''
  );
};

export const getUserCustomOpenaiApiUrl = async (
  userId: string,
): Promise<string> => {
  const userConfig = await getUserConfig(userId);
  const providers = userConfig.providers as ConfigProviders;
  return (
    providers?.CUSTOM_OPENAI?.API_URL ||
    userConfig.customOpenaiBaseUrl ||
    loadConfig().MODELS.CUSTOM_OPENAI.API_URL ||
    ''
  );
};

export const getUserCustomOpenaiApiKey = async (
  userId: string,
): Promise<string> => {
  const userConfig = await getUserConfig(userId);
  const providers = userConfig.providers as ConfigProviders;
  return (
    providers?.CUSTOM_OPENAI?.API_KEY ||
    userConfig.customOpenaiKey ||
    loadConfig().MODELS.CUSTOM_OPENAI.API_KEY ||
    ''
  );
};

export const getUserCustomOpenaiModelName = async (
  userId: string,
): Promise<string> => {
  const userConfig = await getUserConfig(userId);
  const providers = userConfig.providers as ConfigProviders;
  return (
    providers?.CUSTOM_OPENAI?.MODEL_NAME ||
    loadConfig().MODELS.CUSTOM_OPENAI.MODEL_NAME ||
    ''
  );
};
