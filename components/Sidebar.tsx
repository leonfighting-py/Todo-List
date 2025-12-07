
import React, { useState } from 'react';
import { useStore } from '../store';
import { LayoutDashboard, GanttChartSquare, Settings } from 'lucide-react';
import { SettingsModal } from './SettingsModal';

export const Sidebar: React.FC = () => {
  const viewMode = useStore((state) => state.viewMode);
  const setViewMode = useStore((state) => state.setViewMode);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const navItemClass = (active: boolean) => 
    `p-3 rounded-xl transition-all duration-200 flex flex-col items-center justify-center gap-1 text-[10px] font-medium ${active ? 'bg-primary text-white shadow-lg shadow-blue-900/20' : 'text-muted hover:bg-surface hover:text-text'}`;

  return (
    <>
      <div className="w-20 bg-background border-r border-border flex flex-col items-center py-6 gap-6 z-20">
        {/* Custom Moon Logo */}
        <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 cursor-default transition-transform hover:scale-105">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible shadow-lg shadow-blue-400/30 rounded-lg">
             {/* Light Blue Gradient Background */}
             <rect width="40" height="40" rx="10" fill="url(#moon-gradient)" />
             
             {/* Aesthetic Moon & Star Icon */}
             <g transform="translate(6, 6)">
                {/* Crescent Moon */}
                <path 
                  d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" 
                  fill="white" 
                />
                {/* Sparkle Star */}
                <path 
                  d="M24 2L24.7 3.5L26.2 4.2L24.7 4.9L24 6.4L23.3 4.9L21.8 4.2L23.3 3.5L24 2Z" 
                  fill="white" 
                  fillOpacity="0.9" 
                />
             </g>

             <defs>
               <linearGradient id="moon-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                 <stop stopColor="#7dd3fc" /> {/* Sky 300 - Light Blue */}
                 <stop offset="1" stopColor="#3b82f6" /> {/* Blue 500 */}
               </linearGradient>
             </defs>
          </svg>
        </div>

        <nav className="flex flex-col gap-3 w-full px-2">
          <button 
            onClick={() => setViewMode('dashboard')}
            className={navItemClass(viewMode === 'dashboard')}
          >
            <LayoutDashboard size={24} />
            <span>Todo</span>
          </button>

          <button 
            onClick={() => setViewMode('gantt')}
            className={navItemClass(viewMode === 'gantt')}
          >
            <GanttChartSquare size={24} />
            <span>日历</span>
          </button>
        </nav>

        <div className="mt-auto">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className={navItemClass(false)}
          >
            <Settings size={20} />
          </button>
        </div>
      </div>
      
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </>
  );
};
