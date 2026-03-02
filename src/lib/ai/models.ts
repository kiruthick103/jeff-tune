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
    {
        id: 'LiquidAI/LFM2-24B-A2B',
        label: 'Liquid LFM2 24B A2B (Unavailable here)',
        description: 'Not currently available on Hugging Face Router providers',
        category: 'general',
        isEnabled: false,
        availabilityNote: 'Use local Transformers runtime instead.',
    },
    {
        id: 'moonshotai/Kimi-K2.5',
        label: 'Kimi K2.5',
        description: 'Newer Kimi variant for broad tasks',
        category: 'general',
    },
    {
        id: 'Qwen/Qwen3.5-27B',
        label: 'Qwen 3.5 27B',
        description: 'Image plus text understanding',
        category: 'general',
    },
    {
        id: 'meta-llama/Llama-3.1-8B-Instruct',
        label: 'Llama 3.1 8B Instruct',
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
