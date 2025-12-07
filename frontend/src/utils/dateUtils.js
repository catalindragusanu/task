import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';

/**
 * Format a date string for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    return dateString;
  }
};

/**
 * Format a date for display with relative labels
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date with labels like "Today", "Tomorrow"
 */
export const formatRelativeDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    return dateString;
  }
};

/**
 * Check if a task is overdue
 * @param {string} dueDate - ISO date string
 * @returns {boolean} True if overdue
 */
export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  try {
    const date = parseISO(dueDate);
    return isPast(date) && !isToday(date);
  } catch (error) {
    return false;
  }
};

/**
 * Get today's date in ISO format
 * @returns {string} ISO date string
 */
export const getTodayISO = () => {
  return new Date().toISOString().split('T')[0];
};
