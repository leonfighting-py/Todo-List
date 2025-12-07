import React, { useState } from 'react';
import { useStore } from '../store';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { Task } from '../types';
import { Plus, Archive, CheckCircle2, History, ListTodo, Calendar } from 'lucide-react';
import { getTodayString } from '../utils';

export const Dashboard: React.FC = () => {
  // Use selectors for performance
  const tasks = useStore((state) => state.tasks);
  const addTask = useStore((state) => state.addTask);
  const updateTask = useStore((state) => state.updateTask);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  
  // We store ID instead of the object to prevent stale data issues
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const today = getTodayString();

  // Filters
  const todoListTasks = tasks.filter(t => t.status === 'ongoing'); // Was 'Active'
  const todoTasks = tasks.filter(t => t.status === 'inbox'); // Was 'Inbox'
  const historyTasks = tasks.filter(t => t.status === 'completed'); // New History

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      // Pass deadline if set, otherwise undefined (store handles default to today)
      addTask(newTaskTitle.trim(), newTaskDeadline || undefined);
      setNewTaskTitle('');
      setNewTaskDeadline('');
    }
  };

  const promoteToTodoList = (task: Task) => {
    updateTask(task.id, { 
      status: 'ongoing',
      startDate: today 
    });
  };

  const restoreTask = (task: Task) => {
    updateTask(task.id, { status: 'ongoing' });
  };

  return (
    <div className="flex flex-col h-full bg-background text-text">
      
      {/* SECTION 1: TODO (Formerly Inbox) - 30% */}
      <div className="h-[30%] bg-surface/30 p-4 flex flex-col border-b border-border">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-3 text-muted">
          <ListTodo size={20} />
          待办事项 (Todo)
        </h2>

        {/* Input Form */}
        <form onSubmit={handleAddTask} className="mb-4 flex gap-2">
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="准备做点什么？"
              className="flex-1 bg-background border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            <div className="relative">
              <input
                type="date"
                value={newTaskDeadline}
                onChange={(e) => setNewTaskDeadline(e.target.value)}
                className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary h-full w-36"
                title="截止日期 (默认今天)"
              />
              {!newTaskDeadline && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-muted bg-background m-px rounded px-2 text-xs">
                  <Calendar size={12} className="mr-1" /> 今天
                </div>
              )}
            </div>
          </div>
          <button 
            type="submit"
            className="bg-primary hover:bg-blue-600 text-white rounded-md px-4 py-2 flex items-center"
          >
            <Plus size={18} />
          </button>
        </form>

        {/* List */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-2">
          {todoTasks.map(task => (
            <div key={task.id} className="group flex items-center justify-between p-2.5 bg-background border border-border rounded-md hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="truncate font-medium text-sm">{task.title}</span>
                <span className="text-[10px] text-muted border border-border px-1.5 rounded">
                   截止: {task.plannedEndDate}
                </span>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setSelectedTaskId(task.id)}
                  className="text-xs text-muted hover:text-white px-2 py-1"
                >
                  编辑
                </button>
                <button 
                  onClick={() => promoteToTodoList(task)}
                  className="text-xs bg-primary/20 text-primary hover:bg-primary/30 px-3 py-1 rounded font-medium"
                >
                  开始
                </button>
              </div>
            </div>
          ))}
          {todoTasks.length === 0 && (
            <div className="text-center text-muted text-xs py-4 border border-dashed border-border rounded">暂无待办事项</div>
          )}
        </div>
      </div>

      {/* SECTION 2: TODOLIST (Formerly Active) - 50% */}
      <div className="h-[50%] p-4 overflow-y-auto border-b border-border bg-background">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="text-primary" size={24} /> 
            进行中 (Doing)
          </h2>
          <span className="text-muted text-sm bg-surface px-2 py-1 rounded">{todoListTasks.length} 个任务</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
          {todoListTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onClick={() => setSelectedTaskId(task.id)} 
            />
          ))}
          {todoListTasks.length === 0 && (
             <div className="col-span-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg text-muted">
               <p>没有进行中的任务</p>
               <p className="text-sm">从上方的待办事项中开始一个任务吧</p>
             </div>
          )}
        </div>
      </div>

      {/* SECTION 3: HISTORY - 20% */}
      <div className="h-[20%] bg-surface/20 p-4 flex flex-col">
         <h2 className="text-sm font-bold flex items-center gap-2 mb-2 text-muted uppercase tracking-wider">
          <History size={16} />
          历史记录 (History)
        </h2>
        <div className="flex-1 overflow-y-auto space-y-1 pr-2">
          {historyTasks.map(task => (
             <div key={task.id} className="flex items-center justify-between p-2 rounded hover:bg-surface/50 text-muted hover:text-text transition-colors text-sm">
                <div className="flex items-center gap-2">
                   <CheckCircle2 size={14} className="text-primary" />
                   <span className="line-through opacity-70">{task.title}</span>
                </div>
                <button 
                  onClick={() => restoreTask(task)}
                  className="text-[10px] hover:underline opacity-50 hover:opacity-100"
                >
                  恢复
                </button>
             </div>
          ))}
          {historyTasks.length === 0 && (
            <div className="text-xs text-muted opacity-50 italic">暂无历史记录</div>
          )}
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