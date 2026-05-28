'use client';

import { useState, useEffect } from 'react';

interface TranscriptRecord {
  id: string;
  created_at: string;
  text: string;
  duration: number; // in seconds
}

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [records, setRecords] = useState<TranscriptRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch saved records from the database
  const fetchRecords = async (query: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const endpoint = query 
        ? `${apiUrl}/api/transcripts?q=${encodeURIComponent(query)}` 
        : `${apiUrl}/api/transcripts`;

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch data from the server');
      }

      const data = await response.json();
      setRecords(data);
    } catch (err) {
      console.error('Failed to load transcripts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch records whenever the search input changes
  useEffect(() => {
    fetchRecords(searchQuery);
  }, [searchQuery]);

  // Format seconds into HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  // Format SQLite timestamp into a cleaner date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString.replace(' ', 'T')); // Handle SQLite format safely
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transcript record?')) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/transcripts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete the transcript record.');
      }

      // Locally filter out the deleted record
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to delete transcript:', err);
      alert('Failed to delete transcript. Please check backend connection.');
    }
  };

  const handleViewDetails = (record: TranscriptRecord) => {
    alert(`[Date: ${formatDate(record.created_at)} | Duration: ${formatTime(record.duration)}]\n\n${record.text}`);
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
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-zinc-400 gap-3">
            <svg className="animate-spin h-6 w-6 text-zinc-550" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Loading transcripts...</span>
          </div>
        ) : records.length > 0 ? (
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
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white whitespace-nowrap">
                      {formatDate(record.created_at)}
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
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-650 hover:bg-red-550 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors"
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
            <span className="text-sm">No saved transcripts found in the database.</span>
          </div>
        )}
      </div>
    </div>
  );
}
