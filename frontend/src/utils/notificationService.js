import { isToday, isPast, parseISO } from 'date-fns';

class NotificationService {
  constructor() {
    this.permission = 'default';
    this.notificationSound = null;
    this.checkInterval = null;
    this.notifiedTasks = new Set(); // Track which tasks we've already notified about
  }

  /**
   * Request notification permission from the user
   */
  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Create a notification sound using Web Audio API
   */
  createNotificationSound() {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    return () => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Create a pleasant notification sound (two-tone beep)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    };
  }

  /**
   * Play notification sound
   */
  playSound() {
    if (!this.notificationSound) {
      this.notificationSound = this.createNotificationSound();
    }
    try {
      this.notificationSound();
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }

  /**
   * Show a browser notification
   */
  showNotification(title, options = {}) {
    if (this.permission !== 'granted') {
      return;
    }

    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });

    // Auto-close notification after 5 seconds
    setTimeout(() => notification.close(), 5000);

    return notification;
  }

  /**
   * Check for tasks that are due and notify
   */
  checkDueTasks(tasks) {
    const dueTasks = tasks.filter(task => {
      // Skip completed tasks
      if (task.status === 'done') return false;

      // Skip if we've already notified about this task
      if (this.notifiedTasks.has(task.id)) return false;

      if (!task.dueDate) return false;

      try {
        const dueDate = parseISO(task.dueDate);

        // Notify for tasks due today or overdue
        return isToday(dueDate) || isPast(dueDate);
      } catch (error) {
        return false;
      }
    });

    if (dueTasks.length > 0) {
      this.notifyDueTasks(dueTasks);
    }
  }

  /**
   * Notify about due tasks
   */
  notifyDueTasks(tasks) {
    // Play sound
    this.playSound();

    // Mark tasks as notified
    tasks.forEach(task => this.notifiedTasks.add(task.id));

    if (tasks.length === 1) {
      const task = tasks[0];
      this.showNotification('Task Due!', {
        body: `"${task.title}" is due ${isPast(parseISO(task.dueDate)) ? 'and overdue' : 'today'}!`,
        tag: `task-${task.id}`,
        requireInteraction: false
      });
    } else {
      this.showNotification('Multiple Tasks Due!', {
        body: `You have ${tasks.length} tasks that need attention.`,
        tag: 'multiple-tasks',
        requireInteraction: false
      });
    }
  }

  /**
   * Start periodic checking for due tasks
   */
  startPeriodicCheck(tasks, intervalMinutes = 15) {
    // Initial check
    this.checkDueTasks(tasks);

    // Clear existing interval if any
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Check every X minutes
    this.checkInterval = setInterval(() => {
      this.checkDueTasks(tasks);
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Stop periodic checking
   */
  stopPeriodicCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Clear notified tasks (call when tasks are updated)
   */
  clearNotifiedTask(taskId) {
    this.notifiedTasks.delete(taskId);
  }

  /**
   * Reset all notifications
   */
  reset() {
    this.stopPeriodicCheck();
    this.notifiedTasks.clear();
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
