'use client';

import { useState, useMemo } from 'react';
import { User, Calendar, ChevronDown, ChevronRight, FileText, Search } from 'lucide-react';

interface Transcript {
  filename: string;
  name: string;
  date?: string;
}

interface TranscriptListProps {
  transcripts: Transcript[];
  selectedTranscript: string | null;
  onSelectTranscript: (filename: string) => void;
}

// Helper to extract user name and date from filename
function parseTranscriptFilename(filename: string): { name: string; date?: string } {
  // Remove .md extension
  const baseName = filename.replace('.md', '');

  // Check for date patterns like _jan_9, _dec_30, etc.
  const datePattern = /_(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)_(\d+)$/i;
  const match = baseName.match(datePattern);

  if (match) {
    const namePart = baseName.replace(datePattern, '');
    const month = match[1];
    const day = match[2];
    return {
      name: formatName(namePart),
      date: `${capitalize(month)} ${day}`,
    };
  }

  return { name: formatName(baseName) };
}

function formatName(name: string): string {
  return name
    .split('_')
    .map(capitalize)
    .join(' ');
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Group transcripts by user
function groupByUser(transcripts: Transcript[]): Map<string, Transcript[]> {
  const groups = new Map<string, Transcript[]>();

  for (const transcript of transcripts) {
    const existing = groups.get(transcript.name) || [];
    existing.push(transcript);
    groups.set(transcript.name, existing);
  }

  // Sort each group by date if available
  groups.forEach((items) => {
    items.sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date.localeCompare(b.date);
    });
  });

  return groups;
}

export function TranscriptList({ transcripts, selectedTranscript, onSelectTranscript }: TranscriptListProps) {
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const parsedTranscripts = useMemo(() => {
    return transcripts.map((t) => ({
      ...t,
      ...parseTranscriptFilename(t.filename),
    }));
  }, [transcripts]);

  const filteredTranscripts = useMemo(() => {
    if (!searchQuery) return parsedTranscripts;
    const query = searchQuery.toLowerCase();
    return parsedTranscripts.filter(
      (t) => t.name.toLowerCase().includes(query) || t.date?.toLowerCase().includes(query)
    );
  }, [parsedTranscripts, searchQuery]);

  const groupedTranscripts = useMemo(() => {
    return groupByUser(filteredTranscripts);
  }, [filteredTranscripts]);

  const toggleUser = (userName: string) => {
    setExpandedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userName)) {
        next.delete(userName);
      } else {
        next.add(userName);
      }
      return next;
    });
  };

  const sortedUserNames = useMemo(() => {
    return Array.from(groupedTranscripts.keys()).sort();
  }, [groupedTranscripts]);

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-100 mb-3">Transcripts</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {sortedUserNames.length === 0 ? (
          <div className="text-center text-zinc-500 py-8">
            <FileText className="mx-auto mb-2" size={24} />
            <p className="text-sm">No transcripts found</p>
          </div>
        ) : (
          sortedUserNames.map((userName) => {
            const userTranscripts = groupedTranscripts.get(userName) || [];
            const isExpanded = expandedUsers.has(userName);
            const hasMultiple = userTranscripts.length > 1;

            if (!hasMultiple) {
              // Single transcript - show directly
              const transcript = userTranscripts[0];
              const isSelected = selectedTranscript === transcript.filename;

              return (
                <button
                  key={transcript.filename}
                  onClick={() => onSelectTranscript(transcript.filename)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-left transition-colors ${
                    isSelected
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                      : 'text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  <User size={18} className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{userName}</div>
                    {transcript.date && (
                      <div className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                        <Calendar size={12} />
                        {transcript.date}
                      </div>
                    )}
                  </div>
                </button>
              );
            }

            // Multiple transcripts - show expandable group
            return (
              <div key={userName} className="mb-1">
                <button
                  onClick={() => toggleUser(userName)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-zinc-300 hover:bg-zinc-900 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown size={18} className="flex-shrink-0" />
                  ) : (
                    <ChevronRight size={18} className="flex-shrink-0" />
                  )}
                  <User size={18} className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{userName}</div>
                    <div className="text-xs text-zinc-500">
                      {userTranscripts.length} sessions
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="ml-6 pl-3 border-l border-zinc-800">
                    {userTranscripts.map((transcript) => {
                      const isSelected = selectedTranscript === transcript.filename;

                      return (
                        <button
                          key={transcript.filename}
                          onClick={() => onSelectTranscript(transcript.filename)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg mb-1 text-left transition-colors ${
                            isSelected
                              ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                              : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-300'
                          }`}
                        >
                          <Calendar size={14} className="flex-shrink-0" />
                          <span className="text-sm">{transcript.date || 'No date'}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 border-t border-zinc-800">
        <div className="text-xs text-zinc-500 text-center">
          {parsedTranscripts.length} transcript{parsedTranscripts.length !== 1 ? 's' : ''} from{' '}
          {groupedTranscripts.size} user{groupedTranscripts.size !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
