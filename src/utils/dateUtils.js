/**
 * Centralized date logic for the 45-day gaz balon cycle.
 * Returns { daysLeft: number, status: 'ok' | 'soon' | 'overdue' }
 */
export const calculateStatus = (sana) => {
  if (!sana) return { daysLeft: 0, status: 'ok' };
  
  const start = new Date(sana);
  if (isNaN(start.getTime())) {
    return { daysLeft: 0, status: 'ok' };
  }

  const now = new Date();
  const diffTime = now - start;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const daysLeft = 45 - diffDays;
  
  let status = 'ok';
  if (daysLeft <= 0) status = 'overdue';
  else if (daysLeft <= 7) status = 'soon';
  
  return { daysLeft, status };
};

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? 'Invalid Date' : d.toLocaleDateString('uz-UZ');
};
