import axios from 'axios';
import { Buffer } from 'buffer';
window.Buffer = Buffer;

// Cache implementation for GitHub API responses
const GITHUB_CACHE_KEY_PREFIX = 'github_cache_';
const GITHUB_CACHE_EXPIRY_MS = 60 * 60 * 1000; // 60 minutes

/**
 * Creates a GitHub file manager instance with caching
 * @param {string} token - GitHub personal access token
 * @param {string} owner - Repository owner (username or org)
 * @param {string} repo - Repository name
 * @returns {object} File manager functions
 */
export function createGitHubFileManager(token, owner, repo) {
  const apiBase = 'https://api.github.com';

  // 🔐 Authenticated headers (for upload/update)
  const authHeaders = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json'
  };

  // 🔓 Public headers (for read-only)
  const publicHeaders = {
    Accept: 'application/vnd.github.v3+json'
  };

  // Helper function to generate cache key
  const getCacheKey = (filePath, branch) => 
    `${GITHUB_CACHE_KEY_PREFIX}${filePath}_${branch}`;

  // Check if cache is still valid
  const isCacheValid = (cache) => {
    if (!cache || !cache.timestamp) return false;
    return Date.now() - cache.timestamp < GITHUB_CACHE_EXPIRY_MS;
  };

  /**
   * Upload or update a file in GitHub repository
   */
  async function uploadFile(filePath, content, message, branch = 'main') {
    try {
      // 1. Check if file exists (read without token)
      let sha = null;
      try {
        const response = await axios.get(
          `${apiBase}/repos/${owner}/${repo}/contents/${filePath}`,
          {
            headers: publicHeaders,
            params: { ref: branch }
          }
        );
        sha = response.data.sha;
      } catch (error) {
        if (error.response?.status !== 404) {
          throw error;
        }
        // File doesn't exist (fine for creation)
      }

      // 2. Create or update file (requires token)
      const data = {
        message,
        content: Buffer.from(content).toString('base64'),
        branch,
        ...(sha && { sha })
      };

      const response = await axios.put(
        `${apiBase}/repos/${owner}/${repo}/contents/${filePath}`,
        data,
        { headers: authHeaders }
      );

      // Clear cache for this file
      localStorage.removeItem(getCacheKey(filePath, branch));

      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get file content from GitHub repository with caching
   */
  async function getFile(filePath, branch = 'main') {
    const cacheKey = getCacheKey(filePath, branch);
    
    // Try to get from cache first
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      const parsedCache = JSON.parse(cachedData);
      if (isCacheValid(parsedCache)) {
        return parsedCache.content;
      }
    }

    try {
      const response = await axios.get(
        `${apiBase}/repos/${owner}/${repo}/contents/${filePath}`,
        {
          headers: publicHeaders,
          params: { ref: branch }
        }
      );

      const content = Buffer.from(response.data.content, 'base64').toString('utf8');
      
      // Cache the response
      localStorage.setItem(cacheKey, JSON.stringify({
        content,
        timestamp: Date.now()
      }));

      return content;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('File not found');
      }
      console.error('Error getting file:', error.response?.data || error.message);
      throw error;
    }
  }

  return {
    uploadFile,
    getFile
  };
}