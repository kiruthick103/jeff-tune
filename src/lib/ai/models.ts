import type { AIModel } from '@/types';

export const DEFAULT_MODEL = 'openai/gpt-4o-mini';
export const ROUTER_FALLBACK_MODEL = DEFAULT_MODEL;

export const AVAILABLE_MODELS: AIModel[] = [
    // OpenRouter Models
    {
        id: 'openai/gpt-4o-mini',
        label: 'GPT-4o Mini (OpenRouter)',
        description: 'Fast and efficient OpenAI model via OpenRouter',
        category: 'general',
        provider: 'openrouter',
    },
    {
        id: 'openai/gpt-4o',
        label: 'GPT-4o (OpenRouter)',
        description: 'Most capable OpenAI model via OpenRouter',
        category: 'general',
        provider: 'openrouter',
    },
    {
        id: 'openai/gpt-5.2',
        label: 'GPT-5.2 (OpenRouter)',
        description: 'Latest OpenAI model via OpenRouter',
        category: 'general',
        provider: 'openrouter',
    },
    // Hugging Face Models
    {
        id: 'meta-llama/Llama-3.1-8B-Instruct',
        label: 'Llama 3.1 8B Instruct (HF)',
        description: 'Reliable lightweight instruction model via Hugging Face',
        category: 'general',
        provider: 'huggingface',
    },
    {
        id: 'Qwen/Qwen3-4B-Instruct-2507',
        label: 'Qwen 3 4B Instruct 2507 (HF)',
        description: 'Small and fast text model via Hugging Face',
        category: 'general',
        provider: 'huggingface',
    },
    {
        id: 'Qwen/Qwen3.5-27B',
        label: 'Qwen 3.5 27B (HF)',
        description: 'Image plus text understanding via Hugging Face',
        category: 'general',
        provider: 'huggingface',
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
