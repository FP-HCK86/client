// lib/formatters.js
export const formatDateHead = (d) =>
  d.toLocaleDateString(undefined, { year: "numeric", month: "long" });

export const formatDayNum = (d) => d.getDate();

export const formatWeekdayShort = (d) =>
  d.toLocaleDateString(undefined, { weekday: "short" });

export const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });