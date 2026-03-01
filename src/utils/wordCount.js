/**
 * Count words in HTML or plain text content.
 */
export function countWords(content = '') {
  if (!content) return 0
  // Strip HTML tags
  const text = content.replace(/<[^>]*>/g, ' ')
  // Strip extra whitespace and split
  const words = text
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(w => w.length > 0)
  return words.length
}

/**
 * Count characters (no spaces) in HTML content.
 */
export function countChars(content = '') {
  if (!content) return 0
  const text = content.replace(/<[^>]*>/g, '')
  return text.replace(/\s/g, '').length
}

/**
 * Estimate reading time in minutes.
 */
export function readingTime(wordCount) {
  const WPM = 250
  const mins = Math.ceil(wordCount / WPM)
  return mins === 1 ? '1 min read' : `${mins} min read`
}

/**
 * Strip HTML to plain text for export.
 */
export function stripHtml(html = '') {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Format a number with commas.
 */
export function formatNumber(n) {
  return n.toLocaleString()
}

/**
 * Get total word count for a project.
 */
export function projectWordCount(project) {
  return project.chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0)
}

/**
 * Estimate pages (250 words per page).
 */
export function estimatePages(wordCount) {
  return Math.max(1, Math.round(wordCount / 250))
}
