/**
 * Mobile menu helpers. The menu is a native <details> element, so it already
 * opens and closes without this script. This only adds the extras people expect:
 * Escape, outside click, closing after a link, and closing when the screen grows.
 */
const menu = document.querySelector<HTMLDetailsElement>('[data-nav-menu]');

if (menu) {
  const button = menu.querySelector('summary');

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.open) {
      menu.open = false;
      button?.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (menu.open && event.target instanceof Node && !menu.contains(event.target)) {
      menu.open = false;
    }
  });

  menu.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('a')) {
      menu.open = false;
    }
  });

  // Rotating a tablet past 768px hides the menu, so do not leave it open behind the scenes.
  window.matchMedia('(min-width: 768px)').addEventListener('change', (event) => {
    if (event.matches) menu.open = false;
  });
}