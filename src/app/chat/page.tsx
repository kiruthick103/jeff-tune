'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { AVAILABLE_MODELS } from '@/lib/ai/models';
import { Send, Loader2, Bot, User, Copy, Check, RotateCcw, Zap, Code, Sun, Moon, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

type Msg = { id: string; role: 'user' | 'assistant'; content: string };
const AUTO_MODEL_VALUE = 'auto';

function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="h-8 w-8">
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
    );
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    return (
        <Button
            variant="ghost"
            size="icon"
            className="mt-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={() => {
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }}
        >
            {copied ? <Check size={12} /> : <Copy size={12} />}
        </Button>
    );
}

function MessageBubble({ msg }: { msg: Msg }) {
    const isUser = msg.role === 'user';

    return (
        <div className={cn('group flex gap-3 px-2 py-2', isUser ? 'flex-row-reverse' : 'flex-row')}>
            <div
                className={cn(
                    'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border text-sm',
                    isUser ? 'bg-foreground text-background border-foreground' : 'bg-background text-foreground border-border',
                )}
            >
                {isUser ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className={cn('flex max-w-[75%] flex-col', isUser ? 'items-end' : 'items-start')}>
                <div
                    className={cn(
                        'whitespace-pre-wrap break-words rounded-2xl border px-4 py-3 text-sm leading-relaxed',
                        isUser
                            ? 'bg-foreground text-background border-foreground rounded-tr-sm'
                            : 'bg-background text-foreground border-border rounded-tl-sm',
                    )}
                >
                    {msg.content || (
                        <span className="inline-flex gap-1">
                            {[0, 150, 300].map((delay) => (
                                <span key={delay} style={{ animationDelay: `${delay}ms` }} className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
                            ))}
                        </span>
                    )}
                </div>
                {!isUser && <CopyButton text={msg.content} />}
            </div>
        </div>
    );
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Msg[]>([]);
    const [input, setInput] = useState('');
    const [selectedModel, setSelectedModel] = useState(AUTO_MODEL_VALUE);
    const [temperature, setTemperature] = useState(0.7);
    const [isAgentMode, setIsAgentMode] = useState(false);
    const [isDevMode, setIsDevMode] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [systemPrompt, setSystemPrompt] = useState('You are Jeff Tune Pro, an advanced AI assistant.');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;

        setError(null);
        const userMsg: Msg = { id: Date.now().toString(), role: 'user', content: text };
        const updated = [...messages, userMsg];
        setMessages(updated);
        setInput('');
        setIsLoading(true);

        const assistantId = (Date.now() + 1).toString();
        setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

        abortRef.current = new AbortController();

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: abortRef.current.signal,
                body: JSON.stringify({
                    messages: updated.map((msg) => ({ role: msg.role, content: msg.content })),
                    model: selectedModel === AUTO_MODEL_VALUE ? null : selectedModel,
                    temperature,
                    isAgentMode,
                    systemPrompt,
                    maxTokens: 1024,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({ error: res.statusText }));
                throw new Error(data.error || 'Request failed');
            }

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (reader) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.startsWith('0:')) continue;

                    try {
                        const token = JSON.parse(line.slice(2));
                        setMessages((prev) =>
                            prev.map((msg) => (msg.id === assistantId ? { ...msg, content: msg.content + token } : msg)),
                        );
                    } catch {
                        // ignore malformed stream chunks
                    }
                }
            }
        } catch (e: unknown) {
            if (!(e instanceof DOMException && e.name === 'AbortError')) {
                const message = e instanceof Error ? e.message : 'Something went wrong';
                setError(message);
                setMessages((prev) => prev.filter((msg) => msg.id !== assistantId));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    const lastUserMessage = [...messages].reverse().find((msg) => msg.role === 'user')?.content || '';

    return (
        <TooltipProvider>
            <div className="flex h-screen flex-col bg-background">
                <div className="flex flex-shrink-0 items-center justify-between border-b border-border px-4 py-3">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background">
                            <Bot size={16} />
                        </div>
                        <span className="text-sm font-semibold">Jeff Tune Pro</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                        <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1">
                            <Zap size={12} />
                            <span className="text-xs text-muted-foreground">Agent</span>
                            <Select value={selectedModel} onValueChange={setSelectedModel}>
                                <SelectTrigger className="h-7 w-56 border-0 bg-transparent px-0 text-xs shadow-none focus:ring-0">
                                    <SelectValue placeholder="Auto" />
                                </SelectTrigger>
                                <SelectContent align="end">
                                    <SelectItem value={AUTO_MODEL_VALUE} className="text-xs">
                                        Auto
                                    </SelectItem>
                                    {AVAILABLE_MODELS.map((model) => (
                                        <SelectItem key={model.id} value={model.id} className="text-xs" disabled={model.isEnabled === false}>
                                            {model.label}
                                            {model.isEnabled === false ? ' (Local only)' : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={isAgentMode ? 'default' : 'ghost'}
                                    size="sm"
                                    className={cn('h-8 gap-1.5 rounded-full text-xs', isAgentMode && 'bg-foreground text-background hover:bg-foreground/90')}
                                    onClick={() => setIsAgentMode((prev) => !prev)}
                                >
                                    <Zap size={12} /> Agent Mode
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Enable AI Agent Mode</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={isDevMode ? 'default' : 'ghost'}
                                    size="sm"
                                    className={cn('h-8 gap-1.5 rounded-full text-xs', isDevMode && 'bg-foreground text-background hover:bg-foreground/90')}
                                    onClick={() => setIsDevMode((prev) => !prev)}
                                >
                                    <Code size={12} /> Dev
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Developer mode</TooltipContent>
                        </Tooltip>

                        <Button variant="ghost" size="sm" className="h-8 rounded-full text-xs" onClick={() => setShowSettings((prev) => !prev)}>
                            Settings {showSettings ? <ChevronUp size={12} className="ml-1" /> : <ChevronDown size={12} className="ml-1" />}
                        </Button>
                        <ThemeToggle />
                        {messages.length > 0 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                    setMessages([]);
                                    abortRef.current?.abort();
                                }}
                            >
                                <RotateCcw size={14} />
                            </Button>
                        )}
                    </div>
                </div>

                {showSettings && (
                    <div className="flex flex-shrink-0 flex-wrap items-center gap-4 border-b border-border bg-background px-4 py-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Temp: {temperature}</span>
                            <Slider min={0} max={2} step={0.1} value={[temperature]} onValueChange={([value]) => setTemperature(value)} className="w-28" />
                        </div>
                        <div className="flex min-w-48 flex-1 items-center gap-2">
                            <span className="whitespace-nowrap text-xs text-muted-foreground">System</span>
                            <input
                                type="text"
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                                className="flex-1 rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none focus:border-foreground"
                            />
                        </div>
                    </div>
                )}

                <div className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
                    {messages.length === 0 && (
                        <div className="flex h-full select-none flex-col items-center justify-center gap-4 py-12 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-background">
                                <Bot size={32} />
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-foreground">How can I help you?</p>
                                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                    Ask anything - code, write, reason, or use Agent Mode for complex tasks.
                                </p>
                            </div>
                            <div className="mt-2 flex flex-wrap justify-center gap-2">
                                {['Explain async/await in JS', 'Write a short poem', 'Plan my week'].map((sample) => (
                                    <button
                                        key={sample}
                                        onClick={() => setInput(sample)}
                                        className="rounded-full border border-border px-3 py-1.5 text-xs transition-colors hover:bg-muted"
                                    >
                                        {sample}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <MessageBubble key={msg.id} msg={msg} />
                    ))}

                    {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                        <div className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-border bg-background">
                                <Bot size={14} />
                            </div>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Thinking{isAgentMode ? ' (agent)' : ''}...</span>
                        </div>
                    )}

                    {error && (
                        <div className="mx-4 flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground">
                            <AlertTriangle size={14} />
                            <span className="flex-1">{error}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                disabled={!lastUserMessage || isLoading}
                                onClick={() => sendMessage(lastUserMessage)}
                            >
                                Retry
                            </Button>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                <div className="flex-shrink-0 border-t border-border px-4 py-3">
                    <form onSubmit={onSubmit} className="flex items-end gap-2">
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder={isAgentMode ? 'Ask the agent to do something complex...' : 'Ask anything...'}
                            rows={1}
                            className="max-h-40 min-h-[44px] flex-1 resize-none rounded-2xl pr-4 text-sm"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={isLoading || !input.trim()}
                            className="h-11 w-11 flex-shrink-0 rounded-full bg-foreground text-background hover:bg-foreground/90"
                        >
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        </Button>
                    </form>
                    <p className="mt-2 text-center text-[10px] text-muted-foreground">
                        {isAgentMode && <span className="mr-1 text-foreground">Agent.</span>}
                        Jeff Tune Pro may make mistakes. Verify important info.
                    </p>
                </div>
            </div>
        </TooltipProvider>
    );
}
