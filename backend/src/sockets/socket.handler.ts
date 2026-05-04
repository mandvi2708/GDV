import { Server, Socket } from 'socket.io';
import GeminiService from '../services/gemini.service';

// Store for active participants in rooms
const roomParticipants = new Map<string, Set<string>>();
const roomModes = new Map<string, string>();
const roomStartTimes = new Map<string, number>(); // roomId -> timestamp
const speakingTime = new Map<string, Map<string, number>>(); // roomId -> userId -> seconds
const sentimentHistory = new Map<string, string[]>(); // roomId -> sentiments

export const handleSocketEvents = (io: Server) => {
  // Stats broadcast interval
  setInterval(() => {
    roomStartTimes.forEach((startTime, roomId) => {
      const now = Date.now();
      const durationSeconds = Math.floor((now - startTime) / 1000);
      
      const stats = speakingTime.get(roomId);
      let totalSpeakingSeconds = 0;
      if (stats) {
        stats.forEach((time) => {
          totalSpeakingSeconds += time;
        });
      }

      // Calculate "Activity Percentage" (rough metric: total speaking time / (duration * number of participants))
      const participantCount = roomParticipants.get(roomId)?.size || 1;
      const activityPercentage = Math.min(
        100,
        Math.round((totalSpeakingSeconds / (durationSeconds * participantCount || 1)) * 100)
      );

      io.to(roomId).emit('room-stats', {
        duration: durationSeconds,
        activity: activityPercentage
      });
    });
  }, 5000);

  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    // Join a discussion room
    socket.on('join-room', (roomId: string, userId: string, userName: string, mode: string = 'General GD') => {
      socket.join(roomId);
      
      if (!roomParticipants.has(roomId)) {
        roomParticipants.set(roomId, new Set());
        speakingTime.set(roomId, new Map());
        roomStartTimes.set(roomId, Date.now()); // Set start time when first person joins
      }
      roomParticipants.get(roomId)?.add(userName);
      roomModes.set(roomId, mode);

      if (!speakingTime.get(roomId)?.has(userName)) {
        speakingTime.get(roomId)?.set(userName, 0);
      }
      
      console.log(`User ${userName} joined room ${roomId} in ${mode} mode`);
      
      // Broadcast updated participant list
      io.to(roomId).emit('update-participants', Array.from(roomParticipants.get(roomId) || []));
      
      // Send initial leaderboard and stats to the new user
      const roomStats = speakingTime.get(roomId);
      if (roomStats) {
        const leaderboard = Array.from(roomStats.entries())
          .map(([name, time]) => ({ name, time }))
          .sort((a, b) => b.time - a.time);
        socket.emit('leaderboard-update', leaderboard);
      }

      const startTime = roomStartTimes.get(roomId) || Date.now();
      const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
      socket.emit('room-stats', {
        duration: durationSeconds,
        activity: 0 // Will update on next interval
      });

      // Notify others
      socket.to(roomId).emit('user-joined', { userId, userName });
    });

    // Handle typing indicators
    socket.on('typing', (data: { roomId: string; userName: string }) => {
      socket.to(data.roomId).emit('user-typing', data);
    });

    socket.on('stop-typing', (data: { roomId: string; userName: string }) => {
      socket.to(data.roomId).emit('user-stop-typing', data);
    });

    // Handle chat messages
    socket.on('send-message', async (data: { roomId: string; message: string; sender: string; history: any[] }) => {
      // Broadcast user message
      io.to(data.roomId).emit('new-message', data);
      
      const currentMode = roomModes.get(data.roomId) || 'General GD';

      // Real-time Sentiment Analysis
      const sentiment = await GeminiService.performSentimentAnalysis(data.message);
      io.to(data.roomId).emit('sentiment-update', { sender: data.sender, sentiment });
      
      // AI Moderation logic
      if (data.message.includes('@ai')) {
        const aiResponse = await GeminiService.generateResponse(data.message.replace('@ai', ''), data.history || [], currentMode);
        io.to(data.roomId).emit('new-message', {
          roomId: data.roomId,
          message: aiResponse,
          sender: 'AI Assistant',
          isAI: true
        });
      } else {
        // Subtle moderation check (optional)
        const moderation = await GeminiService.generateModeration(data.history || [], data.message, currentMode);
        if (moderation && moderation !== "NO_INTERVENTION") {
          io.to(data.roomId).emit('new-message', {
            roomId: data.roomId,
            message: moderation,
            sender: 'AI Moderator',
            isAI: true
          });
        }
      }
    });

    // Handle speaking time updates
    socket.on('speaking-active', (data: { roomId: string; userName: string }) => {
      const roomStats = speakingTime.get(data.roomId);
      if (roomStats) {
        const current = roomStats.get(data.userName) || 0;
        roomStats.set(data.userName, current + 1);
        
        // Broadcast leaderboard update
        const leaderboard = Array.from(roomStats.entries())
          .map(([name, time]) => ({ name, time }))
          .sort((a, b) => b.time - a.time);
          
        io.to(data.roomId).emit('leaderboard-update', leaderboard);
      }
    });

    // Request Discussion Summary
    socket.on('request-summary', async (data: { roomId: string; history: any[] }) => {
      io.to(data.roomId).emit('new-message', {
        roomId: data.roomId,
        message: "Generating discussion summary and feedback... 🤖",
        sender: "AI Assistant",
        isAI: true
      });

      const summary = await GeminiService.generateSummary(data.history);
      io.to(data.roomId).emit('new-message', {
        roomId: data.roomId,
        message: summary,
        sender: "AI Assistant",
        isAI: true
      });
    });

    // Finalize and End Session (Minutes of Meeting)
    socket.on('finish-session', async (data: { roomId: string; history: any[] }) => {
      try {
        console.log(`Finalizing session for room ${data.roomId}`);
        
        // 1. Generate MoM (Minutes of Meeting)
        const mom = await GeminiService.generateSummary(data.history);
        
        // 2. Calculate Final Stats
        const startTime = roomStartTimes.get(data.roomId) || Date.now();
        const duration = Math.floor((Date.now() - startTime) / 1000);
        
        const stats = speakingTime.get(data.roomId);
        const participationStats = stats ? Array.from(stats.entries()).map(([name, time]) => ({ name, time })) : [];

        // 3. Update Database (Import Room model if needed, but let's assume it's available or use a service)
        // For simplicity in this handler, we'll update directly if we can import Room
        const Room = (await import('../models/Room')).default;
        await Room.findByIdAndUpdate(data.roomId, {
          status: 'ended',
          endedAt: new Date(),
          summary: mom,
          duration,
          participationStats
        });

        // 4. Notify all participants
        io.to(data.roomId).emit('session-ended', { 
          message: "The host has ended the session. Redirecting to dashboard...",
          mom
        });

        // 5. Cleanup
        roomParticipants.delete(data.roomId);
        roomModes.delete(data.roomId);
        roomStartTimes.delete(data.roomId);
        speakingTime.delete(data.roomId);

      } catch (error) {
        console.error('Failed to finalize session:', error);
        socket.emit('error', 'Failed to generate MoM and end session');
      }
    });

    // WebRTC Signaling
    socket.on('offer', (payload: { target: string; sdp: any }) => {
      io.to(payload.target).emit('offer', { sdp: payload.sdp, caller: socket.id });
    });

    socket.on('answer', (payload: { target: string; sdp: any }) => {
      io.to(payload.target).emit('answer', { sdp: payload.sdp, caller: socket.id });
    });

    socket.on('ice-candidate', (payload: { target: string; candidate: any }) => {
      io.to(payload.target).emit('ice-candidate', { candidate: payload.candidate, caller: socket.id });
    });

    socket.on('disconnecting', () => {
      // Clean up participants from all rooms this socket was in
      socket.rooms.forEach((roomId: string) => {
        const participants = roomParticipants.get(roomId);
        if (participants) {
          // This is a simplified cleanup. In production, mapping socket.id to userName is better.
          // For now, we'll notify that 'Someone' left if we don't have a robust mapping here.
          io.to(roomId).emit('user-left', socket.id);
        }
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
