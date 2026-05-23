'use client';

import { useState, useEffect } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import RecorderPanel from '@/components/RecorderPanel';
import TranscriptPanel from '@/components/TranscriptPanel';

export default function Home() {
  const {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    startRecording,
    stopRecording,
    togglePause,
  } = useAudioRecorder();

  const [transcript, setTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Revoke previous audio URL to avoid memory leaks
  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      // Simulate transcription after recording stops
      setIsTranscribing(true);
      const timer = setTimeout(() => {
        setIsTranscribing(false);
        setTranscript(
          "This is a simulated transcript from your microphone recording. On Day 6, we will connect this page to the backend to perform real speech recognition on your uploaded audio."
        );
      }, 1500);

      return () => {
        URL.revokeObjectURL(url);
        clearTimeout(timer);
      };
    } else {
      setAudioUrl(null);
      setTranscript('');
    }
  }, [audioBlob]);

  const handleSaveTranscript = () => {
    alert('Transcript saved locally (DB persistence will be configured on Day 9).');
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
        <div className="lg:col-span-5 flex flex-col gap-4">
          <RecorderPanel
            isRecording={isRecording}
            isPaused={isPaused}
            duration={duration}
            onStart={startRecording}
            onStop={stopRecording}
            onTogglePause={togglePause}
          />

          {/* Local Audio Playback Preview */}
          {audioUrl && (
            <div className="p-4 bg-white border border-zinc-150 rounded-2xl shadow-sm dark:bg-zinc-900 dark:border-zinc-800 flex flex-col gap-2">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Playback Capture
              </span>
              <audio src={audioUrl} controls className="w-full h-8" />
            </div>
          )}
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
