import React, { useState, useEffect } from "react";
import type { WorkDay } from "../types/WorkDay";
import { formatTime, isSameDay } from "../utils/dateUtils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Pause, Square, Coffee } from "lucide-react";

interface TimeTrackerProps {
  workDays: WorkDay[];
  onUpdateWorkDays: (workDays: WorkDay[]) => void;
  currentWeek: Date;
}

const TimeTracker: React.FC<TimeTrackerProps> = ({
  workDays,
  onUpdateWorkDays,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  const today = new Date();
  const todayWorkDay = workDays.find((day) => isSameDay(day.date, today));

  const isWorkStarted =
    todayWorkDay?.workTime.start && !todayWorkDay?.workTime.end;
  const isLunchStarted =
    todayWorkDay?.lunchBreak?.start && !todayWorkDay?.lunchBreak?.end;
  const isWorkCompleted = todayWorkDay?.isComplete;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const createOrUpdateWorkDay = (updates: Partial<WorkDay>): WorkDay => {
    const existingDay = todayWorkDay;

    if (existingDay) {
      return { ...existingDay, ...updates };
    }

    return {
      id: `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`,
      date: today,
      workTime: { start: new Date() },
      totalWorkHours: 0,
      isComplete: false,
      ...updates,
    };
  };

  const updateWorkDays = (updatedDay: WorkDay) => {
    const newWorkDays = workDays.filter((day) => !isSameDay(day.date, today));
    newWorkDays.push(updatedDay);
    onUpdateWorkDays(newWorkDays);
  };

  const startWorkDay = () => {
    const updatedDay = createOrUpdateWorkDay({
      workTime: { start: new Date() },
    });
    updateWorkDays(updatedDay);
  };

  const stopWorkDay = () => {
    if (!todayWorkDay) return;

    const workEnd = new Date();
    const workStart = todayWorkDay.workTime.start;
    const lunchBreak = todayWorkDay.lunchBreak;

    let totalWorkHours =
      (workEnd.getTime() - workStart.getTime()) / (1000 * 60 * 60);

    if (lunchBreak?.start && lunchBreak?.end) {
      const lunchDuration =
        (lunchBreak.end.getTime() - lunchBreak.start.getTime()) /
        (1000 * 60 * 60);
      totalWorkHours -= lunchDuration;
    }

    const updatedDay = createOrUpdateWorkDay({
      workTime: { ...todayWorkDay.workTime, end: workEnd },
      totalWorkHours: Math.round(totalWorkHours * 100) / 100,
      isComplete: true,
    });

    updateWorkDays(updatedDay);
  };

  const startLunch = () => {
    if (!todayWorkDay) return;

    const updatedDay = createOrUpdateWorkDay({
      lunchBreak: { start: new Date() },
    });

    updateWorkDays(updatedDay);
  };

  const endLunch = () => {
    if (!todayWorkDay?.lunchBreak) return;

    const updatedDay = createOrUpdateWorkDay({
      lunchBreak: {
        ...todayWorkDay.lunchBreak,
        end: new Date(),
      },
    });

    updateWorkDays(updatedDay);
  };

  const getCurrentStatus = () => {
    if (isWorkCompleted) return "Journée terminée";
    if (isLunchStarted) return "En pause déjeuner";
    if (isWorkStarted) return "En cours de travail";
    return "Journée non commencée";
  };

  const getWorkDuration = () => {
    if (!todayWorkDay?.workTime.start) return "0h00";

    const start = todayWorkDay.workTime.start;
    const end = todayWorkDay.workTime.end || currentTime;
    let duration = (end.getTime() - start.getTime()) / (1000 * 60);

    if (todayWorkDay.lunchBreak?.start) {
      const lunchStart = todayWorkDay.lunchBreak.start;
      const lunchEnd =
        todayWorkDay.lunchBreak.end ||
        (isLunchStarted ? currentTime : lunchStart);
      const lunchDuration =
        (lunchEnd.getTime() - lunchStart.getTime()) / (1000 * 60);
      duration -= lunchDuration;
    }

    const hours = Math.floor(duration / 60);
    const minutes = Math.floor(duration % 60);
    return `${hours}h${minutes.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Aujourd'hui -{" "}
          {today.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </CardTitle>
        <CardDescription>
          Gérez votre temps de travail quotidien
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Statut</p>
            <Badge
              variant={
                isWorkCompleted
                  ? "default"
                  : isWorkStarted
                  ? "secondary"
                  : "outline"
              }
              className="mt-1"
            >
              {getCurrentStatus()}
            </Badge>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Temps de travail</p>
            <p className="text-lg font-semibold">{getWorkDuration()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Heure actuelle</p>
            <p className="text-lg font-semibold">{formatTime(currentTime)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            onClick={startWorkDay}
            disabled={isWorkStarted || isWorkCompleted}
            className="flex items-center gap-2"
            variant="default"
          >
            <Play className="h-4 w-4" />
            Démarrer
          </Button>

          <Button
            onClick={startLunch}
            disabled={!isWorkStarted || isLunchStarted || isWorkCompleted}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Coffee className="h-4 w-4" />
            Pause
          </Button>

          <Button
            onClick={endLunch}
            disabled={!isLunchStarted}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Pause className="h-4 w-4" />
            Fin pause
          </Button>

          <Button
            onClick={stopWorkDay}
            disabled={!isWorkStarted || isLunchStarted || isWorkCompleted}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Square className="h-4 w-4" />
            Terminer
          </Button>
        </div>

        {todayWorkDay && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Résumé de la journée</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {todayWorkDay.workTime.start && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Début:</span>
                  <span className="font-medium">
                    {formatTime(todayWorkDay.workTime.start)}
                  </span>
                </div>
              )}
              {todayWorkDay.workTime.end && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fin:</span>
                  <span className="font-medium">
                    {formatTime(todayWorkDay.workTime.end)}
                  </span>
                </div>
              )}
              {todayWorkDay.lunchBreak?.start && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pause déjeuner:</span>
                  <span className="font-medium">
                    {formatTime(todayWorkDay.lunchBreak.start)} -{" "}
                    {todayWorkDay.lunchBreak.end
                      ? formatTime(todayWorkDay.lunchBreak.end)
                      : "En cours"}
                  </span>
                </div>
              )}
              {todayWorkDay.isComplete && (
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-primary">
                    {todayWorkDay.totalWorkHours}h
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeTracker;
