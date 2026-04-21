/**
 * Main entry point for FGIS Sport
 * Initializes components, event listeners, accessibility features
 */

import { announce, debounce, getFocusableElements, formatNumber } from './utils.js';
import { initAccessibleValidation, trapFocus } from './a11y.js';
import { initFilters, applyFilters } from './filters.js';

// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', () => {
  initAccessibility();
  initComponents();
  initNavigation();
  initForms();
  initDynamicContent();
});

// ===== ACCESSIBILITY INIT =====
function initAccessibility() {
  // Track focus source for conditional focus styles
  let isMouse = false;
  document.addEventListener('mousedown', () => { isMouse = true; });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      isMouse = false;
      document.body.classList.remove('mouse-focus');
    }
  });
  document.addEventListener('mouseup', () => {
    if (isMouse) document.body.classList.add('mouse-focus');
  });

  // Initialize high-contrast toggle (Постановление № 102)
  initA11yToggle();

  // Initialize skip link focus management
  const skipLink = document.querySelector('.skip-link');
  if (skipLink) {
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const main = document.getElementById('main-content');
      main?.focus();
      announce('Переход к основному контенту');
    });
  }
}

// ===== VERSION FOR VISUALLY IMPAIRED (Постановление № 102) =====
function initA11yToggle() {
  const toggle = document.querySelector('[data-a11y-toggle]');
  const STORAGE_KEY = 'fgis-a11y-mode';
  
  if (!toggle) return;
  
  // Restore saved preference
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'true') enableA11yMode();
  
  toggle.addEventListener('click', () => {
    const isActive = document.body.classList.contains('a11y-mode');
    
    if (isActive) {
      disableA11yMode();
      localStorage.setItem(STORAGE_KEY, 'false');
      toggle.setAttribute('aria-pressed', 'false');
      announce('Версия для слабовидящих отключена');
    } else {
      enableA11yMode();
      localStorage.setItem(STORAGE_KEY, 'true');
      toggle.setAttribute('aria-pressed', 'true');
      announce('Версия для слабовидящих включена. Шрифт увеличен, контраст повышен.');
    }
  });
  
  function enableA11yMode() {
    document.body.classList.add('a11y-mode');
    // Increase base font size
    document.documentElement.style.fontSize = '125%';
    // Force high contrast
    document.body.style.setProperty('--color-text', '#000000');
    document.body.style.setProperty('--color-bg', '#FFFFFF');
    document.body.style.setProperty('--color-primary', '#000080');
    // Remove decorative elements
    document.querySelectorAll('.hero, .stats-grid, .sport-card').forEach(el => {
      el.style.background = 'none';
      el.style.boxShadow = 'none';
    });
  }
  
  function disableA11yMode() {
    document.body.classList.remove('a11y-mode');
    document.documentElement.style.fontSize = '';
    document.body.style.removeProperty('--color-text');
    document.body.style.removeProperty('--color-bg');
    document.body.style.removeProperty('--color-primary');
    // Restore decorative elements via CSS classes
  }
}

// ===== COMPONENTS INIT =====
function initComponents() {
  // Animated counters with accessibility
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateCount(el, target);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    observer.observe(el);
  });
  
  // Mobile menu toggle
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !expanded);
      mobileMenu.hidden = expanded;
      if (!expanded) {
        // Focus first menu item
        const firstLink = mobileMenu.querySelector('a');
        firstLink?.focus();
      }
    });
  }
}

function animateCount(el, target) {
  let current = 0;
  const increment = Math.ceil(target / 50);
  const duration = 2000;
  const stepTime = duration / (target / increment);
  
  function step() {
    current += increment;
    if (current >= target) {
      el.textContent = formatNumber(target);
    } else {
      el.textContent = formatNumber(current);
      requestAnimationFrame(step);
    }
  }
  step();
}

// ===== NAVIGATION =====
function initNavigation() {
  // Arrow navigation for quick links
  const quickLinks = document.querySelector('.quick-links');
  if (quickLinks) {
    quickLinks.addEventListener('keydown', (e) => {
      const items = Array.from(quickLinks.querySelectorAll('.quick-link-card'));
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
      }
    });
  }
}

// ===== FORMS =====
function initForms() {
  // Search validation
  const searchInput = document.getElementById('site-search');
  if (searchInput) {
    initAccessibleValidation(searchInput, (value) => {
      if (value.trim().length >= 2) return { valid: true };
      return { valid: false, message: 'Введите минимум 2 символа для поиска' };
    });
    
    // Debounced search
    const debouncedSearch = debounce((value) => {
      if (value.trim().length >= 2) {
        // Could trigger AJAX search here
        announce(`Найдено результатов: ...`, 'polite');
      }
    }, 300);
    
    searchInput.addEventListener('input', (e) => debouncedSearch(e.target.value));
  }
  
  // Filter form (on EKP page)
  const filterForm = document.getElementById('ekp-filters');
  if (filterForm) {
    initFilters(filterForm);
    filterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      applyFilters(new FormData(filterForm));
      announce('Фильтры применены. Результаты обновлены.');
    });
  }
}

// ===== DYNAMIC CONTENT =====
function initDynamicContent() {
  // Handle SPA-like navigation announcements
  if ('performance' in window && 'navigation' in performance) {
    performance.getEntriesByType('navigation').forEach(nav => {
      if (nav.type === 'navigate') {
        const title = document.title;
        setTimeout(() => {
          announce(`Страница: ${title}`);
          // Move focus to main content after navigation
          document.getElementById('main-content')?.focus();
        }, 500);
      }
    });
  }
}