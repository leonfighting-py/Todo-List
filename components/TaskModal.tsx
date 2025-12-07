import React, { useState } from 'react';
import { Task, Subtask } from '../types';
import { useStore } from '../store';
import { Button } from './ui/Button';
import { X, Check, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { generateId } from '../utils';

interface TaskModalProps {
  taskId: string;
  onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ taskId, onClose }) => {
  // Select the specific task from the store to ensure we always have the latest version.
  const task = useStore((state) => state.tasks.find((t) => t.id === taskId));
  
  const updateTask = useStore((state) => state.updateTask);
  const deleteTask = useStore((state) => state.deleteTask);
  const toggleSubtask = useStore((state) => state.toggleSubtask);

  const [subtaskInput, setSubtaskInput] = useState('');

  // If task doesn't exist (e.g. deleted), close modal or return null
  if (!task) {
    return null;
  }

  const handleUpdate = (updates: Partial<Task>) => {
    updateTask(task.id, updates);
  };

  const addSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subtaskInput.trim()) return;

    const newSubtask: Subtask = {
      id: generateId(),
      text: subtaskInput.trim(),
      done: false
    };

    handleUpdate({ subtasks: [...task.subtasks, newSubtask] });
    setSubtaskInput('');
  };

  const handleDeleteSubtask = (subId: string) => {
    handleUpdate({ subtasks: task.subtasks.filter(s => s.id !== subId) });
  };

  const handleDeleteTask = () => {
    if (confirm('确定要删除此任务吗？')) {
      deleteTask(task.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-background">
          <input 
            value={task.title}
            onChange={(e) => handleUpdate({ title: e.target.value })}
            className="text-xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 text-text w-full"
            placeholder="任务标题"
          />
          <button onClick={onClose} className="text-muted hover:text-white">
            <X />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Dates Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-muted font-bold uppercase">开始日期</label>
              <div className="flex items-center gap-2 bg-background border border-border p-2 rounded">
                <Calendar size={16} className="text-muted" />
                <input 
                  type="date" 
                  value={task.startDate} 
                  onChange={(e) => handleUpdate({ startDate: e.target.value })}
                  className="bg-transparent border-none outline-none text-sm w-full"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs text-muted font-bold uppercase">计划结束</label>
              <div className="flex items-center gap-2 bg-background border border-border p-2 rounded">
                <Calendar size={16} className="text-muted" />
                <input 
                  type="date" 
                  value={task.plannedEndDate} 
                  onChange={(e) => handleUpdate({ plannedEndDate: e.target.value })}
                  className="bg-transparent border-none outline-none text-sm w-full"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-danger font-bold uppercase flex items-center gap-1">
                <AlertCircle size={12} /> deadline
              </label>
              <div className="flex items-center gap-2 bg-background border border-danger/30 p-2 rounded">
                <input 
                  type="date" 
                  value={task.hardDeadline || ''} 
                  onChange={(e) => handleUpdate({ hardDeadline: e.target.value || null })}
                  className="bg-transparent border-none outline-none text-sm w-full text-danger"
                />
              </div>
            </div>
          </div>

          {/* Progress Control */}
          <div className="bg-background/50 p-4 rounded-lg border border-border">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-sm">进度控制</span>
              <div className="flex items-center gap-2 text-sm">
                <span className={`text-xs ${!task.autoProgress ? 'text-primary' : 'text-muted'}`}>手动拖拽</span>
                <button 
                  onClick={() => handleUpdate({ autoProgress: !task.autoProgress })}
                  className={`w-10 h-5 rounded-full relative transition-colors ${task.autoProgress ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-600'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${task.autoProgress ? 'left-6' : 'left-1'}`} />
                </button>
                <span className={`text-xs ${task.autoProgress ? 'text-primary' : 'text-muted'}`}>自动计算</span>
              </div>
            </div>

            {task.autoProgress ? (
              <div className="h-4 bg-blue-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${task.progress}%` }} />
              </div>
            ) : (
              <div className="space-y-2">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={task.progress} 
                  onChange={(e) => handleUpdate({ progress: Number(e.target.value) })}
                  className="w-full accent-primary h-2 bg-blue-100 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-right text-xs text-muted">{task.progress}%</div>
              </div>
            )}
          </div>

          {/* Subtasks */}
          <div>
            <h3 className="text-sm font-bold uppercase text-muted mb-3">子任务 (Subtasks)</h3>
            <div className="space-y-2 mb-3">
              {task.subtasks.map(sub => (
                <div key={sub.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded group">
                  <button 
                    onClick={() => toggleSubtask(task.id, sub.id)}
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${sub.done ? 'bg-primary border-primary' : 'border-muted hover:border-primary'}`}
                  >
                    {sub.done && <Check size={14} className="text-white" />}
                  </button>
                  <span className={`flex-1 text-sm ${sub.done ? 'line-through text-muted' : ''}`}>{sub.text}</span>
                  <button onClick={() => handleDeleteSubtask(sub.id)} className="opacity-0 group-hover:opacity-100 text-muted hover:text-danger">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            
            <form onSubmit={addSubtask} className="flex gap-2">
              <input 
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                placeholder="添加步骤..."
                className="flex-1 bg-background border border-border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
              />
              <Button type="submit" size="sm" variant="secondary">添加</Button>
            </form>
          </div>

          {/* Description */}
          <div>
             <h3 className="text-sm font-bold uppercase text-muted mb-2">备注</h3>
             <textarea 
               value={task.description}
               onChange={(e) => handleUpdate({ description: e.target.value })}
               className="w-full h-24 bg-background border border-border rounded p-3 text-sm focus:ring-1 focus:ring-primary outline-none resize-none"
               placeholder="关于任务的详细信息..."
             />
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-background flex justify-between">
          <Button variant="danger" size="sm" onClick={handleDeleteTask}>删除任务</Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>关闭</Button>
          </div>
        </div>
      </div>
    </div>
  );
};