'use client';

import { Mic, MicOff, Video, VideoOff, PhoneOff, Settings, MonitorUp, MoreHorizontal, Maximize2, ShieldCheck, Zap, Bot } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useWebRTC } from './useWebRTC';
import { useAuthStore } from '@/store/useAuthStore';
import { useSocket } from './SocketProvider';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { motion, AnimatePresence } from 'framer-motion';

export default function VideoGrid({ 
  roomId, 
  onEndSession, 
  isEnding 
}: { 
  roomId: string;
  onEndSession?: () => void;
  isEnding?: boolean;
}) {
  const { user } = useAuthStore();
  const socket = useSocket();
  const { peers, localStream, toggleAudio, toggleVideo, shareScreen } = useWebRTC(roomId, user?.id || '');
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const { transcript, isListening, startListening, stopListening } = useSpeechRecognition();
  
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }

    if (isMicOn) {
      startListening();
    } else {
      stopListening();
    }

    const interval = setInterval(() => {
      if (isMicOn && socket && user) {
        socket.emit('speaking-active', { roomId, userName: user.name });
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      stopListening();
    };
  }, [localStream, isMicOn, socket, user, roomId, startListening, stopListening]);

  useEffect(() => {
    if (transcript.length > 30 && socket && user) {
      socket.emit('send-message', {
        roomId,
        message: transcript,
        sender: user.name,
        isSpeech: true,
        history: []
      });
    }
  }, [transcript, socket, user, roomId]);

  const handleToggleAudio = () => {
    toggleAudio();
    setIsMicOn(!isMicOn);
  };

  const handleToggleVideo = () => {
    toggleVideo();
    setIsVideoOn(!isVideoOn);
  };

  return (
    <div className="flex-1 flex flex-col p-8 bg-black/60 relative overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />

      {/* Top Session Info Bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Encrypted Session</span>
          </div>
          <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3">
            <Zap className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-primary">Intelligence Active</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-xs font-bold text-gray-500 mr-2">Room ID: {roomId.slice(0, 8)}...</span>
           <button className="p-2 hover:bg-white/5 rounded-lg text-gray-500 transition-colors">
              <Settings className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        {/* Local Video */}
        <motion.div 
          layout
          className="relative rounded-[32px] overflow-hidden bg-neutral-900 border border-white/5 shadow-2xl group"
        >
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover scale-x-[-1]"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="absolute top-4 right-4 z-10">
             <div className="p-2 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Maximize2 className="w-4 h-4 text-white" />
             </div>
          </div>

          <div className="absolute bottom-6 left-6 flex items-center gap-3 px-4 py-2 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10">
            <div className={`w-2 h-2 rounded-full ${isMicOn ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm font-black tracking-tight">{user?.name} (You)</span>
          </div>

          <AnimatePresence>
            {transcript && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[90%] text-center pointer-events-none"
              >
                <span className="bg-black/80 backdrop-blur-2xl px-5 py-3 rounded-[20px] text-sm border border-white/10 text-white font-medium shadow-2xl inline-block max-w-full">
                  {transcript}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {!isVideoOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
               <div className="relative">
                  <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl animate-pulse" />
                  <img src={user?.avatar} alt={user?.name} className="w-32 h-32 rounded-full border-4 border-white/10 relative z-10" />
               </div>
            </div>
          )}
        </motion.div>

        {/* Remote Peers */}
        {peers.map((peer) => (
          <RemoteVideo key={peer.peerId} peer={peer} />
        ))}

        {/* AI Moderator Bot View */}
        <motion.div 
          layout
          className="relative rounded-[32px] overflow-hidden bg-neutral-900 border border-white/5 shadow-2xl group"
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
             <div className="relative mb-6">
                <div className="absolute -inset-8 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center border-2 border-primary/20 relative z-10">
                   <Bot className="w-16 h-16 text-primary" />
                </div>
             </div>
             <p className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">AI Moderator</p>
          </div>
          <div className="absolute bottom-6 left-6 flex items-center gap-3 px-4 py-2 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-sm font-black tracking-tight text-primary">GDVerse Bot</span>
          </div>
        </motion.div>
      </div>

      {/* High-End Controls Bar */}
      <div className="mt-10 flex items-center justify-center gap-6">
        <div className="flex items-center gap-3 p-2 bg-white/5 rounded-[24px] border border-white/5">
          <ControlButton
            onClick={handleToggleAudio}
            active={isMicOn}
            icon={isMicOn ? <Mic /> : <MicOff />}
            danger={!isMicOn}
          />
          <ControlButton
            onClick={handleToggleVideo}
            active={isVideoOn}
            icon={isVideoOn ? <Video /> : <VideoOff />}
            danger={!isVideoOn}
          />
        </div>

        <div className="flex items-center gap-3 p-2 bg-white/5 rounded-[24px] border border-white/5">
          <ControlButton
            onClick={shareScreen}
            active={true}
            icon={<MonitorUp />}
          />
          <ControlButton
            onClick={() => {}}
            active={true}
            icon={<MoreHorizontal />}
          />
        </div>

        <button 
          onClick={onEndSession}
          disabled={isEnding}
          className={`h-16 px-8 rounded-[24px] transition-all flex items-center gap-3 shadow-2xl ${
            isEnding ? 'bg-neutral-800' : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
          } text-white`}
        >
          {isEnding ? (
            <span className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <PhoneOff className="w-6 h-6" />
              <span className="font-black uppercase tracking-widest text-sm">End Session</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function ControlButton({ onClick, active, icon, danger }: any) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-[20px] transition-all duration-300 ${
        active 
          ? 'bg-white/5 hover:bg-white/10 text-gray-200' 
          : 'bg-red-500/10 text-red-500 border border-red-500/20'
      } ${danger ? 'hover:bg-red-500/20' : ''}`}
    >
      {Object.cloneElement(icon, { size: 24, strokeWidth: 2.5 })}
    </button>
  );
}

function RemoteVideo({ peer }: { peer: any }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && peer.stream) {
      videoRef.current.srcObject = peer.stream;
    }
  }, [peer.stream]);

  return (
    <motion.div 
      layout
      className="relative rounded-[32px] overflow-hidden bg-neutral-900 border border-white/5 shadow-2xl group"
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-6 left-6 flex items-center gap-3 px-4 py-2 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <span className="text-sm font-black tracking-tight">Participant</span>
      </div>
    </motion.div>
  );
}
