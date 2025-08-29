export interface TimeEntry {
  start: Date;
  end?: Date;
}

export interface LunchBreak {
  start: Date;
  end?: Date;
}

export interface WorkDay {
  id: string;
  date: Date;
  workTime: TimeEntry;
  lunchBreak?: LunchBreak;
  totalWorkHours: number;
  isComplete: boolean;
}

export interface WeeklyData {
  workDays: WorkDay[];
  totalWeeklyHours: number;
  totalVacationHours: number;
}