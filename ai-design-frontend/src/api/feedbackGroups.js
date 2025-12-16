/**
 * API Service for Feedback Groups and Image Generation
 * 
 * INTEGRATION:
 * Import this in your existing API module or services folder:
 * 
 * import { feedbackGroupsAPI } from './api/feedbackGroups';
 */

const API_BASE_URL = 'https://difficile-convalescently-edelmira.ngrok-free.dev';

export const feedbackGroupsAPI = {
  /**
   * Get grouped feedback for a brand
   * 
   * @param {string} brandName - Brand name
   * @param {object} options - Optional parameters
   * @returns {Promise} Response with grouped feedback
   */
  async getGroups(brandName, options = {}) {
    const {
      similarityThreshold = 0.75,
      maxClusters = null,
      includeSummary = true
    } = options;

    const params = new URLSearchParams({
      similarity_threshold: similarityThreshold,
      include_summary: includeSummary
    });

    if (maxClusters) {
      params.append('max_clusters', maxClusters);
    }

    const response = await fetch(
      `${API_BASE_URL}/api/feedback-groups/${brandName}?${params}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch feedback groups: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Generate images from a feedback group
   * 
   * @param {object} data - Generation request data
   * @returns {Promise} Response with generated images
   */
  async generateImages(data) {
    const response = await fetch(`${API_BASE_URL}/api/generate-images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        brand_name: data.brandName,
        group_id: data.groupId,
        feedback_items: data.feedbackItems,
        group_summary: data.groupSummary,
        original_input: data.originalInput || null,
        n_variations: data.nVariations || 2
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to generate images: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get all image generations for a brand
   * 
   * @param {string} brandName - Brand name
   * @param {number} limit - Max results
   * @returns {Promise} Response with generations
   */
  async getBrandGenerations(brandName, limit = 50) {
    const response = await fetch(
      `${API_BASE_URL}/api/generations/${brandName}?limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch generations: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get specific generation by ID
   * 
   * @param {string} generationId - Generation ID
   * @returns {Promise} Generation details
   */
  async getGeneration(generationId) {
    const response = await fetch(
      `${API_BASE_URL}/api/generation/${generationId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch generation: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Health check for grouping functionality
   * 
   * @returns {Promise} Health status
   */
  async healthCheck() {
    const response = await fetch(
      `${API_BASE_URL}/api/health/grouping`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    return response.json();
  }
};

/**
 * Helper function to download image
 * 
 * @param {string} imageUrl - Image URL
 * @param {string} filename - Filename for download
 */
export const downloadImage = async (imageUrl, filename) => {
  try {
    const response = await fetch(imageUrl, {
      mode: 'cors',
      credentials: 'omit'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
  } catch (error) {
    console.error('Error downloading image:', error);
    // Fallback: open in new tab
    window.open(imageUrl, '_blank');
  }
};

export default feedbackGroupsAPI;