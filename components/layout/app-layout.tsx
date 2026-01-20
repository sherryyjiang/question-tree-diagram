'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { TranscriptList } from '../transcripts/transcript-list';
import { TranscriptViewer } from '../transcripts/transcript-viewer';
import { CanvasTree } from '../tree/canvas-tree';

type Tab = 'tree' | 'transcripts';

interface Transcript {
  filename: string;
  name: string;
}

export function AppLayout() {
  const [activeTab, setActiveTab] = useState<Tab>('tree');
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [selectedTranscript, setSelectedTranscript] = useState<string | null>(null);
  const [loadingTranscripts, setLoadingTranscripts] = useState(false);

  // Fetch transcripts when switching to transcripts tab
  useEffect(() => {
    if (activeTab === 'transcripts' && transcripts.length === 0) {
      setLoadingTranscripts(true);
      fetch('/api/transcripts')
        .then((res) => res.json())
        .then((data) => {
          setTranscripts(data.transcripts || []);
          setLoadingTranscripts(false);
        })
        .catch((err) => {
          console.error('Failed to load transcripts:', err);
          setLoadingTranscripts(false);
        });
    }
  }, [activeTab, transcripts.length]);

  return (
    <div className="flex h-screen bg-zinc-950">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'tree' ? (
          <CanvasTree />
        ) : (
          <>
            <div className="w-72 border-r border-zinc-800 flex-shrink-0">
              {loadingTranscripts ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-zinc-500">Loading transcripts...</div>
                </div>
              ) : (
                <TranscriptList
                  transcripts={transcripts}
                  selectedTranscript={selectedTranscript}
                  onSelectTranscript={setSelectedTranscript}
                />
              )}
            </div>
            <TranscriptViewer filename={selectedTranscript} />
          </>
        )}
      </div>
    </div>
  );
}
