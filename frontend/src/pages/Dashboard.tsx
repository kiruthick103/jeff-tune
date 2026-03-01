import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Upload, ImageIcon, Zap, Sparkles, Loader2, LogOut, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard: React.FC = () => {
    const { logout } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
            setResult(null);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/upload-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setResult(res.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to process image');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-6 md:p-12 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-[-10rem] left-[-10rem] w-[40rem] h-[40rem] bg-primary/20 rounded-full blur-[100px] animate-pulse-slow"></div>
            <div className="absolute bottom-[-10rem] right-[-10rem] w-[30rem] h-[30rem] bg-accent/10 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>

            <header className="flex justify-between items-center mb-12 relative z-10">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        Jeff Tune <span className="text-primary">Pro</span>
                    </h1>
                    <p className="text-white/40 text-sm">Production-grade Image Intelligence</p>
                </div>
                <button onClick={logout} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm">
                    <LogOut size={16} /> Sign Out
                </button>
            </header>

            <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px]"
                >
                    <input
                        type="file"
                        id="image-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />

                    <AnimatePresence mode="wait">
                        {!preview ? (
                            <motion.label
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                htmlFor="image-upload"
                                className="flex flex-col items-center cursor-pointer group"
                            >
                                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                                    <Upload className="text-white/40 group-hover:text-primary transition-colors" size={32} />
                                </div>
                                <p className="text-white/60 font-medium">Click to upload image</p>
                                <p className="text-white/30 text-xs mt-2 uppercase tracking-widest">JPG, PNG up to 10MB</p>
                            </motion.label>
                        ) : (
                            <motion.div
                                key="preview"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-full flex flex-col items-center"
                            >
                                <div className="w-full h-64 rounded-xl overflow-hidden mb-6 border border-white/10">
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex gap-4 w-full">
                                    <label htmlFor="image-upload" className="flex-1 text-center text-xs py-3 border border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
                                        Change Image
                                    </label>
                                    <button
                                        onClick={handleUpload}
                                        disabled={loading}
                                        className="btn-primary flex-1"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : <><Zap size={18} /> Process AI</>}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.section>

                <section className="flex flex-col gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card rounded-2xl p-8 flex-1"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Sparkles className="text-primary" size={20} />
                            </div>
                            <h2 className="text-xl font-bold">AI Result</h2>
                        </div>

                        <AnimatePresence mode="wait">
                            {result ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                                        <p className="text-xs text-primary/60 uppercase tracking-widest font-bold mb-1">Prediction</p>
                                        <p className="text-2xl font-bold text-primary">{result.prediction_result}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                                            <p className="text-xs text-white/30 mb-1">Format</p>
                                            <p className="font-medium">Vision Ready</p>
                                        </div>
                                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                                            <p className="text-xs text-white/30 mb-1">Status</p>
                                            <p className="flex items-center justify-center gap-1 text-green-400">
                                                <CheckCircle2 size={14} /> Completed
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 opacity-20">
                                    <ImageIcon size={64} className="mb-4" />
                                    <p>Awaiting upload...</p>
                                </div>
                            )}
                        </AnimatePresence>

                        {error && (
                            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm text-center">
                                {error}
                            </div>
                        )}
                    </motion.div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="glass-card rounded-2xl p-6 text-center">
                            <p className="text-white/40 text-xs mb-1 uppercase tracking-widest font-bold">Latency</p>
                            <p className="text-2xl font-bold whitespace-nowrap">~240ms</p>
                        </div>
                        <div className="glass-card rounded-2xl p-6 text-center">
                            <p className="text-white/40 text-xs mb-1 uppercase tracking-widest font-bold">API Status</p>
                            <p className="text-green-500 text-2xl font-bold whitespace-nowrap">Online</p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
