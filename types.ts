export type TaskStatus = 'inbox' | 'ongoing' | 'completed' | 'archived';

export interface Subtask {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  progress: number; // 0-100
  startDate: string; // YYYY-MM-DD
  plannedEndDate: string; // YYYY-MM-DD
  hardDeadline: string | null; // YYYY-MM-DD
  subtasks: Subtask[];
  autoProgress: boolean; // If true, progress is calculated from subtasks
  createdAt: number;
}

export type ViewMode = 'dashboard' | 'gantt';

export const DATE_FORMAT = 'yyyy-MM-dd';
