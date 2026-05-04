'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Command, Users } from 'lucide-react';
import { useSocket } from './SocketProvider';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  sender: string;
  message: string;
  isAI?: boolean;
}

export default function ChatSidebar({ 
  roomId, 
  messages, 
  setMessages 
}: { 
  roomId: string, 
  messages: Message[], 
  setMessages: React.Dispatch<React.SetStateAction<Message[]>> 
}) {
  const [input, setInput] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const socket = useSocket();
  const { user } = useAuthStore();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!socket || !user) return;

    socket.on('new-message', (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('user-typing', (data: { userName: string }) => {
      if (data.userName !== user.name) {
        setTypingUsers((prev) => Array.from(new Set([...prev, data.userName])));
      }
    });

    socket.on('user-stop-typing', (data: { userName: string }) => {
      setTypingUsers((prev) => prev.filter((u) => u !== data.userName));
    });

    socket.on('update-participants', (users: string[]) => {
      setParticipants(users);
    });

    return () => {
      socket.off('new-message');
      socket.off('user-typing');
      socket.off('user-stop-typing');
      socket.off('update-participants');
    };
  }, [socket, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket || !user) return;

    const messageData = {
      roomId,
      message: input,
      sender: user.name,
      history: messages.slice(-5).map(m => ({ role: m.isAI ? 'model' : 'user', content: m.message }))
    };

    socket.emit('send-message', messageData);
    setInput('');
    socket.emit('stop-typing', { roomId, userName: user.name });
  };

  const requestSummary = () => {
    if (!socket) return;
    socket.emit('request-summary', { 
      roomId, 
      history: messages.map(m => ({ role: m.isAI ? 'model' : 'user', content: m.message })) 
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!socket || !user) return;

    socket.emit('typing', { roomId, userName: user.name });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop-typing', { roomId, userName: user.name });
    }, 3000);
  };

  return (
    <div className="flex flex-col h-full glass border-l border-white/10 w-80 relative">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2[0.02]">
        <div>
          <div className="flex items-center gap-2 text-[10px] text-primary font-black uppercase tracking-widest mb-1">
            <Command className="w-3 h-3" />
            Intelligence
          </div>
          <h3 className="font-black text-lg tracking-tight">Chat Feed</h3>
        </div>
        <button 
          onClick={requestSummary}
          title="Get AI Summary"
          className="p-2 hover:bg-primary/20 bg-primary/10 rounded-xl text-primary transition-all hover:scale-110 active:scale-95"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      </div>

      {/* Participants Mini bar */}
      <div className="px-6 py-3 border-b border-white/5 bg-white/[0.01] flex items-center gap-4">
        <div className="flex -space-x-2">
          {participants.slice(0, 3).map((p, i) => (
            <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-background flex items-center justify-center text-[10px] font-bold">
              {p[0]}
            </div>
          ))}
          {participants.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-neutral-800 border-2 border-background flex items-center justify-center text-[8px] font-bold text-gray-400">
              +{participants.length - 3}
            </div>
          )}
        </div>
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{participants.length} Active</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex flex-col ${msg.isAI ? 'items-start' : 'items-end'}`}
            >
              <div className={`flex items-center gap-1.5 mb-2 text-[10px] font-black uppercase tracking-widest ${msg.isAI ? 'text-primary' : 'text-gray-500'}`}>
                {msg.isAI ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                {msg.sender}
              </div>
              <div className={`px-4 py-3 rounded-[20px] text-sm leading-relaxed shadow-sm ${
                msg.isAI 
                  ? 'bg-primary/10 border border-primary/20 text-white rounded-tl-none' 
                  : 'bg-white/5 border border-white/10 text-gray-300 rounded-tr-none'
              }`}>
                {msg.message}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 px-2">
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce" />
            </div>
            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">
              {typingUsers.length === 1 ? `${typingUsers[0]} is typing` : 'Multiple users typing'}
            </span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-white/5 bg-white/[0.02]">
        <form onSubmit={sendMessage} className="relative group">
          <input
            type="text"
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-12 focus:outline-none focus:border-primary/50 focus:bg-white/[0.07] transition-all text-sm font-medium placeholder:text-gray-600"
            placeholder="Collaborate or @ai..."
            value={input}
            onChange={handleInputChange}
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary/20 text-primary hover:bg-primary rounded-xl hover:text-white transition-all active:scale-90"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
