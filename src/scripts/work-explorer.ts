import { isWorkType, matches, type FilterState, type Filterable } from '../lib/filter';

interface Item extends Filterable {
  row: HTMLElement;
}

// The 120ms fade from file 03. Reduced motion is switched off globally in global.css.
const FADE_IN = ['animate-in', 'fade-in', 'duration-120', 'ease-enter'];

function init(): void {
  const controls = document.querySelector<HTMLElement>('[data-work-controls]');
  const search = document.querySelector<HTMLInputElement>('[data-work-search]');
  const status = document.querySelector<HTMLElement>('[data-work-status]');
  const empty = document.querySelector<HTMLElement>('[data-work-empty]');
  const clear = document.querySelector<HTMLButtonElement>('[data-work-clear]');
  const chips = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-work-chip]'));
  const rows = Array.from(document.querySelectorAll<HTMLElement>('[data-work-row]'));

  if (!controls || !search || !status || !empty || !clear || rows.length === 0) return;

  const items: Item[] = rows.flatMap((row) => {
    const type = row.dataset.type;
    return isWorkType(type) ? [{ row, type, searchText: row.dataset.search ?? '' }] : [];
  });

  const state: FilterState = { query: '', type: null };

  function apply(): void {
    const newlyShown: HTMLElement[] = [];
    let visible = 0;

    for (const item of items) {
      const show = matches(item, state);
      if (show) visible += 1;
      if (show && item.row.hidden) {
        item.row.classList.remove(...FADE_IN);
        newlyShown.push(item.row);
      }
      item.row.hidden = !show;
    }

    // Add the fade classes one frame later so the animation restarts every time.
    requestAnimationFrame(() => {
      for (const row of newlyShown) row.classList.add(...FADE_IN);
    });

    status!.textContent = `Showing ${visible} of ${items.length} item${items.length === 1 ? '' : 's'}`;
    empty!.hidden = visible > 0;
  }

  function setPressed(active: HTMLButtonElement | undefined): void {
    for (const chip of chips) chip.setAttribute('aria-pressed', String(chip === active));
  }

  for (const chip of chips) {
    chip.addEventListener('click', () => {
      const value = chip.dataset.type;
      state.type = isWorkType(value) ? value : null;
      setPressed(chip);
      apply();
    });
  }

  search.addEventListener('input', () => {
    state.query = search.value;
    apply();
  });

  clear.addEventListener('click', () => {
    state.query = '';
    state.type = null;
    search.value = '';
    setPressed(chips.find((chip) => !isWorkType(chip.dataset.type)));
    apply();
    search.focus();
  });

  controls.hidden = false;
  apply();
}

init();