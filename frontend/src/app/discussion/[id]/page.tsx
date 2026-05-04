'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSocket } from '@/features/discussion/SocketProvider';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, CheckCircle2, LayoutDashboard, FileText, Download, Share2, Sparkles, AlertCircle } from 'lucide-react';

const VideoGrid = dynamic(() => import('@/features/discussion/VideoGrid'), { ssr: false });
const ChatSidebar = dynamic(() => import('@/features/discussion/ChatSidebar'), { ssr: false });
const InsightsPanel = dynamic(() => import('@/features/discussion/InsightsPanel'), { ssr: false });

export default function DiscussionPage() {
  const { id } = useParams();
  const router = useRouter();
  const socket = useSocket();
  const { user, isAuthenticated } = useAuthStore();
  const [room, setRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isEnding, setIsEnding] = useState(false);
  const [showMoM, setShowMoM] = useState(false);
  const [momContent, setMomContent] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchRoom = async () => {
      try {
        const { data } = await api.get(`/rooms/${id}`);
        setRoom(data.data);
        if (data.data.status === 'ended') {
          setMomContent(data.data.summary || 'No summary available.');
          setShowMoM(true);
        }
      } catch (err) {
        console.error('Failed to fetch room');
      }
    };

    fetchRoom();
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (socket && user && id && room && room.status !== 'ended') {
      socket.emit('join-room', id, user.id, user.name, room.mode);

      socket.on('session-ended', (data: { message: string, mom: string }) => {
        setMomContent(data.mom);
        setShowMoM(true);
        setIsEnding(false);
      });

      return () => {
        socket.off('session-ended');
      };
    }
  }, [socket, user, id, room]);

  const endSession = async () => {
    if (!confirm('Are you sure you want to end this discussion and generate MoM?')) return;
    
    if (socket && id) {
      setIsEnding(true);
      socket.emit('finish-session', { 
        roomId: id, 
        history: messages.map(m => ({ role: m.isAI ? 'model' : 'user', content: m.message }))
      });
    }
  };

  const shareByEmail = () => {
    if (!room || !momContent) return;
    const subject = encodeURIComponent(`Minutes of Meeting: ${room.title}`);
    const body = encodeURIComponent(`Hello,\n\nPlease find below the Minutes of Meeting for "${room.title}":\n\n${momContent}\n\nBest regards,\nGDVerse AI Intelligence`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const downloadSummary = () => {
    if (!room || !momContent) return;
    const blob = new Blob([momContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MoM_${room.title.replace(/\s+/g, '_')}_${new Date().toLocaleDateString()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) return null;
  if (!room) return (
    <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center gap-6">
      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Synchronizing Intelligence...</p>
    </div>
  );

  const isHost = room.creator._id === user?.id;

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden relative mesh-gradient mt-20">
      <AnimatePresence mode="wait">
        {!showMoM ? (
          <motion.div 
            key="active-session"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex overflow-hidden"
          >
            <InsightsPanel roomId={id as string} />
            <VideoGrid roomId={id as string} onEndSession={endSession} isEnding={isEnding} />
            <ChatSidebar roomId={id as string} messages={messages} setMessages={setMessages} />
          </motion.div>
        ) : (
          <motion.div 
            key="mom-viewer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex items-center justify-center p-8 bg-black/40 backdrop-blur-sm"
          >
             {/* MoM Document Container */}
             <div className="bg-neutral-900 border border-white/10 w-full max-w-4xl max-h-[90vh] rounded-[40px] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(139,92,246,0.1)]">
                <div className="p-10 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-primary/10 via-transparent to-transparent">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-green-500/10 rounded-3xl flex items-center justify-center border border-green-500/20">
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-1">
                        <Sparkles className="w-3 h-3" />
                        AI Analysis Complete
                      </div>
                      <h2 className="text-3xl font-black tracking-tight">Minutes of Meeting</h2>
                    </div>
                  </div>
                  <div className="hidden md:flex gap-3">
                    <button 
                      onClick={shareByEmail}
                      title="Share via Email"
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-gray-400 hover:text-primary"
                    >
                       <Share2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={downloadSummary}
                      title="Download as Text"
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-primary hover:bg-primary/10"
                    >
                       <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                  <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5 text-gray-500 text-sm font-bold">
                       <div className="flex items-center gap-2">
                          <LayoutDashboard className="w-4 h-4" />
                          {room.title}
                       </div>
                       <div className="w-1 h-1 rounded-full bg-gray-800" />
                       <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Document ID: {id?.slice(-8)}
                       </div>
                    </div>

                    <div className="prose prose-invert prose-p:text-gray-400 prose-headings:text-white prose-strong:text-primary max-w-none">
                      {momContent === "The AI was unable to generate a summary due to an external service error. Your discussion was recorded, but the intelligence layer is currently unavailable." ? (
                        <div className="p-8 rounded-3xl bg-red-500/5 border border-red-500/10 flex items-start gap-4">
                           <AlertCircle className="w-6 h-6 text-red-500 mt-1" />
                           <div>
                              <h3 className="text-red-500 font-bold mb-2">Generation Failed</h3>
                              <p className="text-sm text-gray-500 leading-relaxed">{momContent}</p>
                           </div>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap text-lg leading-relaxed font-medium text-gray-300 font-sans tracking-tight">
                          {momContent}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-10 border-t border-white/5 bg-white/[0.01] flex flex-col sm:flex-row gap-4 items-center justify-between">
                   <div className="text-sm text-gray-500 font-medium">
                      GDVerse AI Security Certificate: <span className="text-primary font-mono">v1.0.4-verified</span>
                   </div>
                   <div className="flex gap-4 w-full sm:w-auto">
                      <button 
                        onClick={() => router.push('/dashboard')}
                        className="flex-1 sm:flex-none btn-secondary px-10"
                      >
                        Back to Dashboard
                      </button>
                      <button 
                        onClick={downloadSummary}
                        className="flex-1 sm:flex-none btn-primary px-10"
                      >
                        Finalize & Save
                      </button>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {isHost && !showMoM && (
        <div className="absolute bottom-10 left-10 z-[110]">
          <motion.button 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={endSession}
            disabled={isEnding}
            className="group flex items-center gap-3 px-6 py-3 bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-500 hover:text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {isEnding ? (
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <PhoneOff className="w-4 h-4 group-hover:animate-pulse" />
                Terminate Session
              </>
            )}
          </motion.button>
        </div>
      )}
    </div>
  );
}

function PhoneOff(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone-off"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
  );
}
