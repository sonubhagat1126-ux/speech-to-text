'use client';

import { useState, useEffect, useRef } from 'react';
import RecorderPanel from '@/components/RecorderPanel';
import TranscriptPanel from '@/components/TranscriptPanel';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timer on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStartRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    setDuration(0);
    setTranscript('');
    setIsTranscribing(false);

    // Start timer counter
    timerRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  };

  const handleStopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRecording(false);
    setIsPaused(false);
    setIsTranscribing(true);

    // Simulate server side transcription delay
    setTimeout(() => {
      setIsTranscribing(false);
      setTranscript(
        "Hello! This is a demo speech-to-text transcription generated locally. The recording panel, timer, and visualizer are functioning perfectly. In the upcoming days, we will connect the live MediaRecorder stream directly to our Python Flask backend to transcribe your actual spoken words in real-time."
      );
    }, 1500);
  };

  const handleTogglePause = () => {
    if (isPaused) {
      // Resume timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
      setIsPaused(false);
    } else {
      // Pause timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsPaused(true);
    }
  };

  const handleSaveTranscript = () => {
    alert('Transcript saved successfully! (Note: Supabase persistence will be integrated on Day 9).');
  };

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      {/* Title section */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
          Transcription Studio
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          Capture high-fidelity recordings and convert speech into structured text.
        </p>
      </div>

      {/* Grid workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5">
          <RecorderPanel
            isRecording={isRecording}
            isPaused={isPaused}
            duration={duration}
            onStart={handleStartRecording}
            onStop={handleStopRecording}
            onTogglePause={handleTogglePause}
          />
        </div>
        <div className="lg:col-span-7">
          <TranscriptPanel
            transcript={transcript}
            isTranscribing={isTranscribing}
            onSave={handleSaveTranscript}
          />
        </div>
      </div>
    </div>
  );
}
