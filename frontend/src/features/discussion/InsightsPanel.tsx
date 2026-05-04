'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, TrendingUp, Award, Clock, PieChart, Zap, Activity, BrainCircuit } from 'lucide-react';
import { useSocket } from './SocketProvider';

interface LeaderboardEntry {
  name: string;
  time: number;
}

export default function InsightsPanel({ roomId }: { roomId: string }) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lastSentiment, setLastSentiment] = useState<{ sender: string; sentiment: string } | null>(null);
  const [stats, setStats] = useState({ duration: 0, activity: 0 });
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on('leaderboard-update', (data: LeaderboardEntry[]) => {
      setLeaderboard(data);
    });

    socket.on('sentiment-update', (data: { sender: string; sentiment: string }) => {
      setLastSentiment(data);
      setTimeout(() => setLastSentiment(null), 8000);
    });

    socket.on('room-stats', (data: { duration: number; activity: number }) => {
      setStats(data);
    });

    return () => {
      socket.off('leaderboard-update');
      socket.off('sentiment-update');
      socket.off('room-stats');
    };
  }, [socket]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-80 glass border-l border-white/10 p-8 flex flex-col gap-10 overflow-y-auto relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent opacity-50" />
      
      {/* Session Intelligence Header */}
      <div>
        <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em] mb-2">
          <BrainCircuit className="w-4 h-4" />
          Intelligence Engine
        </div>
        <h2 className="text-2xl font-black tracking-tight">Live <span className="text-gradient">Insights</span></h2>
      </div>

      {/* Stats Summary - Now at top for immediate visibility */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white/5 rounded-[24px] border border-white/5 relative group overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Clock className="w-4 h-4 text-primary mb-2" />
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Duration</p>
          <p className="text-xl font-black text-gray-200">{formatDuration(stats.duration)}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-[24px] border border-white/5 relative group overflow-hidden">
          <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Activity className="w-4 h-4 text-secondary mb-2" />
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Activity</p>
          <p className="text-xl font-black text-gray-200">{stats.activity}%</p>
        </div>
      </div>

      {/* Participation Leaderboard */}
      <div className="flex-1">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2 mb-6">
          <Award className="w-4 h-4 text-primary" />
          Engagement
        </h3>
        <div className="space-y-6">
          {leaderboard.length > 0 ? (
            leaderboard.map((entry, index) => (
              <div key={entry.name} className="relative group">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="font-bold text-gray-300 flex items-center gap-2">
                    {index === 0 && <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                    {entry.name}
                  </span>
                  <span className="text-[10px] font-mono text-gray-500">{entry.time}s</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5 p-[1px]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(entry.time / (leaderboard[0]?.time || 1)) * 100}%` }}
                    transition={{ type: 'spring', damping: 20 }}
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 text-center glass-card rounded-2xl border-dashed">
              <p className="text-xs text-gray-500 font-medium italic">No signal detected...</p>
            </div>
          )}
        </div>
      </div>

      {/* Sentiment Insights */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2 mb-6">
          <TrendingUp className="w-4 h-4 text-secondary" />
          Sentiment Flow
        </h3>
        <AnimatePresence mode="wait">
          {lastSentiment ? (
            <motion.div
              key={lastSentiment.sender + lastSentiment.sentiment}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`p-5 rounded-[24px] border shadow-2xl ${
                lastSentiment.sentiment === 'Positive' 
                  ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                  : lastSentiment.sentiment === 'Negative'
                  ? 'bg-red-500/10 border-red-500/20 text-red-500'
                  : 'bg-primary/10 border-primary/20 text-primary'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  lastSentiment.sentiment === 'Positive' ? 'bg-green-500' : lastSentiment.sentiment === 'Negative' ? 'bg-red-500' : 'bg-primary'
                }`} />
                <p className="text-[10px] font-black uppercase tracking-widest">{lastSentiment.sender}</p>
              </div>
              <p className="text-sm font-bold leading-tight">{lastSentiment.sentiment} Analysis detected in current speech.</p>
            </motion.div>
          ) : (
            <div className="p-6 rounded-[24px] bg-white/5 border border-white/5 text-center group hover:bg-white/10 transition-colors cursor-help">
              <Activity className="w-5 h-5 text-gray-700 mx-auto mb-3 group-hover:text-primary transition-colors" />
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Listening for emotional cues</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Tips or AI Advice */}
      <div className="p-4 bg-gradient-to-br from-primary/20 to-transparent rounded-[24px] border border-primary/20">
        <p className="text-[10px] text-primary font-black uppercase mb-2">AI Pro Tip</p>
        <p className="text-xs text-gray-400 font-medium leading-relaxed">
          The discussion seems balanced. Try to invite quieter participants to share their perspectives.
        </p>
      </div>
    </div>
  );
}
