function getCurrentWeekOfYear(): number {
  const now: Date = new Date();
  const startOfYear: Date = new Date(now.getFullYear(), 0, 0);
  const diff: number = now.getTime() - startOfYear.getTime();
  const millisecondsPerWeek: number = 1000 * 60 * 60 * 24 * 7;
  const weekOfYear: number = Math.floor(diff / millisecondsPerWeek);

  return weekOfYear;
}

export default getCurrentWeekOfYear;
