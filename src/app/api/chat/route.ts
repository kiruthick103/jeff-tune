import { z } from 'zod';
import { routeModel, DEFAULT_SYSTEM_PROMPT, ENABLED_MODEL_IDS } from '@/lib/ai/models';

export const runtime = 'edge';

const HF_ROUTER_URL = 'https://router.huggingface.co/v1/chat/completions';
const ALLOWED_MODELS = new Set(ENABLED_MODEL_IDS);
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

type RateLimitState = {
    count: number;
    resetAt: number;
};

const requestWindow = new Map<string, RateLimitState>();

function getClientKey(req: Request): string {
    const cfIp = req.headers.get('cf-connecting-ip')?.trim();
    if (cfIp) return cfIp;

    const forwardedFor = req.headers.get('x-forwarded-for');
    if (forwardedFor) {
        const firstIp = forwardedFor.split(',')[0]?.trim();
        if (firstIp) return firstIp;
    }

    return 'unknown-client';
}

function getRateLimitHeaders(remaining: number, resetAt: number): Record<string, string> {
    return {
        'X-RateLimit-Limit': String(RATE_LIMIT_MAX_REQUESTS),
        'X-RateLimit-Remaining': String(Math.max(remaining, 0)),
        'X-RateLimit-Reset': String(Math.floor(resetAt / 1000)),
    };
}

function checkRateLimit(clientKey: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const state = requestWindow.get(clientKey);

    if (!state || state.resetAt <= now) {
        const resetAt = now + RATE_LIMIT_WINDOW_MS;
        requestWindow.set(clientKey, { count: 1, resetAt });
        return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetAt };
    }

    if (state.count >= RATE_LIMIT_MAX_REQUESTS) {
        return { allowed: false, remaining: 0, resetAt: state.resetAt };
    }

    state.count += 1;
    requestWindow.set(clientKey, state);

    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - state.count, resetAt: state.resetAt };
}

const TextContentPartSchema = z.object({
    type: z.literal('text'),
    text: z.string(),
});

const ImageContentPartSchema = z.object({
    type: z.enum(['image', 'image_url']),
    url: z.string().url().optional(),
    image_url: z.union([z.string().url(), z.object({ url: z.string().url() })]).optional(),
});

const ContentPartSchema = z.union([TextContentPartSchema, ImageContentPartSchema]);

const MessageSchema = z.object({
    role: z.string(),
    content: z.union([z.string(), z.array(ContentPartSchema).min(1)]),
});

const RequestSchema = z.object({
    messages: z.array(MessageSchema).min(1),
    model: z.string().nullable().optional(),
    temperature: z.number().min(0).max(2).optional().default(0.7),
    maxTokens: z.number().min(100).max(4096).optional().default(1024),
    systemPrompt: z.string().optional(),
});

type ChatMessage = z.infer<typeof MessageSchema>;
type MessageContent = ChatMessage['content'];

function normalizeMultimodalContent(content: MessageContent) {
    if (typeof content === 'string') return content;

    const normalized = content
        .map((part) => {
            if (part.type === 'text') {
                return { type: 'text', text: part.text };
            }

            const imageUrl = typeof part.image_url === 'string'
                ? part.image_url
                : part.image_url?.url ?? part.url;

            if (!imageUrl) return null;
            return { type: 'image_url', image_url: { url: imageUrl } };
        })
        .filter((part): part is { type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } } => part !== null);

    return normalized.length > 0 ? normalized : content;
}

function extractText(value: unknown): string {
    if (typeof value === 'string') return value;

    if (Array.isArray(value)) {
        return value
            .map((part) => {
                if (typeof part === 'string') return part;
                if (!part || typeof part !== 'object') return '';
                const text = (part as { text?: unknown }).text;
                return typeof text === 'string' ? text : '';
            })
            .join('');
    }

    if (value && typeof value === 'object') {
        const text = (value as { text?: unknown }).text;
        if (typeof text === 'string') return text;
    }

    return '';
}

function extractLatestUserText(content: MessageContent): string {
    if (typeof content === 'string') return content;
    return content
        .filter((part) => part.type === 'text')
        .map((part) => part.text)
        .join(' ');
}

function extractChunkToken(json: any): string {
    const choice = json?.choices?.[0];
    const delta = choice?.delta || {};

    return (
        extractText(delta?.content) ||
        extractText(choice?.message?.content) ||
        extractText(choice?.text)
    );
}

export async function POST(req: Request) {
    const clientKey = getClientKey(req);
    const rateLimit = checkRateLimit(clientKey);
    const rateHeaders = getRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt);

    if (!rateLimit.allowed) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again in a minute.' }), {
            status: 429,
            headers: {
                'Content-Type': 'application/json',
                'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
                ...rateHeaders,
            },
        });
    }

    const apiKey = process.env.HF_TOKEN;
    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'HF_TOKEN not configured.' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...rateHeaders },
        });
    }

    try {
        const body = await req.json();
        const { messages, model, temperature, maxTokens, systemPrompt } = RequestSchema.parse(body);

        const lastContent = messages[messages.length - 1]?.content;
        const lastMessage = lastContent ? extractLatestUserText(lastContent) : '';
        const selectedModel = routeModel(lastMessage, model || null);
        if (!ALLOWED_MODELS.has(selectedModel)) {
            return new Response(JSON.stringify({ error: 'Invalid model selection.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...rateHeaders },
            });
        }

        const currentDate = new Date().toISOString().slice(0, 10);
        const temporalContext = `Current date: ${currentDate}. Use this date as today's date when answering time-related questions.`;
        const systemMessage = {
            role: 'system',
            content: `${systemPrompt || DEFAULT_SYSTEM_PROMPT}\n\n${temporalContext}`,
        };
        const normalizedMessages = messages.map((message) => ({
            role: message.role,
            content: normalizeMultimodalContent(message.content),
        }));
        const allMessages = [systemMessage, ...normalizedMessages];

        const hfResponse = await fetch(HF_ROUTER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: selectedModel,
                messages: allMessages,
                stream: true,
                temperature,
                max_tokens: maxTokens,
            }),
        });

        if (!hfResponse.ok) {
            const errText = await hfResponse.text();
            let errMsg = `API Error ${hfResponse.status}`;
            try { errMsg = JSON.parse(errText)?.error?.message || errMsg; } catch { }
            return new Response(JSON.stringify({ error: errMsg }), {
                status: hfResponse.status, headers: { 'Content-Type': 'application/json', ...rateHeaders },
            });
        }

        // Proxy the SSE stream and convert to AI SDK data stream format
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const reader = hfResponse.body?.getReader();
                const decoder = new TextDecoder();
                let buffer = '';

                const enqueue = (token: string) => {
                    // AI SDK data stream format: `0:"token"\n`
                    controller.enqueue(encoder.encode(`0:${JSON.stringify(token)}\n`));
                };

                while (reader) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (!line.startsWith('data: ')) continue;
                        const data = line.slice(6).trim();
                        if (data === '[DONE]') continue;
                        try {
                            const json = JSON.parse(data);
                            const token = extractChunkToken(json);
                            if (token) enqueue(token);
                        } catch { }
                    }
                }
                controller.close();
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'X-Model-Used': selectedModel,
                ...rateHeaders,
            },
        });
    } catch (err: any) {
        const msg = err?.errors?.[0]?.message || err?.message || 'Internal server error';
        return new Response(JSON.stringify({ error: msg }), {
            status: err?.name === 'ZodError' ? 400 : 500,
            headers: { 'Content-Type': 'application/json', ...rateHeaders },
        });
    }
}
