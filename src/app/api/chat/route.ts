import { z } from 'zod';
import { routeModel, DEFAULT_SYSTEM_PROMPT } from '@/lib/ai/models';

export const runtime = 'edge';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const RequestSchema = z.object({
    messages: z.array(z.object({ role: z.string(), content: z.string() })).min(1),
    model: z.string().nullable().optional(),
    temperature: z.number().min(0).max(2).optional().default(0.7),
    maxTokens: z.number().min(100).max(4096).optional().default(2048),
    systemPrompt: z.string().optional(),
    isAgentMode: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'OPENROUTER_API_KEY not configured.' }), {
            status: 500, headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const body = await req.json();
        const { messages, model, temperature, maxTokens, systemPrompt, isAgentMode } = RequestSchema.parse(body);

        const lastMessage = messages[messages.length - 1]?.content || '';
        const selectedModel = routeModel(lastMessage, model || null);

        const systemMessage = { role: 'system', content: systemPrompt || DEFAULT_SYSTEM_PROMPT };
        const allMessages = [systemMessage, ...messages];

        const orResponse = await fetch(OPENROUTER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://jeff-tune-1-pro.vercel.app',
                'X-Title': 'Jeff Tune Pro',
            },
            body: JSON.stringify({
                model: selectedModel,
                messages: allMessages,
                stream: true,
                temperature,
                max_tokens: maxTokens,
            }),
        });

        if (!orResponse.ok) {
            const errText = await orResponse.text();
            let errMsg = `API Error ${orResponse.status}`;
            try { errMsg = JSON.parse(errText)?.error?.message || errMsg; } catch { }
            return new Response(JSON.stringify({ error: errMsg }), {
                status: orResponse.status, headers: { 'Content-Type': 'application/json' },
            });
        }

        // Proxy the SSE stream and convert to AI SDK data stream format
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const reader = orResponse.body?.getReader();
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
                            const token = json?.choices?.[0]?.delta?.content;
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
            },
        });
    } catch (err: any) {
        const msg = err?.errors?.[0]?.message || err?.message || 'Internal server error';
        return new Response(JSON.stringify({ error: msg }), {
            status: err?.name === 'ZodError' ? 400 : 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
