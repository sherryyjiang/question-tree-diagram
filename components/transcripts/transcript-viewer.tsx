'use client';

import { useState, useEffect } from 'react';
import { FileText, Loader2, User, Clock } from 'lucide-react';

interface TranscriptViewerProps {
  filename: string | null;
}

interface ParsedMessage {
  speaker: string;
  timestamp: string;
  content: string;
}

function parseTranscript(content: string): ParsedMessage[] {
  const lines = content.split('\n');
  const messages: ParsedMessage[] = [];
  let currentMessage: Partial<ParsedMessage> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines at the start of a message
    if (!line && !currentMessage?.content) continue;

    // Check for timestamp pattern (00:00 format)
    const timestampMatch = line.match(/^(\d{2}:\d{2})$/);
    if (timestampMatch) {
      // If we have a pending message with content, save it
      if (currentMessage?.speaker && currentMessage?.content) {
        messages.push(currentMessage as ParsedMessage);
      }

      // Start building a new message
      // Look backwards for the speaker name (usually 2 lines before timestamp)
      const speakerLine = lines[i - 1]?.trim();

      currentMessage = {
        speaker: speakerLine || 'Unknown',
        timestamp: timestampMatch[1],
        content: '',
      };
      continue;
    }

    // Skip single-letter lines (speaker initials like "S" or "A")
    if (line.length === 1 && /[A-Z]/.test(line)) continue;

    // Skip lines that look like speaker names if we're right after timestamp
    if (currentMessage && !currentMessage.content && lines[i - 1]?.match(/^\d{2}:\d{2}$/)) {
      continue;
    }

    // Add content to current message
    if (currentMessage) {
      if (currentMessage.content) {
        currentMessage.content += ' ' + line;
      } else {
        currentMessage.content = line;
      }
    }
  }

  // Don't forget the last message
  if (currentMessage?.speaker && currentMessage?.content) {
    messages.push(currentMessage as ParsedMessage);
  }

  return messages;
}

function getSpeakerColor(speaker: string): string {
  // Generate a consistent color based on speaker name
  const colors = [
    'text-blue-400',
    'text-emerald-400',
    'text-amber-400',
    'text-purple-400',
    'text-pink-400',
    'text-cyan-400',
  ];

  let hash = 0;
  for (let i = 0; i < speaker.length; i++) {
    hash = speaker.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

export function TranscriptViewer({ filename }: TranscriptViewerProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!filename) {
      setContent(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/transcripts/${encodeURIComponent(filename)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load transcript');
        return res.text();
      })
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [filename]);

  if (!filename) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950">
        <div className="text-center text-zinc-500">
          <FileText className="mx-auto mb-3" size={48} />
          <p className="text-lg">Select a transcript to view</p>
          <p className="text-sm mt-1">Choose from the list on the left</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950">
        <Loader2 className="animate-spin text-zinc-500" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950">
        <div className="text-center text-red-400">
          <p className="text-lg">Error loading transcript</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const messages = content ? parseTranscript(content) : [];

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-100">
          {filename.replace('.md', '').split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
        </h2>
        <p className="text-sm text-zinc-500 mt-1">
          {messages.length} message{messages.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const speakerColor = getSpeakerColor(message.speaker);
          const isSherry = message.speaker.toLowerCase().includes('sherry');

          return (
            <div
              key={index}
              className={`flex gap-3 ${isSherry ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  isSherry ? 'bg-blue-600/20' : 'bg-zinc-800'
                }`}
              >
                <User size={16} className={isSherry ? 'text-blue-400' : 'text-zinc-400'} />
              </div>

              <div className={`flex-1 max-w-[80%] ${isSherry ? 'text-right' : ''}`}>
                <div className={`flex items-center gap-2 mb-1 ${isSherry ? 'justify-end' : ''}`}>
                  <span className={`text-sm font-medium ${speakerColor}`}>
                    {message.speaker}
                  </span>
                  <span className="text-xs text-zinc-600 flex items-center gap-1">
                    <Clock size={10} />
                    {message.timestamp}
                  </span>
                </div>

                <div
                  className={`inline-block px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isSherry
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : 'bg-zinc-800 text-zinc-200 rounded-tl-sm'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
