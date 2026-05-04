'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Globe, Lock, Bot, Sparkles, ArrowRight, Loader2, Command, ShieldCheck, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

export default function CreateRoomPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mode: 'General GD',
    isPublic: true,
    aiModerator: true,
    aiParticipant: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.post('/rooms', {
        title: formData.title,
        description: formData.description,
        mode: formData.mode,
        isPublic: formData.isPublic,
        aiSettings: {
          moderatorEnabled: formData.aiModerator,
          participantEnabled: formData.aiParticipant,
        }
      });
      router.push(`/discussion/${data.data._id}`);
    } catch (err: any) {
      console.error('Room Creation Error:', err.response?.data || err.message);
      const data = err.response?.data;
      let errorMessage = data?.message || 'Failed to create room';
      
      if (data?.errors) {
        const firstError = Object.values(data.errors)[0] as any;
        errorMessage = firstError.message || errorMessage;
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen mesh-gradient pt-32 pb-20 px-4 selection:bg-primary/30">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-6">
            <Command className="w-3 h-3" />
            Initialization Protocol
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">Launch a <span className="text-gradient">Session.</span></h1>
          <p className="text-gray-500 text-lg font-medium max-w-2xl mx-auto">
            Configure your discussion environment with enterprise-grade WebRTC and Gemini-powered moderation.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="glass-card p-10 md:p-16 rounded-[48px] border border-white/10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -z-10" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-10">
              {/* Basic Info */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Session Title</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 focus:outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all text-xl font-bold tracking-tight"
                    placeholder="e.g. Strategic Planning Q4"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Context & Agenda</label>
                  <textarea
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 focus:outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all min-h-[150px] font-medium text-sm leading-relaxed"
                    placeholder="Briefly describe the goals of this session..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              {/* Mode Selection */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary">Discussion Protocol</h3>
                <div className="grid grid-cols-3 gap-3">
                  {['General GD', 'Debate', 'Interview'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFormData({ ...formData, mode: m })}
                      className={`py-4 rounded-2xl border transition-all text-xs font-black uppercase tracking-widest ${
                        formData.mode === m ? 'bg-primary/20 border-primary/40 text-primary shadow-lg shadow-primary/10' : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-12">
              {/* Privacy Settings */}
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-secondary">Security & Privacy</h3>
                <div className="grid grid-cols-1 gap-4">
                  <PrivacyOption 
                    active={formData.isPublic} 
                    onClick={() => setFormData({ ...formData, isPublic: true })}
                    icon={<Globe className="w-6 h-6" />}
                    title="Public Access"
                    desc="Visible to all organization members"
                  />
                  <PrivacyOption 
                    active={!formData.isPublic} 
                    onClick={() => setFormData({ ...formData, isPublic: false })}
                    icon={<Lock className="w-6 h-6" />}
                    title="Private Access"
                    desc="Join via secure invite only"
                  />
                </div>
              </div>

              {/* AI Features */}
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-accent">Intelligence Layer</h3>
                <div className="space-y-4">
                  <AIOption 
                    checked={formData.aiModerator}
                    onChange={(val) => setFormData({ ...formData, aiModerator: val })}
                    icon={<Zap className="w-5 h-5 text-primary" />}
                    title="AI Moderator"
                    desc="Real-time sentiment & summaries"
                  />
                  <AIOption 
                    checked={formData.aiParticipant}
                    onChange={(val) => setFormData({ ...formData, aiParticipant: val })}
                    icon={<Sparkles className="w-5 h-5 text-accent" />}
                    title="AI Participant"
                    desc="Gemini-driven discussion input"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-6 text-xl flex items-center justify-center gap-4 disabled:opacity-50 group mt-4 shadow-2xl"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    Initialize Session
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.form>

        <div className="mt-12 flex justify-center items-center gap-10 text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">
           <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              P2P Encrypted
           </div>
           <div className="flex items-center gap-2">
              <Command className="w-4 h-4" />
              Gemini 1.5 Flash
           </div>
           <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Zero Latency
           </div>
        </div>
      </div>
    </div>
  );
}

function PrivacyOption({ active, onClick, icon, title, desc }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-4 p-5 rounded-[24px] border transition-all text-left ${
        active ? 'bg-secondary/10 border-secondary/30 ring-1 ring-secondary/20' : 'bg-white/5 border-white/10 hover:bg-white/[0.08]'
      }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${active ? 'bg-secondary/20 text-secondary' : 'bg-white/5 text-gray-500'}`}>
        {icon}
      </div>
      <div>
        <p className={`text-sm font-black tracking-tight ${active ? 'text-white' : 'text-gray-400'}`}>{title}</p>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{desc}</p>
      </div>
    </button>
  );
}

function AIOption({ checked, onChange, icon, title, desc }: any) {
  return (
    <label className="flex items-center justify-between p-5 rounded-[24px] bg-white/5 border border-white/10 cursor-pointer hover:bg-white/[0.08] transition-all group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div>
          <p className="text-sm font-black tracking-tight text-white">{title}</p>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{desc}</p>
        </div>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-6 h-6 rounded-lg accent-primary border-white/10 bg-white/5"
      />
    </label>
  );
}
