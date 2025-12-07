import { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const loadedTasks = storageService.getTasks();
    setTasks(loadedTasks);
  }, []);

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
    const newTasks = [...tasks, newTask];
    setTasks(newTasks);
    storageService.saveTasks(newTasks);
    return newTask;
  };

  /**
   * Update an existing task
   * @param {number} id - Task ID
   * @param {Object} updates - Fields to update
   */
  const updateTask = (id, updates) => {
    const newTasks = tasks.map(task =>
      task.id === id ? { ...task, ...updates } : task
    );
    setTasks(newTasks);
    storageService.saveTasks(newTasks);
  };

  /**
   * Delete a task
   * @param {number} id - Task ID
   */
  const deleteTask = (id) => {
    const newTasks = tasks.filter(task => task.id !== id);
    setTasks(newTasks);
    storageService.saveTasks(newTasks);
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
    getTasksByCategory,
    getTasksByStatus,
    getTasksByDate
  };
};
