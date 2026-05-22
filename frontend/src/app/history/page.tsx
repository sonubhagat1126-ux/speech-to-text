'use client';

import { useState } from 'react';

interface TranscriptRecord {
  id: string;
  date: string;
  text: string;
  duration: number; // in seconds
}

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [records, setRecords] = useState<TranscriptRecord[]>([
    {
      id: '1',
      date: '2026-05-21',
      duration: 105,
      text: 'EchoScribe scaffolding is officially completed. The frontend is built on Next.js with Tailwind CSS, and the backend is configured using Flask and a Python virtual environment. Day 1 milestones were successfully committed.',
    },
    {
      id: '2',
      date: '2026-05-20',
      duration: 48,
      text: 'This is a test transcript summarizing the wireframe specifications of our application dashboard. The layout consists of a navigation bar, a recording visualizer timer panel, and a dedicated transcription log output.',
    },
    {
      id: '3',
      date: '2026-05-19',
      duration: 15,
      text: 'Hello world, testing the microphone audio levels and sensitivity metrics. Everything is operational.',
    },
  ]);

  // Format seconds into HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  // Filter records based on search query
  const filteredRecords = records.filter(record => 
    record.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.date.includes(searchQuery)
  );

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this transcript?')) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleViewDetails = (record: TranscriptRecord) => {
    alert(`[Date: ${record.date} | Duration: ${formatTime(record.duration)}]\n\n${record.text}`);
  };

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
          Transcript Archive
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          Manage and search through all of your saved transcriptions.
        </p>
      </div>

      {/* Search Filter */}
      <div className="relative w-full max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Filter transcripts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm border border-zinc-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-zinc-800 dark:border-zinc-850 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-400"
        />
      </div>

      {/* Archive Grid/List */}
      <div className="bg-white border border-zinc-150 rounded-2xl shadow-sm overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
        {filteredRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-zinc-500 dark:text-zinc-400">
              <thead className="bg-zinc-50 text-xs font-semibold uppercase text-zinc-700 dark:bg-zinc-850 dark:text-zinc-300">
                <tr>
                  <th scope="col" className="px-6 py-4">Date</th>
                  <th scope="col" className="px-6 py-4">Duration</th>
                  <th scope="col" className="px-6 py-4">Transcript Preview</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 border-t border-zinc-100 dark:border-zinc-850 font-sans">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white whitespace-nowrap">
                      {record.date}
                    </td>
                    <td className="px-6 py-4 font-mono text-zinc-550 dark:text-zinc-350">
                      {formatTime(record.duration)}
                    </td>
                    <td className="px-6 py-4 max-w-sm truncate text-zinc-600 dark:text-zinc-300">
                      {record.text}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(record)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-750 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-650 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-zinc-400 dark:text-zinc-500">
            <svg className="h-10 w-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm">No archive matching your search criteria.</span>
          </div>
        )}
      </div>
    </div>
  );
}
