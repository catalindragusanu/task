import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4001/api';
const API_KEY = process.env.REACT_APP_API_KEY;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const withRetry = async (requestFn, retries = 2, baseDelay = 500) => {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await requestFn();
    } catch (error) {
      if (attempt >= retries) throw error;
      const delay = baseDelay * Math.pow(2, attempt);
      await sleep(delay);
      attempt += 1;
    }
  }
};

export const apiService = {
  /**
   * Get AI-powered brainstorming suggestions
   * @param {string} context - User's context or goal
   * @param {string} taskType - Type of tasks to generate
   * @returns {Promise<Array>} Array of suggested tasks
   */
  brainstorm: async (context, taskType = 'general') => {
    const request = () => axios.post(`${API_BASE}/brainstorm`, {
      context,
      taskType
    }, {
      timeout: 120000, // 2 minutes timeout for AI processing
      headers: API_KEY ? { 'X-API-Key': API_KEY } : undefined
    });

    try {
      const response = await withRetry(request);
      return response.data;
    } catch (error) {
      console.error('Brainstorm API error:', error);
      throw new Error(error.response?.data?.error || 'Failed to generate brainstorming suggestions');
    }
  },

  /**
   * Generate an optimized daily plan from tasks
   * @param {Array} tasks - Array of task objects
   * @returns {Promise<Object>} Daily plan with prioritized tasks
   */
  generateDailyPlan: async (tasks) => {
    const request = () => axios.post(`${API_BASE}/generate-plan`, {
      tasks
    }, {
      timeout: 120000, // 2 minutes timeout for AI processing
      headers: API_KEY ? { 'X-API-Key': API_KEY } : undefined
    });

    try {
      const response = await withRetry(request);
      return response.data;
    } catch (error) {
      console.error('Daily plan API error:', error);
      throw new Error(error.response?.data?.error || 'Failed to generate daily plan');
    }
  }
};
