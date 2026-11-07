const carousel = document.querySelector<HTMLElement>('[data-certificate-carousel]');
const list = carousel?.querySelector<HTMLElement>('[data-certificate-list]');
const controls = carousel?.querySelector<HTMLElement>('[data-certificate-controls]');
const previous = controls?.querySelector<HTMLButtonElement>('[data-certificate-prev]');
const next = controls?.querySelector<HTMLButtonElement>('[data-certificate-next]');
const position = controls?.querySelector<HTMLElement>('[data-certificate-position]');
const slides = Array.from(carousel?.querySelectorAll<HTMLElement>('[data-certificate]') ?? []);

if (list && controls && previous && next && position && slides.length > 1) {
  const previousButton = previous;
  const nextButton = next;
  const counter = position;
  let active = 0;

  const show = (index: number) => {
    active = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((slide, slideIndex) => {
      const inactive = slideIndex !== active;
      slide.toggleAttribute('data-active', !inactive);
      slide.toggleAttribute('data-inactive', inactive);
      slide.toggleAttribute('inert', inactive);
      if (inactive) slide.setAttribute('aria-hidden', 'true');
      else slide.removeAttribute('aria-hidden');
    });
    previousButton.disabled = active === 0;
    nextButton.disabled = active === slides.length - 1;
    counter.textContent = `${active + 1} / ${slides.length}`;
  };
  previousButton.addEventListener('click', () => show(active - 1));
  nextButton.addEventListener('click', () => show(active + 1));
  list.setAttribute('data-enhanced', '');
  show(0);
  controls.hidden = false;
}
