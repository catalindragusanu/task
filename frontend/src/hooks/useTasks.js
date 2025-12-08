import { useState, useEffect, useRef } from 'react';
import { storageService } from '../services/storageService';
import { toast } from 'react-hot-toast';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const isInitialLoad = useRef(true);
  const lastDeletedRef = useRef(null);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const loadedTasks = storageService.getTasks();
    setTasks(loadedTasks);
  }, []);

  // Persist tasks with debounce to avoid excessive writes
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    try {
      storageService.saveTasksDebounced(tasks, () => {
        toast.error('Unable to save tasks. Local storage may be full.');
      });
    } catch (error) {
      console.error('Error scheduling task save', error);
      toast.error('Unable to save tasks locally.');
    }
  }, [tasks]);

  /**
   * Add a new task
   * @param {Object} task - Task object without id
   */
  const addTask = (task) => {
    const newTask = {
      ...task,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      status: task.status || 'todo'
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  };

  /**
   * Update an existing task
   * @param {number} id - Task ID
   * @param {Object} updates - Fields to update
   */
  const updateTask = (id, updates) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  /**
   * Delete a task
   * @param {number} id - Task ID
   */
  const deleteTask = (id) => {
    setTasks(prev => {
      const target = prev.find(t => t.id === id);
      if (target) {
        lastDeletedRef.current = target;
      }
      return prev.filter(task => task.id !== id);
    });
  };

  const undoDelete = () => {
    if (!lastDeletedRef.current) return;
    const restored = lastDeletedRef.current;
    lastDeletedRef.current = null;
    setTasks(prev => [...prev, restored]);
  };

  /**
   * Get tasks by category
   * @param {string} category - Category name
   */
  const getTasksByCategory = (category) => {
    return tasks.filter(task => task.category === category);
  };

  /**
   * Get tasks by status
   * @param {string} status - Status value
   */
  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  /**
   * Get tasks by date
   * @param {string} date - Date in ISO format
   */
  const getTasksByDate = (date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      return task.dueDate.startsWith(date);
    });
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    undoDelete,
    getTasksByCategory,
    getTasksByStatus,
    getTasksByDate
  };
};
