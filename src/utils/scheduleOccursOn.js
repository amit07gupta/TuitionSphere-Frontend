const dayKey = (date) => date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

export function scheduleOccursOn(item, date) {
  if (!item || !date || item.status === 'Cancelled') return false;
  if (item.cancelledDates?.includes(date)) return false;
  if (item.date) return item.date === date;

  const target = new Date(`${date}T00:00:00`);
  if (Number.isNaN(target.getTime())) return false;

  if (item.startDate || item.endDate) {
    if (item.startDate && date < item.startDate) return false;
    if (item.endDate && date > item.endDate) return false;
    const days = Array.isArray(item.repeatDays) ? item.repeatDays : [];
    return days.includes(dayKey(target));
  }

  return item.day === dayKey(target);
}
