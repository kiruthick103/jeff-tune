'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { AVAILABLE_MODELS, DEFAULT_MODEL } from '@/lib/ai/models';
import { Send, Loader2, Bot, User, Copy, Check, RotateCcw, Zap, Code, Sun, Moon, ChevronDown, ChevronUp, AlertTriangle, Flower2, Paperclip, Image as ImageIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

type Msg = { id: string; role: 'user' | 'assistant'; content: string };
const AUTO_MODEL_VALUE = 'auto';
const DEFAULT_MAX_TOKENS = 4096;

function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="h-8 w-8 text-primary">
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
            className="mt-1 h-6 w-6 text-primary/70 opacity-0 transition-opacity group-hover:opacity-100 hover:text-primary"
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
                    'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border text-sm shadow-sm',
                    isUser ? 'border-primary/40 bg-primary text-primary-foreground' : 'border-primary/30 bg-card/80 text-primary',
                )}
            >
                {isUser ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className={cn('flex max-w-[78%] flex-col', isUser ? 'items-end' : 'items-start')}>
                <div
                    className={cn(
                        'whitespace-pre-wrap break-words rounded-2xl border px-4 py-3 text-sm leading-relaxed shadow-sm',
                        isUser
                            ? 'rounded-tr-sm border-primary/45 bg-primary text-primary-foreground'
                            : 'rounded-tl-sm border-primary/20 bg-card/90 text-foreground',
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
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef<AbortController | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // File upload functions
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        setUploadedFiles(prev => [...prev, ...files]);
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragging(false);
        const files = Array.from(event.dataTransfer.files);
        setUploadedFiles(prev => [...prev, ...files]);
    };

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const uploadFiles = async (files: File[]) => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                return result;
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('File upload error:', error);
            throw error;
        }
    };

    const sendMessage = async (text: string) => {
        if (!text.trim() && uploadedFiles.length === 0) return;

        setError(null);
        
        // Handle file uploads first
        let fileContent = '';
        if (uploadedFiles.length > 0) {
            try {
                const uploadResults = await uploadFiles(uploadedFiles);
                fileContent = `\n\n[Uploaded Files: ${uploadedFiles.map(f => f.name).join(', ')}]\n\n`;
                // Add file analysis details if available
                if (uploadResults.files && uploadResults.files.length > 0) {
                    fileContent += uploadResults.files.map((file: any) => 
                        `\n**${file.name}** (${file.fileType}): ${file.analysis.summary || 'Analysis complete'}`
                    ).join('\n');
                }
                setUploadedFiles([]);
            } catch (error) {
                setError('Failed to upload files');
                return;
            }
        }

        const userMsg: Msg = { 
            id: Date.now().toString(), 
            role: 'user', 
            content: text + fileContent 
        };
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
                    maxTokens: DEFAULT_MAX_TOKENS,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({ error: res.statusText }));
                
                // Handle credit depletion error with automatic model fallback
                if (data.creditDepleted && data.fallbackSuggestion) {
                    // Switch to default model automatically
                    setSelectedModel(DEFAULT_MODEL);
                    setError(`Credits depleted. Automatically switched to ${DEFAULT_MODEL.split('/')[1]} model. ${data.fallbackSuggestion}`);
                    
                    // Retry with default model
                    const retryRes = await fetch('/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        signal: abortRef.current.signal,
                        body: JSON.stringify({
                            messages: updated.map((msg) => ({ role: msg.role, content: msg.content })),
                            model: DEFAULT_MODEL,
                            temperature,
                            isAgentMode,
                            systemPrompt,
                            maxTokens: DEFAULT_MAX_TOKENS,
                        }),
                    });

                    if (retryRes.ok) {
                        const reader = retryRes.body?.getReader();
                        const decoder = new TextDecoder();
                        let buffer = '';

                        while (reader) {
                            const { done, value } = await reader.read();
                            if (done) break;

                            buffer += decoder.decode(value, { stream: true });
                            const lines = buffer.split('\n');
                            buffer = lines.pop() || '';

                            for (const line of lines) {
                                if (line.trim()) {
                                    try {
                                        const parsed = JSON.parse(line);
                                        const token = parsed[0]?.content || parsed[0]?.text || '';
                                        if (token) {
                                            setMessages((prev) => {
                                                const updated = [...prev];
                                                const last = updated[updated.length - 1];
                                                if (last?.role === 'assistant') {
                                                    last.content += token;
                                                }
                                                return updated;
                                            });
                                        }
                                    } catch {
                                        // Ignore JSON parse errors
                                    }
                                }
                            }
                        }
                        return;
                    }
                }
                
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
            <div className="relative flex h-screen flex-col overflow-hidden">
                <div className="pointer-events-none absolute -left-10 top-20 h-44 w-44 rounded-full bg-primary/15 blur-3xl" />
                <div className="pointer-events-none absolute -right-10 bottom-24 h-48 w-48 rounded-full bg-accent/30 blur-3xl" />

                <div className="relative z-10 m-3 flex h-[calc(100vh-1.5rem)] flex-col rounded-3xl border border-primary/25 bg-card/70 shadow-[0_16px_38px_-28px_oklch(0.38_0.08_145_/_0.65)] backdrop-blur-md">
                    <div className="flex flex-shrink-0 items-center justify-between border-b border-primary/20 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/35 bg-primary/10 text-primary">
                                <Flower2 size={16} />
                            </div>
                            <span className="font-serif text-lg font-semibold tracking-tight text-foreground">Jeff Tune Garden</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                            <div className="flex items-center gap-2 rounded-full border border-primary/25 bg-secondary/70 px-3 py-1">
                                <Zap size={12} className="text-primary" />
                                <span className="text-xs text-muted-foreground">Model</span>
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
                                        className={cn(
                                            'h-8 gap-1.5 rounded-full text-xs',
                                            isAgentMode && 'bg-primary text-primary-foreground hover:bg-primary/90',
                                        )}
                                        onClick={() => setIsAgentMode((prev) => !prev)}
                                    >
                                        <Zap size={12} /> Agent
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Enable AI Agent Mode</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={isDevMode ? 'default' : 'ghost'}
                                        size="sm"
                                        className={cn(
                                            'h-8 gap-1.5 rounded-full text-xs',
                                            isDevMode && 'bg-primary text-primary-foreground hover:bg-primary/90',
                                        )}
                                        onClick={() => setIsDevMode((prev) => !prev)}
                                    >
                                        <Code size={12} /> Dev
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Developer mode</TooltipContent>
                            </Tooltip>

                            <Button variant="ghost" size="sm" className="h-8 rounded-full text-xs text-primary" onClick={() => setShowSettings((prev) => !prev)}>
                                Settings {showSettings ? <ChevronUp size={12} className="ml-1" /> : <ChevronDown size={12} className="ml-1" />}
                            </Button>
                            <ThemeToggle />
                            {messages.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-primary"
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
                        <div className="flex flex-shrink-0 flex-wrap items-center gap-4 border-b border-primary/20 bg-secondary/55 px-4 py-3">
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
                                    className="flex-1 rounded-lg border border-primary/30 bg-background/80 px-2 py-1 text-xs outline-none focus:border-primary"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
                        {messages.length === 0 && (
                            <div className="flex h-full select-none flex-col items-center justify-center gap-4 py-12 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                                    <Flower2 size={30} />
                                </div>
                                <div>
                                    <p className="font-serif text-2xl font-semibold text-foreground">Welcome to the garden chat</p>
                                    <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                        Ask anything. The assistant will respond in a calm, clean workspace with your selected model.
                                    </p>
                                </div>
                                <div className="mt-2 flex flex-wrap justify-center gap-2">
                                    {['Plan weekend garden tasks', 'Write a calm welcome note', 'Explain async/await in JS'].map((sample) => (
                                        <button
                                            key={sample}
                                            onClick={() => setInput(sample)}
                                            className="rounded-full border border-primary/25 bg-background/70 px-3 py-1.5 text-xs transition-colors hover:bg-secondary/80"
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
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                                    <Bot size={14} />
                                </div>
                                <Loader2 size={14} className="animate-spin" />
                                <span>Thinking{isAgentMode ? ' (agent)' : ''}...</span>
                            </div>
                        )}

                        {error && (
                            <div className="mx-4 flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-foreground">
                                <AlertTriangle size={14} />
                                <span className="flex-1">{error}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-xs text-primary"
                                    disabled={!lastUserMessage || isLoading}
                                    onClick={() => sendMessage(lastUserMessage)}
                                >
                                    Retry
                                </Button>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <div className="flex-shrink-0 border-t border-primary/20 bg-card/75 px-4 py-3">
                        {/* Uploaded Files Display */}
                        {uploadedFiles.length > 0 && (
                            <div className="mb-3 p-2 bg-background/50 rounded-lg border border-primary/20">
                                <div className="flex flex-wrap gap-2">
                                    {uploadedFiles.map((file, index) => (
                                        <div key={index} className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full text-sm">
                                            <ImageIcon className="h-3 w-3" />
                                            <span className="truncate max-w-32">{file.name}</span>
                                            <button
                                                onClick={() => removeFile(index)}
                                                className="text-primary/70 hover:text-primary"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <form onSubmit={onSubmit} className="flex items-end gap-2">
                            {/* File Upload Buttons */}
                            <div className="flex gap-1">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-11 w-11 flex-shrink-0 rounded-full border border-primary/30 hover:bg-primary/10"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Paperclip size={18} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Upload files</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-11 w-11 flex-shrink-0 rounded-full border border-primary/30 hover:bg-primary/10"
                                                onClick={() => {
                                                    const input = document.createElement('input');
                                                    input.type = 'file';
                                                    input.accept = 'image/*';
                                                    input.multiple = true;
                                                    input.onchange = (e: any) => {
                                                        const files = Array.from(e.target.files || []) as File[];
                                                        setUploadedFiles(prev => [...prev, ...files]);
                                                    };
                                                    input.click();
                                                }}
                                            >
                                                <ImageIcon size={18} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Upload images</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            {/* Textarea with drag-and-drop */}
                            <div className="flex-1 relative">
                                <Textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={onKeyDown}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    placeholder={isAgentMode ? 'Ask the agent to do something complex...' : 'Ask anything...'}
                                    rows={1}
                                    className={`max-h-40 min-h-[44px] flex-1 resize-none rounded-2xl border-primary/30 bg-background/85 pr-4 text-sm transition-colors ${
                                        isDragging ? 'border-primary bg-primary/5' : ''
                                    }`}
                                />
                                {isDragging && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-primary/10 rounded-2xl border-2 border-dashed border-primary pointer-events-none">
                                        <div className="text-center">
                                            <ImageIcon className="h-8 w-8 mx-auto mb-2 text-primary" />
                                            <p className="text-sm text-primary">Drop files here</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Button
                                type="submit"
                                size="icon"
                                disabled={isLoading || (!input.trim() && uploadedFiles.length === 0)}
                                className="h-11 w-11 flex-shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            </Button>
                        </form>

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,.pdf,.doc,.docx,.txt,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        <p className="mt-2 text-center text-[10px] text-muted-foreground">
                            {isAgentMode && <span className="mr-1 text-primary">Agent mode.</span>}
                            {uploadedFiles.length > 0 && <span className="mr-1 text-primary">{uploadedFiles.length} file(s) attached.</span>}
                            Jeff Tune Pro may make mistakes. Verify important info.
                        </p>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
