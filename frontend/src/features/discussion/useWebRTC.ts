'use client';

import { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { useSocket } from './SocketProvider';
import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
}

interface PeerConnection {
  peerId: string;
  peer: Peer.Instance;
  stream?: MediaStream;
}

export const useWebRTC = (roomId: string, userId: string) => {
  const [peers, setPeers] = useState<PeerConnection[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const socket = useSocket();
  const peersRef = useRef<PeerConnection[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const activeStreams = useRef<MediaStream[]>([]);

  useEffect(() => {
    if (!socket) return;

    const stopAllTracks = () => {
      console.log(`UNMOUNT: Stopping ${activeStreams.current.length} active streams`);
      activeStreams.current.forEach(stream => {
        stream.getTracks().forEach(track => {
          track.enabled = false;
          track.stop();
          console.log(`Stopped track: ${track.kind}`);
        });
      });
      activeStreams.current = [];
      streamRef.current = null;
    };

    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        streamRef.current = stream;
        activeStreams.current.push(stream);

        socket.on('user-joined', (data: { userId: string; userName: string }) => {
          if (peersRef.current.find(p => p.peerId === data.userId)) return;
          const peer = createPeer(data.userId, socket.id!, stream);
          peersRef.current.push({ peerId: data.userId, peer });
          setPeers([...peersRef.current]);
        });

        socket.on('offer', (payload: { caller: string; sdp: any }) => {
          if (peersRef.current.find(p => p.peerId === payload.caller)) return;
          const peer = addPeer(payload.sdp, payload.caller, stream);
          peersRef.current.push({ peerId: payload.caller, peer });
          setPeers([...peersRef.current]);
        });

        socket.on('answer', (payload: { target: string; sdp: any; caller: string }) => {
          const item = peersRef.current.find((p) => p.peerId === payload.caller);
          if (item) item.peer.signal(payload.sdp);
        });

        socket.on('ice-candidate', (payload: { target: string; candidate: any; caller: string }) => {
          const item = peersRef.current.find((p) => p.peerId === payload.caller);
          if (item) item.peer.signal(payload.candidate);
        });
      } catch (err) {
        console.error('Media Access Denied:', err);
      }
    };

    initMedia();

    // Force cleanup on page navigation even before unmount if possible
    window.addEventListener('popstate', stopAllTracks);

    return () => {
      window.removeEventListener('popstate', stopAllTracks);
      stopAllTracks();
      peersRef.current.forEach((p) => {
        try {
          p.peer.destroy();
        } catch (e) {}
      });
      socket.off('user-joined');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
    };
  }, [socket, roomId]);

  function createPeer(userToSignal: string, callerId: string, stream: MediaStream) {
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on('signal', (signal) => {
      socket?.emit('offer', { target: userToSignal, caller: callerId, sdp: signal });
    });

    peer.on('stream', (remoteStream) => {
      peersRef.current = peersRef.current.map(p => {
        if (p.peerId === userToSignal) {
          return { ...p, stream: remoteStream };
        }
        return p;
      });
      setPeers([...peersRef.current]);
    });

    return peer;
  }

  function addPeer(incomingSignal: any, callerId: string, stream: MediaStream) {
    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on('signal', (signal) => {
      socket?.emit('answer', { target: callerId, sdp: signal, caller: socket.id });
    });

    peer.on('stream', (remoteStream) => {
      const p = peersRef.current.find(p => p.peerId === callerId);
      if (p) p.stream = remoteStream;
      setPeers([...peersRef.current]);
    });

    peer.signal(incomingSignal);

    return peer;
  }

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks()[0].enabled = !localStream.getAudioTracks()[0].enabled;
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks()[0].enabled = !localStream.getVideoTracks()[0].enabled;
    }
  };

  const shareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ cursor: true } as any);
      activeStreams.current.push(screenStream);
      const videoTrack = screenStream.getVideoTracks()[0];
      
      peersRef.current.forEach(({ peer }) => {
        peer.replaceTrack(
          localStream!.getVideoTracks()[0],
          videoTrack,
          localStream!
        );
      });

      videoTrack.onended = () => {
        videoTrack.stop();
        peersRef.current.forEach(({ peer }) => {
          peer.replaceTrack(
            videoTrack,
            localStream!.getVideoTracks()[0],
            localStream!
          );
        });
      };
    } catch (err) {
      console.error('Screen Share Failed:', err);
    }
  };

  return { peers, localStream, toggleAudio, toggleVideo, shareScreen };
};
