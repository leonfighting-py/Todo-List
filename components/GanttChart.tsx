import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useStore } from '../store';
import { parseDate, diffInDays, getTodayString, addDays, formatDate } from '../utils';
import { TaskModal } from './TaskModal';
import { Circle, CheckCircle2 } from 'lucide-react';

export const GanttChart: React.FC = () => {
  const allTasks = useStore((state) => state.tasks);
  const updateTask = useStore((state) => state.updateTask);
  
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  // Drag Resize State
  const [resizeState, setResizeState] = useState<{
    taskId: string;
    startX: number;
    initialEndDate: string;
    currentEndDate: string;
  } | null>(null);

  const tasks = useMemo(() => {
    return allTasks.filter(t => t.status !== 'archived' && t.status !== 'completed');
  }, [allTasks]);
  
  // Configuration
  const ROW_HEIGHT = 40;
  const HEADER_HEIGHT = 40;
  const DAY_WIDTH = 50;
  const SIDEBAR_WIDTH = 200;

  // Calculate Date Range (Today - 2 to Today + 14)
  const { minDate, totalDays } = useMemo(() => {
    const today = parseDate(getTodayString());
    const start = addDays(today, -2);
    const end = addDays(today, 14);
    
    return { 
        minDate: start, 
        maxDate: end, 
        totalDays: diffInDays(end, start) + 1 
    };
  }, []);

  const getDateX = (dateStr: string) => {
    return diffInDays(parseDate(dateStr), minDate) * DAY_WIDTH;
  };

  const todayX = getDateX(getTodayString());

  // Drag Handlers
  const handleResizeStart = (e: React.MouseEvent, taskId: string, currentDate: string) => {
    e.stopPropagation(); // Prevent opening modal
    setResizeState({
      taskId,
      startX: e.clientX,
      initialEndDate: currentDate,
      currentEndDate: currentDate
    });
  };

  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (!resizeState) return;

    const deltaX = e.clientX - resizeState.startX;
    // Calculate how many days we moved (round to nearest integer)
    const deltaDays = Math.round(deltaX / DAY_WIDTH);
    
    if (deltaDays === 0) return;

    const newDateObj = addDays(parseDate(resizeState.initialEndDate), deltaDays);
    const newDateStr = formatDate(newDateObj);

    // Only update state if date actually changed
    if (newDateStr !== resizeState.currentEndDate) {
        setResizeState(prev => prev ? { ...prev, currentEndDate: newDateStr } : null);
    }
  }, [resizeState]);

  const handleGlobalMouseUp = useCallback(() => {
    if (resizeState) {
      // Commit the change
      updateTask(resizeState.taskId, { plannedEndDate: resizeState.currentEndDate });
      setResizeState(null);
    }
  }, [resizeState, updateTask]);

  // Attach/Detach global listeners
  useEffect(() => {
    if (resizeState) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    } else {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [resizeState, handleGlobalMouseMove, handleGlobalMouseUp]);

  const handleCompleteTask = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    updateTask(taskId, { status: 'completed', progress: 100 });
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex border-b border-border bg-surface z-10">
        <div style={{ width: SIDEBAR_WIDTH }} className="p-3 font-bold border-r border-border shrink-0 flex items-center">
          任务名称
        </div>
        <div className="overflow-hidden flex-1 relative" style={{ height: HEADER_HEIGHT }}>
             <div className="absolute inset-0 flex items-center">
               {Array.from({ length: totalDays }).map((_, i) => {
                 const d = addDays(minDate, i);
                 const isToday = formatDate(d) === getTodayString();
                 return (
                   <div 
                    key={i} 
                    className={`absolute border-r border-border/30 h-full flex flex-col justify-center items-center text-xs ${isToday ? 'bg-primary/10 text-primary font-bold' : 'text-muted'}`}
                    style={{ left: i * DAY_WIDTH, width: DAY_WIDTH }}
                   >
                     <span>{d.getDate()}</span>
                     <span className="text-[10px] opacity-60">{d.toLocaleDateString('zh-CN', { weekday: 'narrow' })}</span>
                   </div>
                 );
               })}
             </div>
        </div>
      </div>

      {/* Gantt Body */}
      <div className="flex-1 overflow-auto relative">
        <div className="flex relative" style={{ height: Math.max(tasks.length * ROW_HEIGHT, 100), minWidth: SIDEBAR_WIDTH + (totalDays * DAY_WIDTH) }}>
            
            {/* Task List Column */}
            <div className="sticky left-0 bg-surface border-r border-border z-10" style={{ width: SIDEBAR_WIDTH }}>
                {tasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="group/item border-b border-border/50 px-3 flex items-center text-sm text-text hover:bg-white/5 cursor-pointer transition-colors select-none" 
                      style={{ height: ROW_HEIGHT }}
                      onDoubleClick={() => setSelectedTaskId(task.id)}
                      title="双击编辑任务"
                    >
                        <button
                          onClick={(e) => handleCompleteTask(e, task.id)}
                          className="mr-2 text-muted hover:text-green-500 transition-colors"
                          title="完成任务"
                        >
                          <div className="w-4 h-4 rounded-full border border-muted hover:border-green-500 flex items-center justify-center">
                             <div className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-0 group-hover/item:opacity-50 hover:!opacity-100 transition-opacity" />
                          </div>
                        </button>
                        <span className="truncate">{task.title}</span>
                    </div>
                ))}
            </div>

            {/* Chart Area */}
            <div className={`relative flex-1 bg-background ${resizeState ? 'cursor-ew-resize' : ''}`}>
                {/* Grid Lines */}
                <div className="absolute inset-0 pointer-events-none">
                     {Array.from({ length: totalDays }).map((_, i) => (
                         <div key={i} className="absolute h-full border-r border-border/20" style={{ left: i * DAY_WIDTH, width: DAY_WIDTH }} />
                     ))}
                     {/* Today Line */}
                     <div className="absolute h-full border-l-2 border-primary/50 z-0" style={{ left: todayX }}></div>
                </div>

                {/* SVG Overlay for Bars */}
                <svg className="absolute inset-0 w-full h-full">
                    <defs>
                        <pattern id="stripe-pattern" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                            <rect width="2" height="4" transform="translate(0,0)" fill="#ef4444" fillOpacity="0.3"></rect>
                        </pattern>
                    </defs>
                    
                    {tasks.map((task, i) => {
                        // Determine end date: Use drag state if this is the active task, otherwise store value
                        const effectiveEndDate = (resizeState && resizeState.taskId === task.id) 
                            ? resizeState.currentEndDate 
                            : task.plannedEndDate;

                        const startX = getDateX(task.startDate);
                        const endX = getDateX(effectiveEndDate) + DAY_WIDTH;
                        
                        const width = Math.max(10, endX - startX); // Ensure minimum visibility
                        const y = i * ROW_HEIGHT + 10;
                        const height = ROW_HEIGHT - 20;

                        // Deadline Logic
                        const deadlineX = task.hardDeadline ? getDateX(task.hardDeadline) + DAY_WIDTH : null;
                        const isOverdue = deadlineX !== null && endX > deadlineX;
                        
                        // Normal Bar Width (up to deadline if overdue)
                        const normalBarWidth = isOverdue ? (deadlineX! - startX) : width;

                        return (
                            <g key={task.id} className="cursor-pointer group" onDoubleClick={() => setSelectedTaskId(task.id)}>
                                {/* Main Bar (Background Track) */}
                                <rect 
                                    x={startX} 
                                    y={y} 
                                    width={normalBarWidth} 
                                    height={height} 
                                    rx={4}
                                    className="fill-blue-100 dark:fill-blue-950 transition-colors"
                                />

                                {/* Overdue Extension */}
                                {isOverdue && (
                                    <rect 
                                        x={deadlineX} 
                                        y={y} 
                                        width={Math.max(0, endX - deadlineX!)} 
                                        height={height} 
                                        rx={4}
                                        fill="url(#stripe-pattern)"
                                        stroke="#ef4444"
                                        strokeWidth="1"
                                    />
                                )}

                                {/* Hard Deadline Marker */}
                                {deadlineX !== null && (
                                    <line 
                                        x1={deadlineX} 
                                        y1={y - 5} 
                                        x2={deadlineX} 
                                        y2={y + height + 5} 
                                        stroke="#ef4444" 
                                        strokeWidth="2" 
                                        strokeDasharray="4"
                                    />
                                )}

                                {/* Progress Indicator (Foreground Fill) */}
                                {/* Progress width is based on the TOTAL width (including overdue part if any) */}
                                <rect 
                                    x={startX} 
                                    y={y} 
                                    width={Math.max(0, width * (task.progress / 100))} 
                                    height={height} 
                                    rx={4}
                                    className="fill-blue-600 dark:fill-white transition-colors pointer-events-none"
                                />

                                {/* Drag Handle (Right Edge) */}
                                <rect
                                    x={endX - 10}
                                    y={y}
                                    width={15}
                                    height={height}
                                    rx={4}
                                    className="fill-transparent hover:fill-black/10 dark:hover:fill-white/10 cursor-ew-resize transition-colors"
                                    onMouseDown={(e) => handleResizeStart(e, task.id, effectiveEndDate)}
                                />
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
      </div>
      
      {selectedTaskId && (
        <TaskModal 
            taskId={selectedTaskId} 
            onClose={() => setSelectedTaskId(null)} 
        />
      )}
    </div>
  );
};