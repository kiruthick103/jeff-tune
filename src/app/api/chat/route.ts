import { z } from 'zod';
import { routeModel, DEFAULT_SYSTEM_PROMPT, ENABLED_MODEL_IDS, ROUTER_FALLBACK_MODEL, AVAILABLE_MODELS } from '@/lib/ai/models';

export const runtime = 'edge';

const SERP_API_URL = 'https://serpapi.com/search.json';
const ALLOWED_MODELS = new Set(ENABLED_MODEL_IDS);
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const SERP_TIMEOUT_MS = 8_000;
const MAX_ORGANIC_RESULTS = 4;
const MAX_NEWS_RESULTS = 3;
const SEARCH_CONTEXT_MAX_CHARS = 2_500;
const SEARCH_TRIGGER_REGEX = /\b(latest|current|today|news|recent|price|weather|stock|release|version|update|live)\b/i;

type RateLimitState = {
    count: number;
    resetAt: number;
};

type SerpEntry = {
    title?: string;
    link?: string;
    snippet?: string;
    source?: string;
    date?: string;
};

type SerpApiResponse = {
    answer_box?: {
        title?: string;
        answer?: string;
        snippet?: string;
    };
    knowledge_graph?: {
        title?: string;
        type?: string;
        description?: string;
    };
    organic_results?: SerpEntry[];
    news_results?: SerpEntry[];
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
    maxTokens: z.number().min(100).max(8192).optional().default(4096),
    systemPrompt: z.string().optional(),
    isAgentMode: z.boolean().optional().default(false),
    webSearch: z.boolean().optional(),
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

function isUnsupportedProviderError(status: number, message: string): boolean {
    if (status !== 400) return false;
    return message.toLowerCase().includes('not supported by any provider you have enabled');
}

function isCreditDepletionError(status: number, message: string): boolean {
    if (status !== 402 && status !== 429) return false;
    return message.toLowerCase().includes('depleted') || 
           message.toLowerCase().includes('credits') || 
           message.toLowerCase().includes('quota') ||
           message.toLowerCase().includes('rate limit') ||
           message.toLowerCase().includes('usage limit');
}

function parseUpstreamError(status: number, rawText: string): string {
    const fallback = `API Error ${status}`;
    try {
        const parsed = JSON.parse(rawText);
        const errorValue = (parsed as { error?: unknown }).error;
        if (typeof errorValue === 'string' && errorValue.trim()) return errorValue;
        if (errorValue && typeof errorValue === 'object') {
            const nestedMessage = (errorValue as { message?: unknown }).message;
            if (typeof nestedMessage === 'string' && nestedMessage.trim()) return nestedMessage;
        }
        const message = (parsed as { message?: unknown }).message;
        if (typeof message === 'string' && message.trim()) return message;
    } catch {
        // Ignore JSON parse failures and fall back to generic status message.
    }
    return fallback;
}

function compactText(value?: string): string {
    return value?.replace(/\s+/g, ' ').trim() ?? '';
}

function shouldUseWebSearch(lastMessage: string, isAgentMode: boolean, webSearch?: boolean): boolean {
    if (typeof webSearch === 'boolean') return webSearch;
    if (isAgentMode) return true;
    return SEARCH_TRIGGER_REGEX.test(lastMessage);
}

function formatSerpEntry(entry: SerpEntry, index: number): string | null {
    const title = compactText(entry.title);
    const snippet = compactText(entry.snippet);
    const link = compactText(entry.link);
    const source = compactText(entry.source);
    const date = compactText(entry.date);

    if (!title && !snippet && !link) return null;

    const bits = [
        title && `${index}. ${title}`,
        snippet && `Summary: ${snippet}`,
        (source || date) && `Source: ${[source, date].filter(Boolean).join(' - ')}`,
        link && `URL: ${link}`,
    ].filter(Boolean);

    return bits.join('\n');
}

function buildSearchContext(query: string, searchData: SerpApiResponse): { context: string; resultCount: number } | null {
    const sections: string[] = [
        'Web search context (SerpAPI/Google):',
        `Query: ${compactText(query)}`,
        'Use this only when relevant. Prefer recent info and include source URLs when making factual claims.',
    ];
    let resultCount = 0;

    const answerBox = searchData.answer_box;
    if (answerBox) {
        const answer = compactText(answerBox.answer || answerBox.snippet);
        const title = compactText(answerBox.title);
        if (answer) {
            sections.push(`Answer box: ${title ? `${title} - ` : ''}${answer}`);
            resultCount += 1;
        }
    }

    const knowledge = searchData.knowledge_graph;
    if (knowledge) {
        const title = compactText(knowledge.title);
        const kind = compactText(knowledge.type);
        const description = compactText(knowledge.description);
        if (title || description) {
            sections.push(`Knowledge graph: ${[title, kind].filter(Boolean).join(' / ')}${description ? ` - ${description}` : ''}`);
            resultCount += 1;
        }
    }

    const organic = searchData.organic_results?.slice(0, MAX_ORGANIC_RESULTS) ?? [];
    const organicLines = organic
        .map((entry, idx) => formatSerpEntry(entry, idx + 1))
        .filter((value): value is string => value !== null);
    if (organicLines.length > 0) {
        sections.push('Top results:');
        sections.push(organicLines.join('\n\n'));
        resultCount += organicLines.length;
    }

    const news = searchData.news_results?.slice(0, MAX_NEWS_RESULTS) ?? [];
    const newsLines = news
        .map((entry, idx) => formatSerpEntry(entry, idx + 1))
        .filter((value): value is string => value !== null);
    if (newsLines.length > 0) {
        sections.push('News results:');
        sections.push(newsLines.join('\n\n'));
        resultCount += newsLines.length;
    }

    if (resultCount === 0) return null;

    return {
        context: sections.join('\n').slice(0, SEARCH_CONTEXT_MAX_CHARS),
        resultCount,
    };
}

async function fetchSerpResults(query: string, apiKey: string): Promise<SerpApiResponse | null> {
    const cleanQuery = compactText(query);
    if (!cleanQuery) return null;

    const params = new URLSearchParams({
        q: cleanQuery,
        api_key: apiKey,
        hl: 'en',
        gl: 'us',
        google_domain: 'google.com',
        num: String(MAX_ORGANIC_RESULTS),
    });

    const location = compactText(process.env.SERPAPI_LOCATION);
    if (location) params.set('location', location);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SERP_TIMEOUT_MS);

    try {
        const response = await fetch(`${SERP_API_URL}?${params.toString()}`, {
            method: 'GET',
            signal: controller.signal,
            cache: 'no-store',
        });
        if (!response.ok) return null;
        return await response.json() as SerpApiResponse;
    } catch {
        return null;
    } finally {
        clearTimeout(timeout);
    }
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

    try {
        const body = await req.json();
        const { messages, model, temperature, maxTokens, systemPrompt, isAgentMode, webSearch } = RequestSchema.parse(body);

        const lastContent = messages[messages.length - 1]?.content;
        const lastMessage = lastContent ? extractLatestUserText(lastContent) : '';
        const selectedModel = routeModel(lastMessage, model || null);
        if (!ALLOWED_MODELS.has(selectedModel)) {
            return new Response(JSON.stringify({ error: 'Invalid model selection.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...rateHeaders },
            });
        }

        let webSearchStatus = 'off';
        let webSearchResults = 0;
        let webSearchContext = '';
        if (shouldUseWebSearch(lastMessage, isAgentMode, webSearch)) {
            const serpApiKey = process.env.SERPAPI_API_KEY;
            if (!serpApiKey) {
                webSearchStatus = 'missing-key';
            } else {
                const searchData = await fetchSerpResults(lastMessage, serpApiKey);
                if (!searchData) {
                    webSearchStatus = 'failed';
                } else {
                    const contextData = buildSearchContext(lastMessage, searchData);
                    if (!contextData) {
                        webSearchStatus = 'empty';
                    } else {
                        webSearchStatus = 'used';
                        webSearchResults = contextData.resultCount;
                        webSearchContext = contextData.context;
                    }
                }
            }
        }

        const currentDate = new Date().toISOString().slice(0, 10);
        const temporalContext = `Current date: ${currentDate}. Use this date as today's date when answering time-related questions.`;
        const systemMessage = {
            role: 'system',
            content: `${systemPrompt || DEFAULT_SYSTEM_PROMPT}\n\n${temporalContext}${webSearchContext ? `\n\n${webSearchContext}` : ''}`,
        };
        const normalizedMessages = messages.map((message) => ({
            role: message.role,
            content: normalizeMultimodalContent(message.content),
        }));
        const allMessages = [systemMessage, ...normalizedMessages];

        const requestModel = async (modelId: string) => {
            // Find the model to determine the provider
            const model = AVAILABLE_MODELS.find((m: any) => m.id === modelId);
            const provider = model?.provider || 'openrouter';
            
            if (provider === 'huggingface') {
                // Use Hugging Face Router API
                const hfApiKey = process.env.HUGGINGFACE_TOKEN;
                console.log('HF API Key exists:', !!hfApiKey);
                console.log('HF API Key length:', hfApiKey?.length);
                if (!hfApiKey) {
                    return new Response(JSON.stringify({ error: 'Hugging Face API key not configured.' }), {
                        status: 500, headers: { 'Content-Type': 'application/json' }
                    });
                }
                
                return fetch('https://router.huggingface.co/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${hfApiKey}`,
                    },
                    body: JSON.stringify({
                        model: modelId,
                        messages: allMessages,
                        stream: true,
                        temperature,
                        max_tokens: maxTokens,
                    }),
                });
            } else {
                // Use OpenRouter API (default)
                const openRouterApiKey = process.env.HF_TOKEN;
                console.log('OpenRouter API Key exists:', !!openRouterApiKey);
                console.log('OpenRouter API Key length:', openRouterApiKey?.length);
                if (!openRouterApiKey) {
                    return new Response(JSON.stringify({ error: 'OpenRouter API key not configured.' }), {
                        status: 500, headers: { 'Content-Type': 'application/json' }
                    });
                }
                
                return fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${openRouterApiKey}`,
                        'HTTP-Referer': 'https://jeff-tune-1-pro.vercel.app',
                        'X-OpenRouter-Title': 'Jeff AI Pro',
                    },
                    body: JSON.stringify({
                        model: modelId,
                        messages: allMessages,
                        stream: true,
                        temperature,
                        max_tokens: maxTokens,
                    }),
                });
            }
        };

        let modelUsed = selectedModel;
        let aiResponse = await requestModel(modelUsed);

        if (!aiResponse.ok) {
            const errText = await aiResponse.text();
            const errMsg = parseUpstreamError(aiResponse.status, errText);

            const shouldFallback = (
                modelUsed !== ROUTER_FALLBACK_MODEL
                && ALLOWED_MODELS.has(ROUTER_FALLBACK_MODEL)
                && (isUnsupportedProviderError(aiResponse.status, errMsg) || isCreditDepletionError(aiResponse.status, errMsg))
            );

            if (shouldFallback) {
                modelUsed = ROUTER_FALLBACK_MODEL;
                aiResponse = await requestModel(modelUsed);
            } else {
                return new Response(JSON.stringify({ 
                    error: errMsg,
                    fallbackSuggestion: modelUsed !== ROUTER_FALLBACK_MODEL ? 'Try switching to a different model.' : 'Check your API key and quota.',
                    creditDepleted: isCreditDepletionError(aiResponse.status, errMsg)
                }), {
                    status: aiResponse.status, headers: { 'Content-Type': 'application/json', ...rateHeaders },
                });
            }
        }

        // Proxy the SSE stream and convert to AI SDK data stream format
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const reader = aiResponse.body?.getReader();
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
                'X-Model-Used': modelUsed,
                'X-Web-Search': webSearchStatus,
                'X-Web-Results': String(webSearchResults),
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
