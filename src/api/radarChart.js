import api from './client';

/**
 * Radar Chart API Client
 * @desc API functions for fetching radar chart data from backend
 */

/**
 * Get combined radar chart data for current authenticated user
 * @desc Fetches user-specific radar chart data combining posted schedules with persona contentStyle
 * @returns {Promise} Response with radar chart data formatted for MUI X Charts
 */
export const getCombinedData = async () => {
  try {
    console.log('=== API: Fetching combined radar chart data ===');
    
    const response = await api.get('/radar-charts/combined');
    
    if (response.data && response.data.success) {
      console.log('=== API: Radar chart data received ===', {
        totalSchedules: response.data.data.summary.totalPostedSchedules,
        matchedWithPersonas: response.data.data.summary.matchedWithPersonas,
        contentStyleBreakdown: response.data.data.summary.contentStyleBreakdown
      });
      
      return response.data.data;
    } else {
      throw new Error('Invalid response format from radar chart API');
    }
  } catch (error) {
    console.error('Error fetching radar chart data:', error);
    
    // Enhanced error handling with specific error messages
    if (error.response) {
      // Server responded with error status
      const statusCode = error.response.status;
      const errorMessage = error.response.data?.error || error.response.data?.message || 'Server error';
      
      switch (statusCode) {
        case 401:
          throw new Error('Authentication required. Please login again.');
        case 403:
          throw new Error('Access denied. You do not have permission to view this data.');
        case 404:
          throw new Error('Radar chart endpoint not found. Please contact support.');
        case 500:
          throw new Error(`Server error: ${errorMessage}`);
        default:
          throw new Error(`Request failed with status ${statusCode}: ${errorMessage}`);
      }
    } else if (error.request) {
      // Network error - no response received
      throw new Error('Network error: Unable to reach server. Please check your internet connection.');
    } else {
      // Other error (e.g., configuration, parsing)
      throw new Error(`Radar chart API error: ${error.message}`);
    }
  }
};

/**
 * Get global radar chart data (admin/analytics view)
 * @desc Fetches platform-wide radar chart data across all users
 * @returns {Promise} Response with global radar chart data
 */
export const getGlobalData = async () => {
  try {
    console.log('=== API: Fetching global radar chart data ===');
    
    const response = await api.get('/radar-charts/global');
    
    if (response.data && response.data.success) {
      console.log('=== API: Global radar chart data received ===', {
        totalSchedules: response.data.data.summary.totalPostedSchedules,
        totalUsers: response.data.data.summary.totalUsers,
        contentStyleBreakdown: response.data.data.summary.contentStyleBreakdown
      });
      
      return response.data.data;
    } else {
      throw new Error('Invalid response format from global radar chart API');
    }
  } catch (error) {
    console.error('Error fetching global radar chart data:', error);
    
    if (error.response) {
      const statusCode = error.response.status;
      const errorMessage = error.response.data?.error || error.response.data?.message || 'Server error';
      
      switch (statusCode) {
        case 401:
          throw new Error('Authentication required for global data access.');
        case 403:
          throw new Error('Admin access required to view global radar chart data.');
        case 404:
          throw new Error('Global radar chart endpoint not found.');
        case 500:
          throw new Error(`Server error: ${errorMessage}`);
        default:
          throw new Error(`Global radar chart request failed: ${errorMessage}`);
      }
    } else if (error.request) {
      throw new Error('Network error: Unable to reach server for global data.');
    } else {
      throw new Error(`Global radar chart API error: ${error.message}`);
    }
  }
};

/**
 * Radar Chart API object with all methods
 * @desc Main export object containing all radar chart API functions
 */
export const radarChartAPI = {
  getCombinedData,
  getGlobalData
};

// Default export for backward compatibility
export default radarChartAPI;