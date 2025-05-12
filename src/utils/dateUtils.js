// src/utils/dateUtils.js

/**
 * Formats a date string into a human-readable format
 * @param {string} dateString - The date string to format (e.g., "2023-04-01")
 * @returns {string} Formatted date string (e.g., "Apr 1, 2023")
 */
export const formatDate = (dateString) => {
  if (!dateString) return "Unknown date";

  try {
    const date = new Date(dateString);

    // Return 'Invalid Date' if date is not valid
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

/**
 * Formats a date string into a more verbose format
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string (e.g., "April 1, 2023 at 2:30 PM")
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return "Unknown date/time";

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "Invalid date/time";
    }

    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting date/time:", error);
    return "Invalid date/time";
  }
};

// Optional: Add more date utilities as needed
export const dateUtils = {
  formatDate,
  formatDateTime,
  // Add other date-related functions here
};

export default dateUtils;
