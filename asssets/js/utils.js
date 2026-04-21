/**
 * Utility functions for FGIS Sport
 * Debounce, announce, focus management helpers
 */

/**
 * Debounce function for search/filters
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in ms
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Announce message to screen readers via aria-live region
 * @param {string} message - Text to announce
 * @param {'polite'|'assertive'} priority - Announcement priority
 */
export function announce(message, priority = 'polite') {
  let region = document.getElementById('aria-live-region');
  
  if (!region) {
    region = document.createElement('div');
    region.id = 'aria-live-region';
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    document.body.appendChild(region);
  }
  
  region.setAttribute('aria-live', priority);
  // Clear and set message to trigger announcement
  region.textContent = '';
  setTimeout(() => { region.textContent = message; }, 100);
}

/**
 * Get all focusable elements within a container
 * @param {HTMLElement} container 
 */
export function getFocusableElements(container) {
  const selectors = [
    'a[href]', 'button:not([disabled])', 'input:not([disabled])',
    'select:not([disabled])', 'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])', '[role="button"]', '[role="link"]'
  ].join(', ');
  
  return Array.from(container.querySelectorAll(selectors))
    .filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
}

/**
 * Format number with Russian locale
 * @param {number} num 
 */
export function formatNumber(num) {
  return num.toLocaleString('ru-RU');
}

/**
 * Parse date from input format to display format
 * @param {string} dateStr - YYYY-MM-DD
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}.${month}.${year}`;
}

/**
 * Check if element is in viewport
 * @param {HTMLElement} el 
 * @param {number} threshold - 0-1
 */
export function isInViewport(el, threshold = 0.1) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top <= (window.innerHeight * threshold) &&
    rect.bottom >= (window.innerHeight * (1 - threshold))
  );
}