import {
  getAvailableChatModelProviders,
  getAvailableEmbeddingModelProviders,
} from '@/lib/providers';
import { authenticateRequest } from '@/lib/auth';
import {
  getUserOpenaiApiKey,
  getUserGroqApiKey,
  getUserAnthropicApiKey,
  getUserGeminiApiKey,
  getUserOllamaApiEndpoint,
  getUserOllamaApiKey,
  getUserDeepseekApiKey,
  getUserAimlApiKey,
  getUserLMStudioApiEndpoint,
  getUserLemonadeApiEndpoint,
  getUserLemonadeApiKey,
  getUserCustomOpenaiApiUrl,
  getUserCustomOpenaiApiKey,
  getUserCustomOpenaiModelName,
  updateUserConfig,
} from '@/lib/userConfig';
import { NextRequest } from 'next/server';

export const GET = async (req: NextRequest) => {
  try {
    // Authenticate user
    const user = await authenticateRequest(req);
    if (!user) {
      return Response.json(
        { message: 'Authentication required' },
        { status: 401 },
      );
    }

    const config: Record<string, any> = {};

    const [chatModelProviders, embeddingModelProviders] = await Promise.all([
      getAvailableChatModelProviders(),
      getAvailableEmbeddingModelProviders(),
    ]);

    config['chatModelProviders'] = {};
    config['embeddingModelProviders'] = {};

    for (const provider in chatModelProviders) {
      config['chatModelProviders'][provider] = Object.keys(
        chatModelProviders[provider],
      ).map((model) => {
        return {
          name: model,
          displayName: chatModelProviders[provider][model].displayName,
        };
      });
    }

    for (const provider in embeddingModelProviders) {
      config['embeddingModelProviders'][provider] = Object.keys(
        embeddingModelProviders[provider],
      ).map((model) => {
        return {
          name: model,
          displayName: embeddingModelProviders[provider][model].displayName,
        };
      });
    }

    // Get user-specific configuration values
    config['openaiApiKey'] = await getUserOpenaiApiKey(user.id);
    config['ollamaApiUrl'] = await getUserOllamaApiEndpoint(user.id);
    config['ollamaApiKey'] = await getUserOllamaApiKey(user.id);
    config['lmStudioApiUrl'] = await getUserLMStudioApiEndpoint(user.id);
    config['lemonadeApiUrl'] = await getUserLemonadeApiEndpoint(user.id);
    config['lemonadeApiKey'] = await getUserLemonadeApiKey(user.id);
    config['anthropicApiKey'] = await getUserAnthropicApiKey(user.id);
    config['groqApiKey'] = await getUserGroqApiKey(user.id);
    config['geminiApiKey'] = await getUserGeminiApiKey(user.id);
    config['deepseekApiKey'] = await getUserDeepseekApiKey(user.id);
    config['aimlApiKey'] = await getUserAimlApiKey(user.id);
    config['customOpenaiApiUrl'] = await getUserCustomOpenaiApiUrl(user.id);
    config['customOpenaiApiKey'] = await getUserCustomOpenaiApiKey(user.id);
    config['customOpenaiModelName'] = await getUserCustomOpenaiModelName(
      user.id,
    );

    return Response.json({ ...config }, { status: 200 });
  } catch (err) {
    console.error('An error occurred while getting config:', err);
    return Response.json(
      { message: 'An error occurred while getting config' },
      { status: 500 },
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    // Authenticate user
    const user = await authenticateRequest(req);
    if (!user) {
      return Response.json(
        { message: 'Authentication required' },
        { status: 401 },
      );
    }

    const config = await req.json();

    const userConfigData = {
      providers: {
        OPENAI: {
          API_KEY: config.openaiApiKey,
        },
        GROQ: {
          API_KEY: config.groqApiKey,
        },
        ANTHROPIC: {
          API_KEY: config.anthropicApiKey,
        },
        GEMINI: {
          API_KEY: config.geminiApiKey,
        },
        OLLAMA: {
          API_URL: config.ollamaApiUrl,
          API_KEY: config.ollamaApiKey,
        },
        DEEPSEEK: {
          API_KEY: config.deepseekApiKey,
        },
        AIMLAPI: {
          API_KEY: config.aimlApiKey,
        },
        LM_STUDIO: {
          API_URL: config.lmStudioApiUrl,
        },
        LEMONADE: {
          API_URL: config.lemonadeApiUrl,
          API_KEY: config.lemonadeApiKey,
        },
        CUSTOM_OPENAI: {
          API_URL: config.customOpenaiApiUrl,
          API_KEY: config.customOpenaiApiKey,
          MODEL_NAME: config.customOpenaiModelName,
        },
      },
      customOpenaiBaseUrl: config.customOpenaiApiUrl,
      customOpenaiKey: config.customOpenaiApiKey,
    };

    await updateUserConfig(user.id, userConfigData);

    return Response.json({ message: 'Config updated' }, { status: 200 });
  } catch (err) {
    console.error('An error occurred while updating config:', err);
    return Response.json(
      { message: 'An error occurred while updating config' },
      { status: 500 },
    );
  }
};
