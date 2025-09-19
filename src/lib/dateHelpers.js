// lib/dateHelpers.js
export const startOfDay = (d) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const addDays = (d, n) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const startOfWeekMonday = (d) => {
  const day = (d.getDay() + 6) % 7; // 0=Mon ... 6=Sun
  const start = addDays(startOfDay(d), -day);
  return start;
};