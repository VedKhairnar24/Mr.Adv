/**
 * Clean text by removing extra whitespace, special characters, etc.
 * @param {string} text - Text to clean
 * @returns {string}
 */
function cleanText(text) {
  if (!text) return "";

  return text
    // Remove multiple consecutive spaces
    .replace(/\s+/g, " ")
    // Remove multiple line breaks (keep single ones)
    .replace(/\n\n+/g, "\n")
    // Trim whitespace
    .trim();
}

/**
 * Utility to split text into chunks for processing
 * Useful for APIs with token limits
 */

/**
 * Split text into chunks
 * @param {string} text - Text to chunk
 * @param {Object} options - Chunking options
 *   - maxChunkSize: Maximum characters per chunk (default: 1500)
 *   - chunkOverlap: Overlap between chunks for context (default: 100)
 * @returns {Array<string>} Array of text chunks
 */
function chunkText(text, options = {}) {
  const maxChunkSize = options.maxChunkSize || 1500;
  const chunkOverlap = options.chunkOverlap || 100;

  if (!text || text.trim().length === 0) {
    return [];
  }

  // If text is smaller than chunk size, return as is
  if (text.length <= maxChunkSize) {
    return [text];
  }

  const chunks = [];
  let startIdx = 0;

  while (startIdx < text.length) {
    // Find the end of the chunk
    let endIdx = startIdx + maxChunkSize;

    // Try to cut at sentence boundary if possible
    if (endIdx < text.length) {
      // Look for last period, exclamation, or question mark within the chunk
      let lastSentenceEnd = text.lastIndexOf(".", endIdx);
      if (lastSentenceEnd === -1) {
        lastSentenceEnd = text.lastIndexOf("!", endIdx);
      }
      if (lastSentenceEnd === -1) {
        lastSentenceEnd = text.lastIndexOf("?", endIdx);
      }

      // If we found a sentence end, use it (and keep some buffer)
      if (lastSentenceEnd > startIdx + maxChunkSize * 0.6) {
        endIdx = lastSentenceEnd + 1;
      } else {
        // Otherwise, try to cut at word boundary
        const lastSpace = text.lastIndexOf(" ", endIdx);
        if (lastSpace > startIdx + maxChunkSize * 0.6) {
          endIdx = lastSpace;
        }
      }
    }

    // Extract chunk
    const chunk = text.substring(startIdx, endIdx).trim();

    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    // Move start index (with overlap)
    startIdx = endIdx - chunkOverlap;

    // Prevent infinite loop if overlap is too large
    if (chunks.length > 0 && startIdx <= chunks[chunks.length - 1].length) {
      startIdx = endIdx;
    }
  }

  return chunks.length > 0 ? chunks : [text];
}

/**
 * Merge multiple text responses into one
 * @param {Array<string>} responses - Array of responses to merge
 * @param {string} separator - Separator between responses (default: "\n\n")
 * @returns {string}
 */
function mergeResponses(responses, separator = "\n\n") {
  return responses.filter((r) => r && r.trim().length > 0).join(separator);
}

/**
 * Estimate token count (rough estimate)
 * Uses simple word counting (1 token ≈ 1.3 words on average)
 * @param {string} text - Text to estimate tokens for
 * @returns {number}
 */
function estimateTokens(text) {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / 0.75); // 1 token ≈ 0.75 words (inverse of 1.3)
}

module.exports = {
  cleanText,
  chunkText,
  mergeResponses,
  estimateTokens,
};
