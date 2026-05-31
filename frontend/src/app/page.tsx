'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useAuth } from '@/context/AuthContext';
import RecorderPanel from '@/components/RecorderPanel';
import TranscriptPanel from '@/components/TranscriptPanel';

export default function Home() {
  const { user, loading, getAuthHeaders } = useAuth();
  const router = useRouter();

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

  // Authentication session guard
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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

  // Saves the transcript to the SQL database under user's profile
  const handleSaveTranscript = async () => {
    if (!transcript) return;
    console.log('Saving transcript to server:', { transcript, duration });
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/transcripts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(), // Inject JWT authorization headers
        },
        body: JSON.stringify({
          text: transcript,
          duration: duration,
          filename: 'recording.webm',
        }),
      });
      console.log('Server responded with status', response.status);
      if (!response.ok) {
        const errData = await response.json();
        console.error('Failed to save transcript:', errData);
        alert(`Failed to save transcript: ${errData.error || response.statusText}`);
        return;
      }

      alert('Transcript successfully saved to database!');
      
      // Reset state for another recording
      setTranscript('');
      setAudioUrl(null);
    } catch (err) {
      console.error('Failed to save transcript:', err);
      alert('Could not save transcript. Please check backend connection.');
    }
  };

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[300px] text-zinc-400 dark:text-zinc-500">
        <svg className="animate-spin h-5 w-5 mr-3 text-zinc-550" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span>Verifying active session...</span>
      </div>
    );
  }

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
