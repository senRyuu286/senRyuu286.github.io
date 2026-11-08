document.querySelectorAll<HTMLElement>('[data-experience]').forEach((entry) => {
  const photos = Array.from(entry.querySelectorAll<HTMLElement>('[data-experience-photo]'));
  const photoControls = entry.querySelector<HTMLElement>('[data-photo-controls]');
  const previousPhoto = entry.querySelector<HTMLButtonElement>('[data-photo-prev]');
  const nextPhoto = entry.querySelector<HTMLButtonElement>('[data-photo-next]');
  const photoPosition = entry.querySelector<HTMLElement>('[data-photo-position]');
  let activePhoto = 0;
  const showPhoto = (index: number) => {
    if (!previousPhoto || !nextPhoto || !photoPosition) return;
    activePhoto = Math.max(0, Math.min(photos.length - 1, index));
    photos.forEach((photo, photoIndex) => { photo.hidden = photoIndex !== activePhoto; });
    previousPhoto.disabled = activePhoto === 0;
    nextPhoto.disabled = activePhoto === photos.length - 1;
    photoPosition.textContent = `${activePhoto + 1} / ${photos.length}`;
  };
  if (photos.length > 1 && photoControls && previousPhoto && nextPhoto && photoPosition) {
    previousPhoto.addEventListener('click', () => showPhoto(activePhoto - 1));
    nextPhoto.addEventListener('click', () => showPhoto(activePhoto + 1));
    showPhoto(0);
    photoControls.hidden = false;
  }
  const details = entry.querySelector<HTMLDetailsElement>('[data-experience-details]');
  const summary = details?.querySelector<HTMLElement>('summary');
  const story = details?.querySelector<HTMLElement>('[data-experience-story]');
  const dialog = entry.querySelector<HTMLDialogElement>('[data-experience-dialog]');
  const content = dialog?.querySelector<HTMLElement>('[data-experience-dialog-content]');
  const close = dialog?.querySelector<HTMLButtonElement>('[data-experience-close]');
  if (!details || !summary || !story || !dialog || !content || !close || typeof dialog.showModal !== 'function') return;

  summary.setAttribute('aria-haspopup', 'dialog');
  summary.addEventListener('click', (event) => {
    event.preventDefault();
    if (photos.length > 1) showPhoto(0);
    content.append(story);
    dialog.showModal();
    content.scrollTop = 0;
    close.focus();
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    details.append(story);
    summary.focus();
  });
});
