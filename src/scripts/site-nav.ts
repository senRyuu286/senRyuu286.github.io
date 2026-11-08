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

  window.matchMedia('(min-width: 768px)').addEventListener('change', (event) => {
    if (event.matches) menu.open = false;
  });
}