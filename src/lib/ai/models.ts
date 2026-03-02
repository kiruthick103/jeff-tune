import type { AIModel } from '@/types';

export const DEFAULT_MODEL = 'LiquidAI/LFM2-24B-A2B';

export const AVAILABLE_MODELS: AIModel[] = [
    {
        id: DEFAULT_MODEL,
        label: 'Liquid LFM2 24B A2B',
        description: 'Balanced reasoning and chat quality',
        category: 'general',
    },
    {
        id: 'moonshotai/Kimi-K2-Instruct-0905:groq',
        label: 'Kimi K2 Instruct 0905 (Groq)',
        description: 'Fast and strong for general chat',
        category: 'general',
    },
    {
        id: 'moonshotai/Kimi-K2.5:novita',
        label: 'Kimi K2.5 (Novita)',
        description: 'Newer Kimi variant for broad tasks',
        category: 'general',
    },
    {
        id: 'Qwen/Qwen3.5-27B:novita',
        label: 'Qwen 3.5 27B (Novita)',
        description: 'Image plus text understanding',
        category: 'general',
    },
    {
        id: 'meta-llama/Llama-3.1-8B-Instruct:novita',
        label: 'Llama 3.1 8B Instruct (Novita)',
        description: 'Reliable lightweight instruction model',
        category: 'general',
    },
    {
        id: 'Qwen/Qwen3-4B-Instruct-2507',
        label: 'Qwen 3 4B Instruct 2507',
        description: 'Small and fast text model',
        category: 'general',
    },
    {
        id: 'unsloth/Qwen3.5-122B-A10B-GGUF',
        label: 'Qwen 3.5 122B GGUF (Local only)',
        description: 'GGUF model not available on HF Router chat API',
        category: 'general',
        isEnabled: false,
        availabilityNote: 'Local runtime required (llama.cpp/Ollama).',
    },
    {
        id: 'openbmb/MiniCPM-o-4_5-gguf',
        label: 'MiniCPM-o 4.5 GGUF (Local only)',
        description: 'GGUF model not available on HF Router chat API',
        category: 'general',
        isEnabled: false,
        availabilityNote: 'Local runtime required (llama.cpp/Ollama).',
    },
    {
        id: 'openbmb/MiniCPM-o-4_5',
        label: 'MiniCPM-o 4.5 (Local only)',
        description: 'Multimodal local model, not HF Router chat compatible',
        category: 'general',
        isEnabled: false,
        availabilityNote: 'Local runtime required (Transformers trust_remote_code).',
    },
    {
        id: 'deepseek-ai/DeepSeek-OCR',
        label: 'DeepSeek OCR (Local only)',
        description: 'OCR pipeline model, not HF Router chat compatible',
        category: 'general',
        isEnabled: false,
        availabilityNote: 'Local runtime required (Transformers OCR pipeline).',
    },
    {
        id: 'FlashLabs/Chroma-4B',
        label: 'Chroma 4B (Local only)',
        description: 'Direct Transformers runtime model, not HF Router chat compatible',
        category: 'general',
        isEnabled: false,
        availabilityNote: 'Local runtime required (Transformers trust_remote_code).',
    },
    {
        id: 'deepseek-ai/Janus-Pro-7B',
        label: 'Janus Pro 7B (Local only)',
        description: 'Direct Transformers runtime model, not HF Router chat compatible',
        category: 'general',
        isEnabled: false,
        availabilityNote: 'Local runtime required (Transformers).',
    },
    {
        id: 'LocoreMind/LocoOperator-4B',
        label: 'LocoOperator 4B (Local only)',
        description: 'Direct Transformers runtime model, not HF Router chat compatible',
        category: 'general',
        isEnabled: false,
        availabilityNote: 'Local runtime required (Transformers).',
    },
    {
        id: 'humain-ai/ALLaM-7B-Instruct-preview',
        label: 'ALLaM 7B Instruct Preview (Local only)',
        description: 'Direct Transformers runtime model, not HF Router chat compatible',
        category: 'general',
        isEnabled: false,
        availabilityNote: 'Local runtime required (Transformers).',
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
