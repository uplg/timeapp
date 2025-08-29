import type { WorkDay } from '../types/WorkDay';

const STORAGE_KEY = 'timeapp-workdays';

interface StoredWorkDay {
  id: string;
  date: string;
  workTime: {
    start: string;
    end?: string;
  };
  lunchBreak?: {
    start: string;
    end?: string;
  };
  totalWorkHours: number;
  isComplete: boolean;
}

export const loadWorkDays = (): WorkDay[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed: StoredWorkDay[] = JSON.parse(stored);
    // Convert date strings back to Date objects
    return parsed.map((workDay: StoredWorkDay) => ({
      ...workDay,
      date: new Date(workDay.date),
      workTime: {
        start: new Date(workDay.workTime.start),
        end: workDay.workTime.end ? new Date(workDay.workTime.end) : undefined
      },
      lunchBreak: workDay.lunchBreak ? {
        start: new Date(workDay.lunchBreak.start),
        end: workDay.lunchBreak.end ? new Date(workDay.lunchBreak.end) : undefined
      } : undefined
    }));
  } catch (error) {
    console.error('Error loading work days:', error);
    return [];
  }
};

export const saveWorkDays = (workDays: WorkDay[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workDays));
  } catch (error) {
    console.error('Error saving work days:', error);
  }
};

export const clearWorkDays = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};