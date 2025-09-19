// lib/eventHelpers.js
import { startOfDay, addDays } from "./dateHelpers";

export const getEventsOnDate = (date, events) => {
  const dayStart = startOfDay(date).getTime();
  const dayEnd = addDays(date, 1).getTime();
  return events
    .filter((e) => {
      const s = new Date(e.start).getTime();
      return s >= dayStart && s < dayEnd;
    })
    .sort((a, b) => new Date(a.start) - new Date(b.start));
};