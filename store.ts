import { create } from 'zustand';
import { Task, TaskStatus, Subtask } from './types';
import { storageService } from './services/storageService';
import { generateId, getTodayString } from './utils';

export type Theme = 'light' | 'dark';

interface StoreState {
  tasks: Task[];
  viewMode: 'dashboard' | 'gantt';
  theme: Theme;
  setViewMode: (mode: 'dashboard' | 'gantt') => void;
  setTheme: (theme: Theme) => void;
  addTask: (title: string, deadline?: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  loadFromStorage: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  tasks: [],
  viewMode: 'dashboard',
  theme: (localStorage.getItem('theme') as Theme) || 'dark',
  
  setViewMode: (mode) => set({ viewMode: mode }),

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },

  loadFromStorage: () => {
    const tasks = storageService.loadTasks();
    const storedTheme = localStorage.getItem('theme') as Theme;
    set({ 
      tasks,
      theme: storedTheme || 'dark'
    });
  },

  addTask: (title: string, deadline?: string) => {
    const today = getTodayString();
    // Default to today if no deadline provided
    const plannedEnd = deadline || today;
    
    const newTask: Task = {
      id: generateId(),
      title,
      description: '',
      status: 'inbox',
      progress: 0,
      startDate: today,
      plannedEndDate: plannedEnd, 
      hardDeadline: null,
      subtasks: [],
      autoProgress: false,
      createdAt: Date.now(),
    };
    
    set((state) => {
      const newTasks = [...state.tasks, newTask];
      storageService.saveTasks(newTasks);
      return { tasks: newTasks };
    });
  },

  updateTask: (id, updates) => {
    set((state) => {
      const newTasks = state.tasks.map((t) => {
        if (t.id !== id) return t;

        const updatedTask = { ...t, ...updates };

        // Recalculate progress if autoProgress is enabled OR if subtasks changed while enabled
        if (updatedTask.autoProgress) {
          const total = updatedTask.subtasks.length;
          const completed = updatedTask.subtasks.filter(s => s.done).length;
          updatedTask.progress = total === 0 ? 0 : Math.round((completed / total) * 100);
        }

        // Auto-complete check: If progress hits 100%, move to completed history
        if (updatedTask.progress === 100 && updatedTask.status !== 'completed' && updatedTask.status !== 'archived') {
            updatedTask.status = 'completed';
        }

        return updatedTask;
      });
      storageService.saveTasks(newTasks);
      return { tasks: newTasks };
    });
  },

  deleteTask: (id) => {
    set((state) => {
      const newTasks = state.tasks.filter((t) => t.id !== id);
      storageService.saveTasks(newTasks);
      return { tasks: newTasks };
    });
  },

  toggleSubtask: (taskId, subtaskId) => {
    const state = get();
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    const newSubtasks = task.subtasks.map(s => 
      s.id === subtaskId ? { ...s, done: !s.done } : s
    );

    // This will trigger the autoProgress calculation in updateTask logic
    get().updateTask(taskId, { subtasks: newSubtasks });
  }
}));