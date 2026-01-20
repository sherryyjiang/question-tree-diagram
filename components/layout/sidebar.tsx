'use client';

import { useState } from 'react';
import { TreeDeciduous, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

type Tab = 'tree' | 'transcripts';

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const tabs = [
    { id: 'tree' as Tab, label: 'Question Tree', icon: TreeDeciduous },
    { id: 'transcripts' as Tab, label: 'Transcripts', icon: FileText },
  ];

  return (
    <div
      className={`relative flex flex-col border-r border-zinc-800 bg-zinc-950 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        {!collapsed && (
          <span className="text-sm font-semibold text-zinc-200">Navigation</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 p-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                isActive
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              <Icon size={20} />
              {!collapsed && (
                <span className="text-sm font-medium">{tab.label}</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
