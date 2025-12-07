import { Task } from '../types';

const STORAGE_KEY = 'flowlog-data-v1';

// This service abstracts the storage. 
// In a real Electron app, these methods would call window.electron.store.get/set
export const storageService = {
  saveTasks: (tasks: Task[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      // Electron implementation: window.electron.store.set('tasks', tasks);
    } catch (e) {
      console.error("Failed to save tasks", e);
    }
  },

  loadTasks: (): Task[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      // Electron implementation: const data = window.electron.store.get('tasks');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to load tasks", e);
      return [];
    }
  }
};