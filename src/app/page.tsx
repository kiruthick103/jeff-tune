import Link from 'next/link';
import { Bot, Zap, Shield, Cpu, Flower2, Code, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
    return (
        <main className="relative flex min-h-screen flex-col overflow-hidden">
            <div className="pointer-events-none absolute -left-20 top-20 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 bottom-24 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />

            <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
                <div className="garden-panel mb-6 flex items-center gap-2 px-5 py-2 text-sm text-muted-foreground">
                    <Flower2 size={14} className="text-primary" />
                    Country Garden Interface
                </div>

                <h1 className="font-serif text-5xl font-semibold tracking-tight text-foreground sm:text-7xl">
                    Jeff Tune Pro
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                    Calm, natural, and elegant AI chat with comprehensive coding features and multi-modal file analysis. Choose your model, use Agent Mode, upload images and documents, and access advanced development tools in a clean garden-inspired workspace.
                </p>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                    <Link href="/chat">
                        <Button size="lg" className="h-12 rounded-full bg-primary px-8 font-medium text-primary-foreground hover:bg-primary/90">
                            Enter Garden Chat
                        </Button>
                    </Link>
                    <Link href="/coding">
                        <Button size="lg" variant="outline" className="h-12 rounded-full border-primary/30 bg-card/50 px-8 text-foreground hover:bg-secondary/70">
                            Coding Features
                        </Button>
                    </Link>
                    <Link href="/upload">
                        <Button size="lg" variant="outline" className="h-12 rounded-full border-primary/30 bg-card/50 px-8 text-foreground hover:bg-secondary/70">
                            File Upload
                        </Button>
                    </Link>
                    <Link href="https://github.com/kiruthick103/jeff-tune" target="_blank">
                        <Button size="lg" variant="outline" className="h-12 rounded-full border-primary/30 bg-card/50 px-8 text-foreground hover:bg-secondary/70">
                            View on GitHub
                        </Button>
                    </Link>
                </div>

                <div className="mt-16 grid w-full max-w-4xl grid-cols-1 gap-5 text-left sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { icon: <Bot size={18} className="text-primary" />, title: 'Model Garden', desc: 'Select from multiple AI models in one place.' },
                        { icon: <Code size={18} className="text-primary" />, title: 'Coding Tools', desc: 'Advanced AI-powered development features.' },
                        { icon: <Upload size={18} className="text-primary" />, title: 'File Upload', desc: 'Multi-modal AI analysis for images, documents, and more.' },
                        { icon: <Cpu size={18} className="text-primary" />, title: 'Agent Paths', desc: 'Use Agent Mode for deeper, step-by-step work.' },
                    ].map((feature) => (
                        <div key={feature.title} className="garden-panel p-5">
                            <div className="mb-3 inline-flex rounded-full border border-primary/25 bg-primary/10 p-2">
                                {feature.icon}
                            </div>
                            <h3 className="font-serif text-xl font-semibold text-foreground">{feature.title}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">{feature.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-10 flex items-center gap-2 rounded-full border border-primary/20 bg-card/60 px-4 py-1.5 text-xs text-muted-foreground">
                    <Zap size={12} className="text-primary" />
                    Country garden style is active across Home and Chat.
                </div>
            </div>
        </main>
    );
}
