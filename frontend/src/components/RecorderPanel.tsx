'use client';

interface RecorderPanelProps {
  isRecording: boolean;
  isPaused: boolean;
  duration: number; // duration in seconds
  onStart: () => void;
  onStop: () => void;
  onTogglePause: () => void;
}

export default function RecorderPanel({
  isRecording,
  isPaused,
  duration,
  onStart,
  onStop,
  onTogglePause,
}: RecorderPanelProps) {
  
  // Format seconds into HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white border border-zinc-150 rounded-2xl shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
        Voice Capture
      </h2>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-8">
        Click the microphone to start transcribing your speech in real-time
      </p>

      {/* Recording Visualizer */}
      <div className="relative flex items-center justify-center h-48 w-48 mb-8">
        {/* Pulsing ring animations around mic */}
        {isRecording && !isPaused && (
          <>
            <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping" />
            <div className="absolute inset-4 rounded-full bg-red-500/20 animate-pulse" />
          </>
        )}
        
        <button
          onClick={isRecording ? onStop : onStart}
          className={`relative z-10 flex h-32 w-32 items-center justify-center rounded-full transition-all duration-300 shadow-md ${
            isRecording 
              ? 'bg-red-550 hover:bg-red-600 text-white ring-4 ring-red-100 dark:ring-red-950/30' 
              : 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-100'
          }`}
          aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
        >
          {isRecording ? (
            <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1.5" />
            </svg>
          ) : (
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
      </div>

      {/* Timer display */}
      <div className="text-3xl font-mono font-medium tracking-tight text-zinc-900 dark:text-white mb-4">
        {formatTime(duration)}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-3 w-full max-w-[240px]">
        {isRecording && (
          <button
            onClick={onTogglePause}
            className="flex-1 py-2 px-4 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-850 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        )}
        
        <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400 mx-auto">
          <span className={`h-2 w-2 rounded-full ${isRecording && !isPaused ? 'bg-red-500 animate-pulse' : 'bg-zinc-300 dark:bg-zinc-650'}`} />
          {isRecording ? (isPaused ? 'Paused' : 'Recording') : 'Ready'}
        </div>
      </div>

      {/* Animated Waveform Blocks when active */}
      {isRecording && !isPaused && (
        <div className="flex items-end gap-1 h-6 mt-8 justify-center select-none">
          {[1.4, 2.1, 1.1, 2.7, 1.8, 1.2, 2.3, 1.5, 2.6, 1.1, 1.7, 1.3].map((val, idx) => (
            <span
              key={idx}
              className="w-1 bg-red-500 rounded-full transition-all duration-300"
              style={{
                height: `${Math.max(4, Math.sin(idx + duration * 1.5) * 8 + 12)}px`,
                opacity: 0.85
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
