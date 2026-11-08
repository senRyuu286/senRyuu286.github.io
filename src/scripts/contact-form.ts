type Field = HTMLInputElement | HTMLTextAreaElement;

const ERROR_TEXT: Record<string, string> = {
  name: 'Enter your name.',
  email: 'Enter a valid email address.',
  message: 'Write a message.',
};

function serverFieldNames(data: unknown): string[] | null {
  if (typeof data !== 'object' || data === null || !('errors' in data) || !Array.isArray(data.errors)) {
    return null;
  }
  return data.errors.flatMap((entry: unknown) =>
    typeof entry === 'object' && entry !== null && 'field' in entry && typeof entry.field === 'string'
      ? [entry.field]
      : [],
  );
}

function replay(element: HTMLElement, className: string): void {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}

type Tone = 'none' | 'success' | 'failure';

function init(): void {
  const form = document.querySelector<HTMLFormElement>('#contact-form');
  const status = document.querySelector<HTMLElement>('[data-contact-status]');
  const statusText = status?.querySelector<HTMLElement>('[data-status-text]');
  const statusIcon = status?.querySelector<SVGElement>('[data-status-icon]');
  const submit = document.querySelector<HTMLButtonElement>('[data-contact-submit]');
  if (!form || !status || !statusText || !statusIcon || !submit) return;

  const fields = Array.from(form.querySelectorAll<Field>('input[required], textarea[required]'));

  form.noValidate = true;

  function errorSlot(field: Field): HTMLElement | null {
    return document.querySelector<HTMLElement>(`[data-error-for="${field.name}"]`);
  }

  function showFieldError(field: Field): void {
    const slot = errorSlot(field);
    if (slot) slot.textContent = ERROR_TEXT[field.name] ?? 'Check this field.';
    field.setAttribute('aria-invalid', 'true');
  }

  function clearFieldError(field: Field): void {
    const slot = errorSlot(field);
    if (slot) slot.textContent = '';
    field.removeAttribute('aria-invalid');
  }

  function checkField(field: Field): boolean {
    const blank = field.value.trim() === '';
    if (!blank && field.validity.valid) {
      clearFieldError(field);
      return true;
    }
    showFieldError(field);
    return false;
  }

  function setStatus(message: string, tone: Tone): void {
    statusText!.textContent = message;
    statusIcon!.classList.toggle('hidden', tone !== 'success');
    status!.classList.toggle('text-error', tone === 'failure');
    if (message !== '') replay(status!, 'status-pop');
  }

  const successText = form.dataset.success ?? '';
  const failureText = form.dataset.failure ?? '';
  const sendLabel = submit.textContent ?? 'Send message';
  let sending = false;

  for (const field of fields) {
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') checkField(field);
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;

    setStatus('', 'none');
    const invalid = fields.filter((field) => !checkField(field));
    if (invalid.length > 0) {
      invalid.forEach((field) => replay(field, 'field-shake'));
      invalid[0]?.focus();
      return;
    }

    sending = true;
    submit.setAttribute('aria-disabled', 'true');
    submit.textContent = 'Sending…';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        form.reset();
        setStatus(successText, 'success');
      } else {
        const data: unknown = await response.json().catch(() => null);
        const names = serverFieldNames(data) ?? [];
        const rejected = fields.filter((field) => names.includes(field.name));
        if (rejected.length > 0) {
          rejected.forEach(showFieldError);
          rejected.forEach((field) => replay(field, 'field-shake'));
          rejected[0]?.focus();
        } else {
          setStatus(failureText, 'failure');
        }
      }
    } catch {
      setStatus(failureText, 'failure');
    } finally {
      sending = false;
      submit.removeAttribute('aria-disabled');
      submit.textContent = sendLabel;
    }
  });
}

init();