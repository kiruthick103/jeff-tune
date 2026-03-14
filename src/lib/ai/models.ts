import type { AIModel } from '@/types';

export const DEFAULT_MODEL = 'openai/gpt-4o-mini';
export const ROUTER_FALLBACK_MODEL = DEFAULT_MODEL;

export const AVAILABLE_MODELS: AIModel[] = [
    {
        id: DEFAULT_MODEL,
        label: 'GPT-4o Mini',
        description: 'Fast and efficient OpenAI model via OpenRouter',
        category: 'general',
    },
    {
        id: 'openai/gpt-4o',
        label: 'GPT-4o',
        description: 'Most capable OpenAI model via OpenRouter',
        category: 'general',
    },
    {
        id: 'openai/gpt-5.2',
        label: 'GPT-5.2',
        description: 'Latest OpenAI model via OpenRouter',
        category: 'general',
    },
];

export const ENABLED_MODEL_IDS = AVAILABLE_MODELS
    .filter((model) => model.isEnabled !== false)
    .map((model) => model.id);

export const DEFAULT_SYSTEM_PROMPT = 'You are Jeff Tune Pro, an advanced AI assistant designed to provide accurate, structured, and helpful responses. Always prioritize correctness and clarity.';

export function routeModel(_message: string, requestedModel: string | null): string {
    if (requestedModel) return requestedModel;
    return DEFAULT_MODEL;
}
