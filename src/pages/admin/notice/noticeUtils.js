const todayValue = () => {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
export const blankNotice = () => ({ title: '', message: '', category: 'Academic', priority: 'Normal', audienceType: 'All', audienceValue: 'all', publishDate: todayValue(), expiryDate: '', status: 'Draft' });
export const fieldClass = 'mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100';
export const statusStyle = { Published: 'bg-emerald-100 text-emerald-700', Draft: 'bg-amber-100 text-amber-700', Archived: 'bg-slate-200 text-slate-600' };
export const priorityStyle = { Normal: 'bg-sky-100 text-sky-700', Important: 'bg-amber-100 text-amber-700', Urgent: 'bg-rose-100 text-rose-700' };
export const toDate = (value) => value ? new Date(`${value}T00:00:00`) : null;
export const toValue = (date) => date ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10) : '';

