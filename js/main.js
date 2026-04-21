/**
 * Скрипт управления доступностью ФГИС «Спорт»
 * Соответствует: ГОСТ Р 52872-2019, Постановлению №102, WCAG 2.1 AA
 */
document.addEventListener('DOMContentLoaded', () => {
  const liveRegion = document.getElementById('live-region');

  // 1. Анонс загрузки страницы для скринридеров (NVDA/JAWS)
  if (liveRegion) {
    liveRegion.textContent = 'Страница загружена. Используйте Tab для навигации, Enter или Пробел для активации ссылок.';
  }

  // 2. Клавиатурное управление кастомными интерактивными элементами
  // Решает проблему React-компонентов, теряющих фокус при навигации (Чек-лист, п. 7)
  const interactiveElements = document.querySelectorAll('[tabindex="0"], article[role="article"]');
  
  interactiveElements.forEach(el => {
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); // Предотвращаем прокрутку страницы на Space
        const link = el.querySelector('a');
        if (link) {
          link.click();
        } else {
          el.click();
        }
      }
    });
  });

  // 3. Утилита для динамического контента (SPA, AJAX, фильтры)
  // Вызывайте: window.announceToSR('Результаты обновлены')
  window.announceToSR = (message) => {
    if (!liveRegion) return;
    // Очистка и повторная установка текста гарантируют озвучку при идентичных сообщениях
    liveRegion.textContent = '';
    requestAnimationFrame(() => {
      liveRegion.textContent = message;
    });
  };

  // 4. Перехват фокуса при загрузке (если в URL есть #main)
  if (window.location.hash === '#main') {
    const main = document.getElementById('main');
    if (main) {
      setTimeout(() => main.focus(), 100);
    }
  }
});