'use client';

import { useState } from 'react';

interface TranscriptPanelProps {
  transcript: string;
  isTranscribing: boolean;
  onSave: () => void;
}

export default function TranscriptPanel({
  transcript,
  isTranscribing,
  onSave,
}: TranscriptPanelProps) {
  const [copied, setCopied] = useState(false);

  // Copy text to clipboard
  const handleCopy = async () => {
    if (!transcript) return;
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Download transcript as plain .txt file
  const handleDownloadTxt = () => {
    if (!transcript) return;
    const element = document.createElement('a');
    const file = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Download transcript as Microsoft Word .doc file
  const handleDownloadDoc = () => {
    if (!transcript) return;
    
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
      "xmlns:w='urn:schemas-microsoft-com:office:word' " +
      "xmlns='http://www.w3.org/TR/REC-html40'>" +
      "<head><title>EchoScribe Transcript Record</title>" +
      "<style>body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; } " +
      "h2 { color: #18181b; border-bottom: 1px solid #e4e4e7; padding-bottom: 8px; } " +
      "p.meta { color: #71717a; font-size: 12px; margin-bottom: 24px; }</style></head><body>";
    const footer = "</body></html>";
    
    const sourceHTML = header + 
      "<h2>EchoScribe Transcript Archive</h2>" + 
      `<p class="meta"><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>` +
      `<p>${transcript.replace(/\n/g, '<br/>')}</p>` + 
      footer;
    
    const file = new Blob(['\ufeff' + sourceHTML], {
      type: 'application/msword'
    });
    
    const element = document.createElement('a');
    element.href = URL.createObjectURL(file);
    element.download = `transcript-${new Date().toISOString().slice(0, 10)}.doc`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col h-full min-h-[360px] p-6 bg-white border border-zinc-150 rounded-2xl shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850 pb-4 mb-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Transcript
        </h2>
        
        {/* Actions panel */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            disabled={!transcript}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <svg className="h-5 w-5 text-green-550" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            )}
          </button>

          {/* TXT Download Button */}
          <button
            onClick={handleDownloadTxt}
            disabled={!transcript}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Download Plain Text"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>

          {/* Word Download Button */}
          <button
            onClick={handleDownloadDoc}
            disabled={!transcript}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Download Word Document"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Transcript Text Box */}
      <div className="flex-1 overflow-y-auto mb-6 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 min-h-[200px] text-sm text-zinc-800 dark:text-white leading-relaxed font-sans select-text">
        {transcript ? (
          <p className="whitespace-pre-wrap">{transcript}</p>
        ) : isTranscribing ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[160px] text-zinc-400 gap-3">
            <svg className="animate-spin h-6 w-6 text-zinc-550" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Processing your voice input...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full min-h-[160px] text-zinc-400 dark:text-zinc-500 italic select-none">
            Your real-time speech transcription will appear here.
          </div>
        )}
      </div>

      {/* Save to History Button */}
      <button
        onClick={onSave}
        disabled={!transcript || isTranscribing}
        className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-zinc-950 hover:bg-zinc-850 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
        Save Transcript
      </button>
    </div>
  );
}
