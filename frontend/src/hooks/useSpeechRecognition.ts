'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  
  // Track status to prevent concurrent calls
  // Statuses: 'stopped' | 'starting' | 'started'
  const statusRef = useRef<'stopped' | 'starting' | 'started'>('stopped');

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        statusRef.current = 'started';
      };

      rec.onend = () => {
        setIsListening(false);
        statusRef.current = 'stopped';
      };

      rec.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      rec.onerror = (event: any) => {
        // Silently handle common errors
        if (event.error === 'no-speech' || event.error === 'audio-capture') {
          return;
        }
        console.error('Speech Recognition Error:', event.error);
        statusRef.current = 'stopped';
        setIsListening(false);
      };

      setRecognition(rec);
    }

    return () => {
      if (statusRef.current !== 'stopped' && recognition) {
        try {
          recognition.stop();
        } catch (e) {}
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognition && statusRef.current === 'stopped' && !recognition.isStarted) {
      try {
        statusRef.current = 'starting';
        recognition.start();
        recognition.isStarted = true; // Add a custom flag directly to the object
      } catch (err: any) {
        if (err.name === 'InvalidStateError' || err.message?.includes('already started')) {
          statusRef.current = 'started';
          recognition.isStarted = true;
          setIsListening(true);
        } else {
          console.error('Start Listening Error:', err);
          statusRef.current = 'stopped';
        }
      }
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition && (statusRef.current === 'started' || statusRef.current === 'starting')) {
      try {
        recognition.stop();
        recognition.isStarted = false;
        statusRef.current = 'stopped';
        setIsListening(false);
      } catch (err) {
        console.error('Stop Listening Error:', err);
      }
    }
  }, [recognition]);

  return { transcript, isListening, startListening, stopListening };
};
