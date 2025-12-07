import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const apiService = {
  /**
   * Get AI-powered brainstorming suggestions
   * @param {string} context - User's context or goal
   * @param {string} taskType - Type of tasks to generate
   * @returns {Promise<Array>} Array of suggested tasks
   */
  brainstorm: async (context, taskType = 'general') => {
    try {
      const response = await axios.post(`${API_BASE}/brainstorm`, {
        context,
        taskType
      });
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
    try {
      const response = await axios.post(`${API_BASE}/generate-plan`, {
        tasks
      });
      return response.data;
    } catch (error) {
      console.error('Daily plan API error:', error);
      throw new Error(error.response?.data?.error || 'Failed to generate daily plan');
    }
  }
};
