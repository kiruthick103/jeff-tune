import Link from 'next/link';
import { Bot, Zap, Shield, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      {/* Hero */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center py-24">
        <div className="mb-6 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70">
          <Zap size={14} className="text-yellow-400" />
          Multi-model AI with Agent Mode
        </div>
        <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-7xl bg-gradient-to-br from-white via-white/90 to-white/50 bg-clip-text text-transparent">
          Jeff Tune Pro
        </h1>
        <p className="mt-6 max-w-xl text-lg text-white/60 leading-relaxed">
          A production-grade AI assistant with multi-model routing, Agent Mode, RAG, and streaming responses.
          Built for developers, creators, and power users.
        </p>
        <div className="mt-10 flex items-center gap-4">
          <Link href="/chat">
            <Button size="lg" className="bg-white text-black hover:bg-white/90 font-semibold px-8 h-12 rounded-full">
              Start Chatting →
            </Button>
          </Link>
          <Link href="https://github.com/kiruthick103/jeff-tune" target="_blank">
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/5 h-12 rounded-full px-8">
              View on GitHub
            </Button>
          </Link>
        </div>
        {/* Features */}
        <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full text-left">
          {[
            { icon: <Bot className="text-blue-400" size={20} />, title: 'Multi-Model AI', desc: 'Auto-routes to GPT-4o, Claude, or Gemini based on your task.' },
            { icon: <Cpu className="text-purple-400" size={20} />, title: 'Agent Mode', desc: 'Break down complex tasks with tool calling and step-by-step reasoning.' },
            { icon: <Shield className="text-green-400" size={20} />, title: 'Secure & Fast', desc: 'Edge-deployed, rate-limited API with Vercel for sub-100ms responses.' },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="mb-3">{f.icon}</div>
              <h3 className="font-semibold text-white mb-1">{f.title}</h3>
              <p className="text-sm text-white/50">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
