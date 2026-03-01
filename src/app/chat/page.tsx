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

// Manual streaming fetch so we avoid any SDK version issues
type Msg = { id: string; role: 'user' | 'assistant'; content: string };

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
        <Button variant="ghost" size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity mt-1"
            onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
        </Button>
    );
}

function MessageBubble({ msg }: { msg: Msg }) {
    const isUser = msg.role === 'user';
    return (
        <div className={cn('group flex gap-3 px-2 py-2', isUser ? 'flex-row-reverse' : 'flex-row')}>
            <div className={cn('flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-sm',
                isUser ? 'bg-blue-600' : 'bg-gradient-to-br from-purple-600 to-blue-600')}><span className="text-white">{isUser ? <User size={14} /> : <Bot size={14} />}</span></div>
            <div className={cn('max-w-[75%] flex flex-col', isUser ? 'items-end' : 'items-start')}>
                <div className={cn('rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words',
                    isUser ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white/5 border border-white/10 text-foreground rounded-tl-sm')}>
                    {msg.content || <span className="inline-flex gap-1">
                        {[0, 150, 300].map(d => <span key={d} style={{ animationDelay: `${d}ms` }} className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" />)}
                    </span>}
                </div>
                {!isUser && <CopyButton text={msg.content} />}
            </div>
        </div>
    );
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Msg[]>([]);
    const [input, setInput] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [temperature, setTemperature] = useState(0.7);
    const [isAgentMode, setIsAgentMode] = useState(false);
    const [isDevMode, setIsDevMode] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [systemPrompt, setSystemPrompt] = useState('You are Jeff Tune Pro, an advanced AI assistant.');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;
        setError(null);
        const userMsg: Msg = { id: Date.now().toString(), role: 'user', content: text };
        const updated = [...messages, userMsg];
        setMessages(updated);
        setInput('');
        setIsLoading(true);

        const assistantId = (Date.now() + 1).toString();
        setMessages(m => [...m, { id: assistantId, role: 'assistant', content: '' }]);

        abortRef.current = new AbortController();
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: abortRef.current.signal,
                body: JSON.stringify({
                    messages: updated.map(m => ({ role: m.role, content: m.content })),
                    model: selectedModel || null,
                    temperature, isAgentMode, systemPrompt, maxTokens: 2048,
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
                    if (line.startsWith('0:')) {
                        try {
                            const token = JSON.parse(line.slice(2));
                            setMessages(m => m.map(msg => msg.id === assistantId ? { ...msg, content: msg.content + token } : msg));
                        } catch { }
                    }
                }
            }
        } catch (e: any) {
            if (e.name !== 'AbortError') {
                setError(e.message || 'Something went wrong');
                setMessages(m => m.filter(msg => msg.id !== assistantId));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = (e: React.FormEvent) => { e.preventDefault(); sendMessage(input); };
    const onKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } };

    return (
        <TooltipProvider>
            <div className="flex flex-col h-screen bg-background">

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                            <Bot size={16} className="text-white" />
                        </div>
                        <span className="font-semibold text-sm">Jeff Tune Pro</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant={isAgentMode ? 'default' : 'ghost'} size="sm"
                                    className={cn('h-8 gap-1.5 text-xs rounded-full', isAgentMode && 'bg-purple-600 hover:bg-purple-700')}
                                    onClick={() => setIsAgentMode(!isAgentMode)}>
                                    <Zap size={12} /> Agent
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Enable AI Agent Mode</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant={isDevMode ? 'default' : 'ghost'} size="sm"
                                    className={cn('h-8 gap-1.5 text-xs rounded-full', isDevMode && 'bg-green-700 hover:bg-green-800')}
                                    onClick={() => setIsDevMode(!isDevMode)}>
                                    <Code size={12} /> Dev
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Developer mode</TooltipContent>
                        </Tooltip>
                        <Button variant="ghost" size="sm" className="h-8 text-xs rounded-full" onClick={() => setShowSettings(!showSettings)}>
                            Settings {showSettings ? <ChevronUp size={12} className="ml-1" /> : <ChevronDown size={12} className="ml-1" />}
                        </Button>
                        <ThemeToggle />
                        {messages.length > 0 && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setMessages([]); abortRef.current?.abort(); }}>
                                <RotateCcw size={14} />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Settings */}
                {showSettings && (
                    <div className="px-4 py-3 border-b border-border bg-muted/30 flex flex-wrap gap-4 items-center flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Model</span>
                            <Select value={selectedModel} onValueChange={setSelectedModel}>
                                <SelectTrigger className="h-8 text-xs w-52 rounded-full">
                                    <SelectValue placeholder="Auto (smart routing)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="" className="text-xs">Auto (smart routing)</SelectItem>
                                    {AVAILABLE_MODELS.map(m => <SelectItem key={m.id} value={m.id} className="text-xs">{m.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Temp: {temperature}</span>
                            <Slider min={0} max={2} step={0.1} value={[temperature]} onValueChange={([v]) => setTemperature(v)} className="w-28" />
                        </div>
                        <div className="flex items-center gap-2 flex-1 min-w-48">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">System</span>
                            <input type="text" value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)}
                                className="flex-1 text-xs bg-background border border-border rounded-lg px-2 py-1 outline-none focus:border-ring" />
                        </div>
                    </div>
                )}

                {/* Chat */}
                <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-center select-none py-12">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
                                <Bot size={32} className="text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-foreground text-lg">How can I help you?</p>
                                <p className="text-sm mt-1 text-muted-foreground max-w-sm">Ask anything — code, write, reason, or use Agent Mode for complex tasks.</p>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2 justify-center">
                                {['Explain async/await in JS', 'Write a short poem', 'Plan my week'].map(s => (
                                    <button key={s} onClick={() => setInput(s)} className="text-xs border border-border rounded-full px-3 py-1.5 hover:bg-muted transition-colors">
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {messages.map(m => <MessageBubble key={m.id} msg={m} />)}
                    {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                        <div className="flex items-center gap-3 px-4 py-2 text-muted-foreground text-sm">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                                <Bot size={14} className="text-white" />
                            </div>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Thinking{isAgentMode ? ' (agent)' : ''}…</span>
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center gap-2 mx-4 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                            <AlertTriangle size={14} />
                            <span className="flex-1">{error}</span>
                            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => sendMessage(messages[messages.length - 2]?.content || '')}>Retry</Button>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="px-4 py-3 border-t border-border flex-shrink-0">
                    <form onSubmit={onSubmit} className="flex items-end gap-2">
                        <Textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKeyDown}
                            placeholder={isAgentMode ? "Ask the agent to do something complex..." : "Ask anything..."}
                            rows={1} className="flex-1 resize-none min-h-[44px] max-h-40 rounded-2xl text-sm pr-4" />
                        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}
                            className="h-11 w-11 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 hover:opacity-90 flex-shrink-0 shadow-lg">
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        </Button>
                    </form>
                    <p className="text-center text-[10px] text-muted-foreground mt-2">
                        {isAgentMode && <span className="text-purple-400 mr-1">⚡ Agent ·</span>}
                        Jeff Tune Pro may make mistakes. Verify important info.
                    </p>
                </div>
            </div>
        </div>
        </TooltipProvider >
        );
}

