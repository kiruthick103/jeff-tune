import type { AIModel } from '@/types';

export const DEFAULT_MODEL = 'moonshotai/Kimi-K2-Instruct-0905';
export const ROUTER_FALLBACK_MODEL = DEFAULT_MODEL;

export const AVAILABLE_MODELS: AIModel[] = [
    {
        id: DEFAULT_MODEL,
        label: 'Kimi K2 Instruct 0905',
        description: 'Stable default on Hugging Face Router',
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
