import React, { useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { GanttChart } from './components/GanttChart';
import { useStore } from './store';

const App: React.FC = () => {
  // Use selectors to subscribe only to necessary state changes.
  const viewMode = useStore((state) => state.viewMode);
  const loadFromStorage = useStore((state) => state.loadFromStorage);
  const theme = useStore((state) => state.theme);

  useEffect(() => {
    // Empty dependency array ensures this only runs once on mount.
    // This prevents potential infinite loops if loadFromStorage identity were to change.
    loadFromStorage();
  }, []);

  // Handle Theme Switching
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-text selection:bg-primary/30">
      <Sidebar />
      <main className="flex-1 h-full overflow-hidden relative">
        {viewMode === 'dashboard' ? <Dashboard /> : <GanttChart />}
      </main>
    </div>
  );
};

export default App;