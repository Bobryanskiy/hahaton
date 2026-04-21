/**
 * Accessibility utilities for FGIS Sport
 * Handles keyboard navigation, focus management, ARIA updates
 */

// ===== FOCUS MANAGEMENT =====

/**
 * Track focus source (keyboard vs mouse) for conditional focus styles
 */
function initFocusTracking() {
  let isMouse = false;
  
  document.addEventListener('mousedown', () => { isMouse = true; });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      isMouse = false;
      document.body.classList.remove('mouse-focus');
    }
  });
  document.addEventListener('mouseup', () => {
    if (isMouse) {
      document.body.classList.add('mouse-focus');
    }
  });
}

/**
 * Trap focus within a modal/dialog
 * @param {HTMLElement} modal - The modal element
 */
function trapFocus(modal) {
  const focusableElements = modal.querySelectorAll(
    'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  function handleKeydown(e) {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  }

  modal.addEventListener('keydown', handleKeydown);
  
  // Focus first element on open
  setTimeout(() => firstFocusable?.focus(), 100);
  
  return () => modal.removeEventListener('keydown', handleKeydown);
}

// ===== ARIA LIVE ANNOUNCEMENTS =====

/**
 * Announce message to screen readers via aria-live region
 * @param {string} message - Text to announce
 * @param {'polite'|'assertive'} priority - Announcement priority
 */
function announce(message, priority = 'polite') {
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

// ===== KEYBOARD NAVIGATION =====

/**
 * Add arrow key navigation to a list of elements
 * @param {string} selector - CSS selector for container
 * @param {string} itemSelector - CSS selector for items
 */
function initArrowNavigation(containerSelector, itemSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  
  container.addEventListener('keydown', (e) => {
    const items = Array.from(container.querySelectorAll(itemSelector));
    const currentIndex = items.indexOf(document.activeElement);
    
    let nextIndex;
    
    switch(e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        nextIndex = (currentIndex + 1) % items.length;
        items[nextIndex]?.focus();
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        nextIndex = (currentIndex - 1 + items.length) % items.length;
        items[nextIndex]?.focus();
        break;
      case 'Home':
        e.preventDefault();
        items[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        items[items.length - 1]?.focus();
        break;
    }
  });
}

// ===== FORM ACCESSIBILITY =====

/**
 * Add real-time validation with accessible error messages
 * @param {HTMLInputElement} input - The input element
 * @param {Function} validator - Validation function returning {valid, message}
 */
function initAccessibleValidation(input, validator) {
  const errorId = `${input.id}-error`;
  
  // Create error message element
  const errorEl = document.createElement('span');
  errorEl.id = errorId;
  errorEl.className = 'error-message';
  errorEl.setAttribute('role', 'alert');
  input.parentNode.appendChild(errorEl);
  
  // Link input to error message
  input.setAttribute('aria-describedby', errorId);
  
  function validate() {
    const result = validator(input.value);
    
    if (result.valid) {
      input.classList.remove('input-error');
      input.setAttribute('aria-invalid', 'false');
      errorEl.textContent = '';
    } else {
      input.classList.add('input-error');
      input.setAttribute('aria-invalid', 'true');
      errorEl.textContent = result.message;
      announce(result.message, 'assertive');
    }
  }
  
  input.addEventListener('blur', validate);
  input.addEventListener('input', () => {
    if (input.classList.contains('input-error')) validate();
  });
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', () => {
  initFocusTracking();
  
  // Initialize animated counters with accessibility
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    let current = 0;
    const increment = Math.ceil(target / 50);
    const duration = 2000; // 2 seconds
    const stepTime = duration / (target / increment);
    
    function animate() {
      current += increment;
      if (current >= target) {
        el.textContent = target.toLocaleString('ru-RU');
      } else {
        el.textContent = current.toLocaleString('ru-RU');
        requestAnimationFrame(animate);
      }
    }
    
    // Start animation when element is visible
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animate();
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    
    observer.observe(el);
  });
  
  // Initialize arrow navigation for quick links
  initArrowNavigation('.quick-links', '.quick-link-card');
  
  // Initialize validation for search
  const searchInput = document.getElementById('site-search');
  if (searchInput) {
    initAccessibleValidation(searchInput, (value) => {
      if (value.length >= 2) return { valid: true };
      return { valid: false, message: 'Введите минимум 2 символа' };
    });
  }
});

// Export for module usage
export { trapFocus, announce, initArrowNavigation, initAccessibleValidation };