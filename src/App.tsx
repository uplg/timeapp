import React, { useState, useEffect } from "react";
import TimeTracker from "./components/TimeTracker";
import WeeklyReport from "./components/WeeklyReport";
import type { WorkDay } from "./types/WorkDay";
import { loadWorkDays, saveWorkDays } from "./utils/storage";

function App() {
  const [workDays, setWorkDays] = useState<WorkDay[]>([]);
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());

  useEffect(() => {
    const savedWorkDays = loadWorkDays();
    setWorkDays(savedWorkDays);
  }, []);

  const updateWorkDays = (newWorkDays: WorkDay[]) => {
    setWorkDays(newWorkDays);
    saveWorkDays(newWorkDays);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TimeTracker
            workDays={workDays}
            onUpdateWorkDays={updateWorkDays}
            currentWeek={currentWeek}
          />

          <WeeklyReport
            workDays={workDays}
            currentWeek={currentWeek}
            onWeekChange={setCurrentWeek}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
