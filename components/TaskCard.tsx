import React, { useRef, useState, useCallback } from 'react';
import { Task } from '../types';
import { useStore } from '../store';
import { MoreHorizontal, Check } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const updateTask = useStore((state) => state.updateTask);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Use local state for drag to avoid committing store updates on every pixel.
  // This allows the user to drag to 100% and back to 90% without instantly completing the task.
  const [localProgress, setLocalProgress] = useState<number | null>(null);
  const dragProgressRef = useRef<number | null>(null); // Sync ref for event handlers

  const isDragging = localProgress !== null;

  // Handle Progress Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (task.autoProgress) return; // Disable drag if auto-calc is on
    
    // Prevent dragging if clicking specific controls
    if ((e.target as HTMLElement).closest('.no-drag')) return;

    // Calculate initial click position
    if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        let newProgress = Math.round((x / width) * 100);
        newProgress = Math.max(0, Math.min(100, newProgress));
        
        setLocalProgress(newProgress);
        dragProgressRef.current = newProgress;
    }
    
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
  };

  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    let newProgress = Math.round((x / width) * 100);
    newProgress = Math.max(0, Math.min(100, newProgress));
    
    setLocalProgress(newProgress);
    dragProgressRef.current = newProgress;
  }, []);

  const handleGlobalMouseUp = useCallback(() => {
    // Commit the final value to the store
    if (dragProgressRef.current !== null) {
      updateTask(task.id, { progress: dragProgressRef.current });
    }

    // Reset local state
    setLocalProgress(null);
    dragProgressRef.current = null;
    
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [updateTask, task.id, handleGlobalMouseMove]);

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateTask(task.id, { status: 'completed', progress: 100 });
  };

  const currentProgress = isDragging && localProgress !== null ? localProgress : task.progress;

  return (
    <div 
      ref={cardRef}
      className={`
        relative group h-24 w-full rounded-lg border border-border bg-surface overflow-hidden select-none transition-shadow hover:shadow-lg
        ${!task.autoProgress ? 'cursor-col-resize' : 'cursor-pointer'}
      `}
      onMouseDown={handleMouseDown}
      onDoubleClick={onClick}
    >
      {/* Progress Background */}
      {/* Light: Blue-200. Dark: White with 30% opacity to ensure text readability on top */}
      <div 
        className={`absolute top-0 left-0 h-full bg-blue-200 dark:bg-white/30 pointer-events-none ${isDragging ? 'transition-none' : 'transition-[width] duration-75 ease-linear'}`}
        style={{ width: `${currentProgress}%` }}
      />
      
      {/* Content Layer */}
      <div className="relative z-10 h-full p-4 flex flex-col justify-between pointer-events-none">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg text-text truncate pr-2">{task.title}</h3>
          
          <div className="no-drag pointer-events-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={handleComplete}
              className="p-1 hover:bg-green-500/20 text-muted hover:text-green-500 rounded transition-colors"
              title="标记完成"
            >
              <Check size={18} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onClick(); }}
              className="p-1 hover:bg-white/10 rounded"
            >
              <MoreHorizontal size={16} className="text-muted" />
            </button>
          </div>
        </div>

        <div className="flex justify-between items-end text-xs text-muted font-mono">
          <div className="flex items-center gap-1">
             {task.hardDeadline && <span className="text-danger">截止: {task.hardDeadline}</span>}
             {!task.hardDeadline && <span>结束: {task.plannedEndDate}</span>}
          </div>
          <div className="bg-background/50 px-2 py-1 rounded backdrop-blur-sm">
            {currentProgress}%
          </div>
        </div>
      </div>

      {/* Drag Hint (Visual only) */}
      {!task.autoProgress && isDragging && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-white/50 text-xs font-bold bg-black/40 px-2 py-1 rounded">
            {currentProgress === 100 ? '释放以完成任务' : '拖动更新进度'}
          </span>
        </div>
      )}
    </div>
  );
};