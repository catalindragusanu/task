const STORAGE_KEYS = {
  TASKS: 'taskManager_tasks',
  CATEGORIES: 'taskManager_categories'
};

const SAVE_DELAY = 300;
let tasksSaveTimer = null;
let pendingTasksSnapshot = null;

export const storageService = {
  // Tasks
  getTasks: () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  },

  saveTasks: (tasks) => {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      return true;
    } catch (error) {
      console.error('Error saving tasks:', error);
      throw error;
    }
  },

  saveTasksDebounced: (tasks, onError) => {
    pendingTasksSnapshot = tasks;
    if (tasksSaveTimer) {
      clearTimeout(tasksSaveTimer);
    }
    tasksSaveTimer = setTimeout(() => {
      try {
        storageService.saveTasks(pendingTasksSnapshot);
      } catch (error) {
        console.error('Error saving tasks (debounced):', error);
        if (onError) {
          onError(error);
        }
      } finally {
        tasksSaveTimer = null;
      }
    }, SAVE_DELAY);
  },

  // Categories
  getCategories: () => {
    try {
      const categories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
      // Ensure default categories exist
      if (categories.length === 0) {
        const defaults = ['Work', 'Personal', 'Shopping', 'Health'];
        storageService.saveCategories(defaults);
        return defaults;
      }
      return categories;
    } catch (error) {
      console.error('Error loading categories:', error);
      return ['Work', 'Personal', 'Shopping', 'Health'];
    }
  },

  saveCategories: (categories) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      return true;
    } catch (error) {
      console.error('Error saving categories:', error);
      return false;
    }
  },

  // Clear all data
  clearAll: () => {
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
  }
};
