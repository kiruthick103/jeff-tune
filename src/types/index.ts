export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface Message {
    id: string;
    role: MessageRole;
    content: string;
    model?: string;
    tokens?: number;
    latencyMs?: number;
    createdAt?: string;
}

export interface Chat {
    id: string;
    title: string;
    systemPrompt?: string;
    createdAt: string;
}

export interface AIModel {
    id: string;
    label: string;
    description: string;
    category: 'coding' | 'writing' | 'reasoning' | 'general';
    isEnabled?: boolean;
    availabilityNote?: string;
}

export interface ChatSettings {
    model: string | null;
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
    isAgentMode: boolean;
    isDevMode: boolean;
}
