import Link from 'next/link';
import { Bot, Zap, Shield, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
    return (
        <main className="flex min-h-screen flex-col bg-background text-foreground">
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
                <div className="mb-6 flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-sm text-muted-foreground">
                    <Zap size={14} />
                    Multi-model AI with Agent Mode
                </div>

                <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-7xl">Jeff Tune Pro</h1>

                <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                    A production-grade AI assistant with multi-model routing, Agent Mode, and streaming responses.
                    Built for developers, creators, and power users.
                </p>

                <div className="mt-10 flex items-center gap-4">
                    <Link href="/chat">
                        <Button size="lg" className="h-12 rounded-full bg-foreground px-8 font-semibold text-background hover:bg-foreground/90">
                            Start Chatting -&gt;
                        </Button>
                    </Link>
                    <Link href="https://github.com/kiruthick103/jeff-tune" target="_blank">
                        <Button size="lg" variant="outline" className="h-12 rounded-full border-border px-8">
                            View on GitHub
                        </Button>
                    </Link>
                </div>

                <div className="mt-24 grid w-full max-w-3xl grid-cols-1 gap-6 text-left sm:grid-cols-3">
                    {[
                        { icon: <Bot size={20} />, title: 'Multi-Model AI', desc: 'Switch models directly from the agent chooser.' },
                        { icon: <Cpu size={20} />, title: 'Agent Mode', desc: 'Handle complex tasks with guided multi-step responses.' },
                        { icon: <Shield size={20} />, title: 'Secure and Fast', desc: 'Edge API with model allow-list and rate limiting.' },
                    ].map((feature) => (
                        <div key={feature.title} className="rounded-2xl border border-border bg-background p-6">
                            <div className="mb-3">{feature.icon}</div>
                            <h3 className="mb-1 font-semibold">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
