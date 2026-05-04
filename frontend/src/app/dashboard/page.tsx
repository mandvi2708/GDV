'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Video, Users, Clock, ArrowRight, Loader2, Search, TrendingUp, Award, Bot, Calendar, ChevronRight, Activity, FileText } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import useSWR from 'swr';

const fetcher = (url: string) => api.get(url).then(res => res.data.data);

export default function Dashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('live');

  const { data: rooms, error, isLoading } = useSWR(
    isAuthenticated && !['analytics', 'feedback'].includes(activeTab) 
      ? `/rooms?status=${activeTab}` 
      : null, 
    fetcher,
    { revalidateOnFocus: true, refreshInterval: 5000 }
  );

  const { data: globalStats } = useSWR(
    isAuthenticated ? '/rooms/stats/global' : null,
    fetcher,
    { revalidateOnFocus: true, refreshInterval: 10000 }
  );

  const mockAnalytics = [
    { name: 'Mon', score: 65 }, { name: 'Tue', score: 72 }, { name: 'Wed', score: 68 },
    { name: 'Thu', score: 85 }, { name: 'Fri', score: 78 }, { name: 'Sat', score: 90 }, { name: 'Sun', score: 88 },
  ];

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 selection:bg-primary/30">
      {/* Welcome Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3 text-primary font-bold text-sm uppercase tracking-widest mb-4">
            <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
            Executive Dashboard
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tighter leading-tight">
            Welcome back, <br />
            <span className="text-gradient">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-lg font-medium">
            Your intelligence-powered discussion hub is ready. 
            Monitor active sessions or launch a new initiative.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-wrap gap-4"
        >
          <Link href="/create-room" className="btn-primary flex items-center gap-3 px-8 py-5 text-lg shadow-2xl">
            <Plus className="w-6 h-6" />
            Launch Discussion
          </Link>
          <button className="btn-secondary flex items-center gap-3 px-8 py-5 text-lg">
            <Calendar className="w-6 h-6 text-gray-500" />
            Schedule
          </button>
        </motion.div>
      </div>

      {/* Global Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <StatItem icon={<Activity className="text-primary" />} label="Live Rooms" value={globalStats?.liveRooms || '0'} onClick={() => setActiveTab('live')} />
        <StatItem icon={<Users className="text-secondary" />} label="Active Users" value={globalStats?.activeUsers || '0'} />
        <StatItem icon={<Clock className="text-accent" />} label="Avg. Duration" value={globalStats?.avgDuration || '0m'} />
        <StatItem icon={<Bot className="text-primary" />} label="AI Summaries" value={globalStats?.aiSummaries || '0'} onClick={() => setActiveTab('ended')} />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        <div className="xl:col-span-2 space-y-12">
          {/* Navigation & Search */}
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex p-1.5 bg-white/5 rounded-2xl border border-white/10 w-full md:w-auto">
              {['live', 'scheduled', 'ended'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl text-sm font-bold transition-all capitalize ${
                    activeTab === tab ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search rooms..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-primary/50 transition-all font-medium text-sm"
              />
            </div>
          </div>

          {/* Rooms Grid */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {[1,2,3,4].map(i => <div key={i} className="h-64 bg-white/5 rounded-[32px] animate-pulse border border-white/5" />)}
              </motion.div>
            ) : rooms && rooms.length > 0 ? (
              <motion.div 
                key="rooms"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 gap-4"
              >
                {rooms.map((room: any, index: number) => (
                  <RoomCard key={room._id} room={room} index={index} />
                ))}
              </motion.div>
            ) : (
              <EmptyState />
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-8">
          <div className="glass-card p-8 rounded-[32px] border border-primary/20 bg-primary/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] -z-10" />
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Global Engagement
            </h3>
            <div className="h-48 w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockAnalytics}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-gray-400 font-medium leading-relaxed">
              Overall discussion activity is up <span className="text-green-500 font-bold">+14%</span> this week. 
              AI moderation has prevented 24 potential conflicts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ icon, label, value, onClick }: { icon: any; label: string; value: string; onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`glass-card p-6 rounded-[24px] border border-white/5 flex items-center gap-6 transition-all ${
        onClick ? 'cursor-pointer hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] border-primary/20' : ''
      }`}
    >
      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-2xl">
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black">{value}</p>
      </div>
    </div>
  );
}

function RoomCard({ room, index }: { room: any; index: number }) {
  const router = useRouter();
  const isEnded = room.status === 'ended';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card p-6 rounded-[24px] group flex items-center justify-between gap-6 hover:bg-white/[0.08] transition-all"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isEnded ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
        }`}>
          {isEnded ? <FileText className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </div>
        <h3 className="text-xl font-black tracking-tight truncate group-hover:text-primary transition-colors">
          {room.title}
        </h3>
      </div>

      <button 
        onClick={() => router.push(`/discussion/${room._id}`)}
        className={`flex items-center gap-2 font-black text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition-all flex-shrink-0 ${
          isEnded 
            ? 'bg-secondary/10 text-secondary hover:bg-secondary hover:text-white' 
            : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
        }`}
      >
        {isEnded ? 'View MoM' : 'Join Session'}
        <ChevronRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}



function EmptyState() {
  return (
    <div className="text-center py-32 glass-card rounded-[48px] border-dashed border-white/10">
      <div className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center mx-auto mb-8">
        <Video className="w-12 h-12 text-gray-700" />
      </div>
      <h2 className="text-3xl font-black mb-4 tracking-tight">No Active Sessions</h2>
      <p className="text-gray-500 mb-10 max-w-sm mx-auto font-medium">
        Launch your first discussion room to experience AI-powered moderation and automated minutes.
      </p>
      <Link href="/create-room" className="btn-primary px-10 py-4 inline-flex items-center gap-3">
        <Plus className="w-5 h-5" />
        Start Your First Room
      </Link>
    </div>
  );
}
