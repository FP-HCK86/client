// lib/calendarMatrix.js
import { startOfDay, addDays, startOfWeekMonday } from "./dateHelpers";

export const getMonthMatrix = (currentDate) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first and last day of the month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Get all days in the current month
  const days = [];
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);
    days.push({ date, inMonth: true });
  }

  // Group days by weeks (starting from Monday)
  const weeks = [];
  let currentWeek = [];

  // Add empty slots for days before the first day of month
  const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const mondayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Convert to Monday-based (0 = Monday)

  for (let i = 0; i < mondayOffset; i++) {
    currentWeek.push(null); // Empty slot
  }

  // Add days of the month
  days.forEach((day) => {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  });

  // Fill remaining slots in the last week
  while (currentWeek.length < 7) {
    currentWeek.push(null);
  }
  weeks.push(currentWeek);

  return weeks;
};

export const getWeekRange = (currentDate) => {
  const start = startOfWeekMonday(currentDate);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};