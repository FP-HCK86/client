// hooks/useCalendarNavigation.js
import { useState } from "react";
import { addDays } from "@/lib/dateHelpers";

export const useCalendarNavigation = (initialDate = new Date()) => {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const gotoToday = () => {
    const t = new Date();
    setCurrentDate(t);
    setSelectedDate(t);
  };

  const gotoPrev = (view) => {
    if (view === "month")
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      );
    else if (view === "week") setCurrentDate(addDays(currentDate, -7));
    else setCurrentDate(addDays(currentDate, -1));
  };

  const gotoNext = (view) => {
    if (view === "month")
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
      );
    else if (view === "week") setCurrentDate(addDays(currentDate, 7));
    else setCurrentDate(addDays(currentDate, 1));
  };

  return {
    currentDate,
    setCurrentDate,
    selectedDate,
    setSelectedDate,
    gotoToday,
    gotoPrev,
    gotoNext,
  };
};