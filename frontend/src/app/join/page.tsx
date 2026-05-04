'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Loader2, Hash } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function JoinRoomPage() {
  const [roomId, setRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim()) return;
    
    setIsLoading(true);
    // Simulate slight delay for premium feel
    setTimeout(() => {
      router.push(`/discussion/${roomId}`);
    }, 800);
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card p-10 rounded-[2.5rem] text-center"
      >
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3 group hover:rotate-0 transition-transform duration-500">
          <Hash className="w-10 h-10 text-primary" />
        </div>

        <h1 className="text-3xl font-extrabold mb-3">Join a Discussion</h1>
        <p className="text-gray-400 mb-10">Enter a unique Room ID to securely join an ongoing session.</p>

        <form onSubmit={handleJoin} className="space-y-6">
          <div className="relative group">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 focus:outline-none focus:border-primary transition-all text-center tracking-widest font-mono text-xl"
              placeholder="ROOM_ID_HERE"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !roomId}
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-2xl py-5 font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                Join Room Securely
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-sm text-gray-500">
          Don't have a Room ID? <button onClick={() => router.push('/dashboard')} className="text-primary hover:underline font-bold">Browse public rooms</button>
        </p>
      </motion.div>
    </div>
  );
}
