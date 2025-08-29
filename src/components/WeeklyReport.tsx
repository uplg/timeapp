import React, { useState } from "react";
import type { WorkDay } from "../types/WorkDay";
import {
  getWeekDays,
  getDayName,
  getMonthName,
  formatTime,
} from "../utils/dateUtils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Calendar, Mail, Copy } from "lucide-react";

interface WeeklyReportProps {
  workDays: WorkDay[];
  currentWeek: Date;
  onWeekChange: (week: Date) => void;
}

const WeeklyReport: React.FC<WeeklyReportProps> = ({
  workDays,
  currentWeek,
  onWeekChange,
}) => {
  const [showEmailText, setShowEmailText] = useState(false);

  const weekDays = getWeekDays(currentWeek);
  // Filtrer pour exclure les weekends (samedi = 6, dimanche = 0)
  const workWeekDays = weekDays.filter((date) => {
    const dayOfWeek = date.getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6; // Exclure dimanche (0) et samedi (6)
  });
  const weekWorkDays = workWeekDays.map((day) => {
    const workDay = workDays.find(
      (wd) =>
        wd.date.getFullYear() === day.getFullYear() &&
        wd.date.getMonth() === day.getMonth() &&
        wd.date.getDate() === day.getDate()
    );
    return { date: day, workDay };
  });

  const totalWeeklyHours = weekWorkDays.reduce((total, { workDay }) => {
    return total + (workDay?.totalWorkHours || 0);
  }, 0);

  const formatHoursToHoursMinutes = (hours: number): string => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h${minutes.toString().padStart(2, "0")}min`;
  };

  const generateEmailText = (): string => {
    let emailText = "Ma feuille de présence de la semaine :\n\n";

    weekWorkDays.forEach(({ date, workDay }) => {
      const dayName = getDayName(date);
      const dayNumber = date.getDate();
      const monthName = getMonthName(date);

      if (workDay && workDay.isComplete) {
        const startTime = formatTime(workDay.workTime.start);
        const endTime = workDay.workTime.end
          ? formatTime(workDay.workTime.end)
          : "";

        let lunchText = "";
        if (workDay.lunchBreak?.start && workDay.lunchBreak?.end) {
          const lunchStart = formatTime(workDay.lunchBreak.start);
          const lunchEnd = formatTime(workDay.lunchBreak.end);
          lunchText = `Pause déjeuner entre ${lunchStart} et ${lunchEnd}.`;
        }

        const formattedWorkTime = formatHoursToHoursMinutes(
          workDay.totalWorkHours
        );
        emailText += `${dayName} ${dayNumber} ${monthName} - Durée de ma journée de travail : ${startTime} à ${endTime}. ${lunchText} Temps de travail journalier : ${formattedWorkTime}.\n`;
      } else {
        // Jour non travaillé ou incomplet
        emailText += `${dayName} ${dayNumber} ${monthName} - Jour non travaillé.\n`;
      }
    });

    const formattedTotalWeeklyHours =
      formatHoursToHoursMinutes(totalWeeklyHours);
    emailText += `\nTOTAL DURÉE DE TRAVAIL HEBDOMADAIRE : ${formattedTotalWeeklyHours}\n`;
    emailText += `TOTAL CONGÉS HEBDOMADAIRE : 0h00`;

    return emailText;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateEmailText());
      alert("Texte copié dans le presse-papiers !");
    } catch (err) {
      console.error("Erreur lors de la copie:", err);
      alert("Erreur lors de la copie. Veuillez copier manuellement.");
    }
  };

  const goToPreviousWeek = () => {
    const previousWeek = new Date(currentWeek);
    previousWeek.setDate(currentWeek.getDate() - 7);
    onWeekChange(previousWeek);
  };

  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeek);
    nextWeek.setDate(currentWeek.getDate() + 7);
    onWeekChange(nextWeek);
  };

  const goToCurrentWeek = () => {
    onWeekChange(new Date());
  };

  return (
    <div className="space-y-6 p-6">
      {/* Navigation de semaine */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button onClick={goToPreviousWeek} variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-2" />
            </Button>
            <CardTitle className="text-center">
              <Calendar className="h-5 w-5 inline mr-2" />
              Semaine du {weekDays[0].getDate()} {getMonthName(weekDays[0])} au{" "}
              {weekDays[6].getDate()} {getMonthName(weekDays[6])}{" "}
              {weekDays[0].getFullYear()}
            </CardTitle>
            <Button onClick={goToNextWeek} variant="outline" size="sm">
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="flex justify-center">
        <Button onClick={goToCurrentWeek} variant="default">
          Aller à la semaine actuelle
        </Button>
      </div>

      {/* Résumé de la semaine */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé hebdomadaire</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
              {weekWorkDays.map(({ date, workDay }, index) => (
                <Card
                  key={index}
                  className={`${
                    workDay?.isComplete
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200 bg-gray-50"
                  } min-h-[140px]`}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">
                      {getDayName(date)} {date.getDate()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {workDay?.isComplete ? (
                      <div className="space-y-2 text-sm">
                        <p>
                          Début:{" "}
                          <span className="font-medium">
                            {formatTime(workDay.workTime.start)}
                          </span>
                        </p>
                        <p>
                          Fin:{" "}
                          <span className="font-medium">
                            {workDay.workTime.end
                              ? formatTime(workDay.workTime.end)
                              : "N/A"}
                          </span>
                        </p>
                        {workDay.lunchBreak?.start &&
                          workDay.lunchBreak?.end && (
                            <p>
                              Pause:{" "}
                              <span className="font-medium">
                                {formatTime(workDay.lunchBreak.start)} -{" "}
                                {formatTime(workDay.lunchBreak.end)}
                              </span>
                            </p>
                          )}
                        <div className="mt-3">
                          <Badge
                            variant="secondary"
                            className="text-sm px-3 py-1"
                          >
                            Total: {workDay.totalWorkHours}h
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Pas de données</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Badge variant="default" className="text-lg px-4 py-2">
                Total hebdomadaire: {totalWeeklyHours}h
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Génération d'email */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Mail className="h-5 w-5 inline mr-2" />
            Rapport par email
          </CardTitle>
          <CardDescription>
            Générez et copiez votre rapport hebdomadaire
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button
              onClick={() => setShowEmailText(!showEmailText)}
              variant="outline"
            >
              {showEmailText ? "Masquer" : "Prévisualiser"} l'email
            </Button>

            <Button onClick={copyToClipboard} variant="default">
              <Copy className="h-4 w-4 mr-2" />
              Copier l'email
            </Button>
          </div>

          {showEmailText && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Aperçu de l'email:</h4>
              <Textarea
                value={generateEmailText()}
                readOnly
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyReport;
