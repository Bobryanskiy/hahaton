/**
 * Filters logic for EKP page
 * Handles filter state, validation, and results update
 */

import { debounce, announce, formatDate } from './utils.js';

export function initFilters(form) {
  // Initialize date range logic
  const dateFrom = form.querySelector('#date-from');
  const dateTo = form.querySelector('#date-to');
  const dateNotSet = form.querySelector('#date-not-set');
  
  if (dateNotSet && dateFrom && dateTo) {
    dateNotSet.addEventListener('change', () => {
      if (dateNotSet.checked) {
        dateFrom.disabled = true;
        dateTo.disabled = true;
        dateFrom.value = '';
        dateTo.value = '';
        announce('Фильтр по дате сброшен. Показаны мероприятия без назначенной даты.');
      } else {
        dateFrom.disabled = false;
        dateTo.disabled = false;
      }
    });
  }
  
  // Sport search with filtering
  const sportSearch = form.querySelector('#filter-sport-search');
  const sportSelect = form.querySelector('#filter-sport');
  
  if (sportSearch && sportSelect) {
    const options = Array.from(sportSelect.querySelectorAll('option'));
    
    sportSearch.addEventListener('input', debounce((e) => {
      const query = e.target.value.toLowerCase().trim();
      
      options.forEach(opt => {
        const text = opt.textContent.toLowerCase();
        opt.hidden = query && !text.includes(query);
      });
      
      // If current selection is hidden, reset
      if (sportSelect.selectedOptions[0]?.hidden) {
        sportSelect.value = '';
      }
      
      announce(`Найдено ${options.filter(o => !o.hidden && o.value).length} видов спорта`);
    }, 200));
  }
  
  // Collapsible filters for mobile
  const toggle = form.closest('.filters-section')?.querySelector('.filters-toggle');
  const panel = form.closest('.filters-panel');
  
  if (toggle && panel) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !expanded);
      panel.hidden = expanded;
      
      // Move focus to first filter when expanding
      if (!expanded) {
        const firstInput = panel.querySelector('input, select, button');
        setTimeout(() => firstInput?.focus(), 100);
      }
    });
  }
}

export function applyFilters(formData) {
  // In real app: send to API, update results
  // For demo: announce changes
  
  const filters = [];
  
  if (formData.get('type')) {
    filters.push(`тип: ${formData.get('type') === 'sport' ? 'спортивные' : 'физкультурные'}`);
  }
  if (formData.get('sport')) {
    const sportName = formData.get('sport');
    filters.push(`вид спорта: ${sportName}`);
  }
  if (formData.get('region')) {
    filters.push(`регион: ${formData.get('region')}`);
  }
  if (formData.get('date_from') || formData.get('date_to')) {
    const from = formatDate(formData.get('date_from'));
    const to = formatDate(formData.get('date_to'));
    filters.push(`дата: ${from || '...'} — ${to || '...'}`);
  }
  if (formData.get('date_not_set')) {
    filters.push('без даты');
  }
  
  const message = filters.length 
    ? `Применены фильтры: ${filters.join(', ')}`
    : 'Показаны все мероприятия';
    
  announce(message, 'polite');
  
  // Update results (placeholder)
  updateResultsList(formData);
}

function updateResultsList(formData) {
  // Placeholder for API call + DOM update
  // In production: fetch(`/api/ekp?${new URLSearchParams(formData)}`)
  
  const list = document.querySelector('.events-list');
  if (!list) return;
  
  // Show loading state
  list.setAttribute('aria-busy', 'true');
  list.innerHTML = '<div class="loading"><span class="loading-spinner"></span> Загрузка...</div>';
  
  // Simulate API delay
  setTimeout(() => {
    list.setAttribute('aria-busy', 'false');
    // Restore or update content here
    announce('Результаты обновлены');
  }, 800);
}