import React from 'react';
import { useStore } from '../store';
import { X, Moon, Sun } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const theme = useStore((state) => state.theme);
  const setTheme = useStore((state) => state.setTheme);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border w-full max-w-md rounded-lg shadow-2xl overflow-hidden flex flex-col text-text">
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-background">
          <h2 className="text-lg font-bold">设置 (Settings)</h2>
          <button onClick={onClose} className="text-muted hover:text-text">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold uppercase text-muted mb-3">外观 (Appearance)</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${theme === 'light' ? 'border-primary bg-primary/10' : 'border-border hover:bg-background'}`}
              >
                <Sun size={32} className={`mb-2 ${theme === 'light' ? 'text-primary' : 'text-muted'}`} />
                <span className="text-sm font-medium">浅色模式</span>
              </button>

              <button 
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${theme === 'dark' ? 'border-primary bg-primary/10' : 'border-border hover:bg-background'}`}
              >
                <Moon size={32} className={`mb-2 ${theme === 'dark' ? 'text-primary' : 'text-muted'}`} />
                <span className="text-sm font-medium">深色模式</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-background border-t border-border text-center text-xs text-muted">
           FlowLog v1.0.0
        </div>
      </div>
    </div>
  );
};