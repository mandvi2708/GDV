'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, Sparkles, Command } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/login', formData);
      setAuth(data.user, data.token);
      router.push('/dashboard');
    } catch (err: any) {
      const errorMsg = err.response?.data?.errors 
        ? err.response.data.errors[0].msg 
        : err.response?.data?.message || 'Login failed. Invalid credentials.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 mesh-gradient selection:bg-primary/30">
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-6">
            <Command className="w-3 h-3" />
            Intelligence Layer Secure
          </div>
          <h2 className="text-5xl font-black mb-3 tracking-tighter">Welcome <span className="text-gradient">Back.</span></h2>
          <p className="text-gray-500 font-medium">Continue your collaborative journey with GDVerse.</p>
        </div>

        <div className="glass-card p-10 rounded-[40px] border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] -z-10" />
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold rounded-2xl flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Email Terminal</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all font-medium text-sm"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Key Access</label>
                <a href="#" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Forgot Key?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all font-medium text-sm"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-5 text-lg flex items-center justify-center gap-3 disabled:opacity-50 group"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Authenticate
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-white/5 text-center">
            <p className="text-gray-500 text-sm font-medium">
              New to the Verse?{' '}
              <Link href="/register" className="text-white hover:text-primary transition-colors font-black underline decoration-primary decoration-2 underline-offset-4">
                Initialize Account
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-12 flex justify-center items-center gap-8 text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">
           <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              Secure JWT
           </div>
           <div className="flex items-center gap-2">
              <Lock className="w-3 h-3" />
              Bcrypt Hash
           </div>
           <div className="flex items-center gap-2">
              <Command className="w-3 h-3" />
              NextJS 15
           </div>
        </div>
      </motion.div>
    </div>
  );
}
