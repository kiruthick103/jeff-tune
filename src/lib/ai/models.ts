import type { AIModel } from '@/types';

export const AVAILABLE_MODELS: AIModel[] = [
    { id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini', description: 'Fast and smart general model', category: 'general' },
    { id: 'openai/gpt-4o', label: 'GPT-4o', description: 'Most capable OpenAI model', category: 'reasoning' },
    { id: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet', description: 'Best for writing & analysis', category: 'writing' },
    { id: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku', description: 'Fast Claude model', category: 'general' },
    { id: 'google/gemini-flash-1.5', label: 'Gemini Flash 1.5', description: 'Google fast model', category: 'general' },
    { id: 'google/gemma-3-4b-it:free', label: 'Gemma 3 4B (Free)', description: 'Free Google model', category: 'general' },
    { id: 'qwen/qwen3-4b:free', label: 'Qwen3 4B (Free)', description: 'Free Qwen model', category: 'general' },
];

export const DEFAULT_MODEL = 'openai/gpt-4o-mini';
export const DEFAULT_SYSTEM_PROMPT = 'You are Jeff Tune Pro, an advanced AI assistant designed to provide accurate, structured, and helpful responses. Always prioritize correctness and clarity.';

export function routeModel(message: string, requestedModel: string | null): string {
    if (requestedModel) return requestedModel;
    const lower = message.toLowerCase();
    if (/\b(code|debug|function|bug|script|api|regex|sql|typescript|python)\b/.test(lower)) {
        return 'anthropic/claude-3.5-sonnet';
    }
    if (/\b(write|story|essay|creative|poem|blog|article)\b/.test(lower)) {
        return 'anthropic/claude-3.5-sonnet';
    }
    if (/\b(reason|analyze|explain|compare|think|why|how does)\b/.test(lower)) {
        return 'openai/gpt-4o-mini';
    }
    return DEFAULT_MODEL;
}
