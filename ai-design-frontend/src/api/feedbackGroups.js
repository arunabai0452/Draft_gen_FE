/**
 * API Service for Feedback Groups and Image Generation
 * 
 * INTEGRATION:
 * Import this in your existing API module or services folder:
 * 
 * import { feedbackGroupsAPI } from './api/feedbackGroups';
 */

const API_BASE_URL = 'https://difficile-convalescently-edelmira.ngrok-free.dev';

/**
 * Helper: Add ngrok bypass headers to all requests
 */
const createHeaders = (customHeaders = {}) => ({
  'ngrok-skip-browser-warning': 'true',
  'Content-Type': 'application/json',
  ...customHeaders
});

export const feedbackGroupsAPI = {
  /**
   * Get grouped feedback for a brand
   * 
   * @param {string} brandName - Brand name
   * @param {object} options - Optional parameters
   * @returns {Promise} Response with grouped feedback
   * 
   * @example
   * const groups = await feedbackGroupsAPI.getGroups('Nike', {
   *   similarityThreshold: 0.85,
   *   includeSummary: true
   * });
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

    try {
      console.log(`📊 Fetching groups for: ${brandName}`);
      
      const response = await fetch(
        `${API_BASE_URL}/api/feedback-groups/${brandName}?${params}`,
        {
          method: 'GET',
          headers: createHeaders()
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Groups received: ${data.group_count || 0} groups`);
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching groups:', error);
      throw error;
    }
  },

  /**
   * Generate images from a feedback group
   * 
   * @param {object} data - Generation request data
   * @param {string} data.brandName - Brand name
   * @param {number} data.groupId - Group ID
   * @param {Array} data.feedbackItems - Feedback items from group
   * @param {string} data.groupSummary - AI-generated summary
   * @param {object} data.originalInput - Original moodboard input (optional)
   * @param {number} data.nVariations - Number of variations (default: 2)
   * @returns {Promise} Response with generated images
   * 
   * @example
   * const result = await feedbackGroupsAPI.generateImages({
   *   brandName: 'Nike',
   *   groupId: 1,
   *   feedbackItems: [...],
   *   groupSummary: 'Modern athletic style...',
   *   nVariations: 2
   * });
   */
  async generateImages(data) {
    try {
      console.log(`🎨 Generating images for group ${data.groupId}`);
      
      const response = await fetch(`${API_BASE_URL}/api/generate-images`, {
        method: 'POST',
        headers: createHeaders(),
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`✅ Generated ${result.images?.length || 0} images`);
      
      return result;
    } catch (error) {
      console.error('❌ Error generating images:', error);
      throw error;
    }
  },

  /**
   * Get all image generations for a brand
   * 
   * @param {string} brandName - Brand name
   * @param {number} limit - Max results (default: 50)
   * @returns {Promise} Response with generations
   * 
   * @example
   * const history = await feedbackGroupsAPI.getBrandGenerations('Nike', 20);
   */
  async getBrandGenerations(brandName, limit = 50) {
    try {
      console.log(`📜 Fetching generations for: ${brandName}`);
      
      const response = await fetch(
        `${API_BASE_URL}/api/generations/${brandName}?limit=${limit}`,
        {
          method: 'GET',
          headers: createHeaders()
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Found ${data.count || 0} generations`);
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching generations:', error);
      throw error;
    }
  },

  /**
   * Get specific generation by ID
   * 
   * @param {string} generationId - Generation ID (MongoDB ObjectId)
   * @returns {Promise} Generation details
   * 
   * @example
   * const generation = await feedbackGroupsAPI.getGeneration('507f1f77bcf86cd799439011');
   */
  async getGeneration(generationId) {
    try {
      console.log(`🔍 Fetching generation: ${generationId}`);
      
      const response = await fetch(
        `${API_BASE_URL}/api/generation/${generationId}`,
        {
          method: 'GET',
          headers: createHeaders()
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Generation not found');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Generation retrieved`);
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching generation:', error);
      throw error;
    }
  },

  /**
   * Health check for grouping functionality
   * 
   * @returns {Promise} Health status
   * 
   * @example
   * const health = await feedbackGroupsAPI.healthCheck();
   * console.log('Vector store:', health.vector_store); // true/false
   * console.log('OpenAI:', health.openai); // true/false
   */
  async healthCheck() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/health/grouping`,
        {
          method: 'GET',
          headers: createHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Health check error:', error);
      throw error;
    }
  },

  /**
   * Store feedback in Vector DB
   * 
   * @param {object} feedback - Feedback data
   * @param {string} feedback.feedbackText - Feedback text
   * @param {string} feedback.brandName - Brand name
   * @param {string} feedback.moodboardId - Moodboard ID
   * @param {string} feedback.userId - User ID (optional)
   * @returns {Promise} Storage confirmation
   * 
   * @example
   * const result = await feedbackGroupsAPI.storeFeedback({
   *   feedbackText: 'Make it more modern',
   *   brandName: 'Nike',
   *   moodboardId: '12345'
   * });
   */
  async storeFeedback(feedback) {
    try {
      console.log(`💾 Storing feedback for: ${feedback.brandName}`);
      
      const response = await fetch(`${API_BASE_URL}/api/feedback/store`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({
          feedback_text: feedback.feedbackText,
          brand_name: feedback.brandName,
          moodboard_id: feedback.moodboardId,
          user_id: feedback.userId || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Feedback stored: ${data.stored ? 'Yes' : 'No'}`);
      
      return data;
    } catch (error) {
      console.error('❌ Error storing feedback:', error);
      throw error;
    }
  },

  /**
   * Search for similar feedback
   * 
   * @param {object} search - Search parameters
   * @param {string} search.queryText - Search query
   * @param {string} search.brandName - Brand name (optional)
   * @param {number} search.limit - Max results (default: 5)
   * @returns {Promise} Similar feedback results
   * 
   * @example
   * const results = await feedbackGroupsAPI.searchFeedback({
   *   queryText: 'modern minimalist design',
   *   brandName: 'Nike',
   *   limit: 10
   * });
   */
  async searchFeedback(search) {
    try {
      console.log(`🔍 Searching feedback: "${search.queryText}"`);
      
      const response = await fetch(`${API_BASE_URL}/api/feedback/search`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({
          query_text: search.queryText,
          brand_name: search.brandName || null,
          limit: search.limit || 5
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Found ${data.count || 0} similar feedback items`);
      
      return data;
    } catch (error) {
      console.error('❌ Error searching feedback:', error);
      throw error;
    }
  },

  /**
   * Get all feedback for a brand
   * 
   * @param {string} brandName - Brand name
   * @param {number} limit - Max results (default: 50)
   * @returns {Promise} All feedback for brand
   * 
   * @example
   * const feedback = await feedbackGroupsAPI.getBrandFeedback('Nike', 100);
   */
  async getBrandFeedback(brandName, limit = 50) {
    try {
      console.log(`📋 Fetching feedback for: ${brandName}`);
      
      const response = await fetch(
        `${API_BASE_URL}/api/feedback/brand/${brandName}?limit=${limit}`,
        {
          method: 'GET',
          headers: createHeaders()
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Found ${data.count || 0} feedback items`);
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching feedback:', error);
      throw error;
    }
  },

  /**
   * Get feedback statistics
   * 
   * @param {string} brandName - Brand name (optional)
   * @returns {Promise} Feedback statistics
   * 
   * @example
   * const stats = await feedbackGroupsAPI.getFeedbackStats('Nike');
   */
  async getFeedbackStats(brandName = null) {
    try {
      const url = brandName 
        ? `${API_BASE_URL}/api/feedback/stats?brand_name=${brandName}`
        : `${API_BASE_URL}/api/feedback/stats`;
      
      console.log(`📊 Fetching stats${brandName ? ` for ${brandName}` : ''}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: createHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Stats retrieved`);
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      throw error;
    }
  }
};

/**
 * Helper function to download image
 * 
 * @param {string} imageUrl - Image URL
 * @param {string} filename - Filename for download
 * 
 * @example
 * await downloadImage(
 *   'https://example.com/image.png',
 *   'nike_design_v1.png'
 * );
 */
export const downloadImage = async (imageUrl, filename) => {
  try {
    console.log(`⬇️ Downloading: ${filename}`);
    
    const response = await fetch(imageUrl, {
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
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
    
    console.log(`✅ Download initiated: ${filename}`);
  } catch (error) {
    console.error('❌ Error downloading image:', error);
    console.log('⚠️ Fallback: Opening in new tab');
    // Fallback: open in new tab
    window.open(imageUrl, '_blank');
  }
};

/**
 * Batch download multiple images
 * 
 * @param {Array} images - Array of image objects with url and filename
 * @param {number} delay - Delay between downloads in ms (default: 500)
 * 
 * @example
 * await batchDownloadImages([
 *   { url: 'https://...', filename: 'image1.png' },
 *   { url: 'https://...', filename: 'image2.png' }
 * ]);
 */
export const batchDownloadImages = async (images, delay = 500) => {
  console.log(`⬇️ Batch downloading ${images.length} images...`);
  
  for (let i = 0; i < images.length; i++) {
    const { url, filename } = images[i];
    await downloadImage(url, filename);
    
    // Add delay between downloads to avoid rate limiting
    if (i < images.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.log(`✅ Batch download complete!`);
};

export default feedbackGroupsAPI;