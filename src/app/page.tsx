import Link from 'next/link';
import { Bot, Cpu, Rocket, ShieldCheck, Sparkles, TerminalSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
    return (
        <main className="relative min-h-screen overflow-hidden px-6 py-10">
            <div className="pointer-events-none absolute inset-0 neo-bg-grid opacity-40" />
            <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute right-0 top-24 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />

            <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8">
                <header className="glass-panel flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="pulse-neon flex h-9 w-9 items-center justify-center rounded-xl border border-primary/50 bg-primary/20 text-primary">
                            <TerminalSquare size={18} />
                        </div>
                        <span className="font-mono text-sm tracking-wide text-foreground/90">JEFF_TUNE_PRO</span>
                    </div>
                    <Link href="/chat">
                        <Button className="h-9 rounded-lg border border-primary/40 bg-primary/90 px-4 text-xs font-semibold text-primary-foreground hover:bg-primary">
                            Open Console
                        </Button>
                    </Link>
                </header>

                <section className="glass-panel-strong grid gap-8 px-6 py-10 md:grid-cols-[1.2fr_0.8fr] md:px-10 md:py-12">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-xs text-primary">
                            <Sparkles size={13} />
                            Futuristic AI Workspace
                        </div>
                        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground md:text-6xl">
                            Build faster with an AI chat UI designed for developers.
                        </h1>
                        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                            Neon accents, glass panels, streaming responses, and model routing controls in one production-grade interface.
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                            <Link href="/chat">
                                <Button className="h-11 rounded-xl border border-primary/45 bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                                    Start Chat
                                </Button>
                            </Link>
                            <Link href="https://github.com/kiruthick103/jeff-tune" target="_blank">
                                <Button variant="outline" className="h-11 rounded-xl border-primary/40 bg-card/45 px-6 text-sm text-foreground hover:bg-secondary/60">
                                    View Source
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="glass-panel float-slow neon-border p-5">
                        <p className="mb-3 font-mono text-xs uppercase tracking-wider text-primary/80">Live Status</p>
                        <div className="space-y-3 text-sm text-muted-foreground">
                            <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-background/30 px-3 py-2">
                                <span>Routing Engine</span>
                                <span className="font-mono text-primary">Online</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-background/30 px-3 py-2">
                                <span>Streaming</span>
                                <span className="font-mono text-accent">Enabled</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-background/30 px-3 py-2">
                                <span>Latency Target</span>
                                <span className="font-mono text-foreground/90">&lt; 600ms</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                    {[
                        {
                            icon: <Bot size={18} className="text-primary" />,
                            title: 'Multi-model routing',
                            desc: 'Switch providers and models instantly with a clear control layer.',
                        },
                        {
                            icon: <Cpu size={18} className="text-accent" />,
                            title: 'Developer console UX',
                            desc: 'Optimized prompts, settings, and iteration loops for fast technical work.',
                        },
                        {
                            icon: <ShieldCheck size={18} className="text-primary" />,
                            title: 'Production-ready',
                            desc: 'Edge API streaming, fallback logic, and deploy-ready architecture.',
                        },
                    ].map((item) => (
                        <article key={item.title} className="glass-panel p-5 transition duration-300 hover:-translate-y-0.5 hover:border-primary/45">
                            <div className="mb-4 inline-flex rounded-xl border border-primary/35 bg-primary/15 p-2">
                                {item.icon}
                            </div>
                            <h2 className="text-lg font-semibold text-foreground">{item.title}</h2>
                            <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                        </article>
                    ))}
                </section>

                <section className="glass-panel flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Rocket size={15} className="text-primary" />
                        <span>Neon developer theme enabled on Home + Chat</span>
                    </div>
                    <span className="font-mono text-xs uppercase tracking-wider text-primary/80">vNEXT Interface</span>
                </section>
            </div>
        </main>
    );
}
