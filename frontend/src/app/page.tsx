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

  // Send captured audio blob to Flask backend for transcription
  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      const uploadAndTranscribe = async () => {
        setIsTranscribing(true);
        setTranscript('');
        try {
          const formData = new FormData();
          const file = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
          formData.append('file', file);

          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
          const response = await fetch(`${apiUrl}/api/transcribe`, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Server returned error status: ${response.status}`);
          }

          const data = await response.json();
          setTranscript(data.transcript || '[No transcript returned by the server]');
        } catch (err) {
          console.error('Failed to transcribe audio:', err);
          setTranscript('[Failed to transcribe audio. Please make sure the Flask backend server is running on port 5000.]');
        } finally {
          setIsTranscribing(false);
        }
      };

      uploadAndTranscribe();

      return () => {
        URL.revokeObjectURL(url);
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
