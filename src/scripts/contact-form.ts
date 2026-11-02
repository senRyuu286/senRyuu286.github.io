type Field = HTMLInputElement | HTMLTextAreaElement;

// Short on purpose, so each message fits on one line and the page never shifts.
const ERROR_TEXT: Record<string, string> = {
  name: 'Enter your name.',
  email: 'Enter a valid email address.',
  message: 'Write a message.',
};

/** Field names Formspree reports in a validation error, or null if the reply has none. */
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

/**
 * Plays a one-shot CSS animation again, even if it is still running.
 * Remove the class, read a layout value (this makes the browser apply the removal now), then add the class back.
 * Reading offsetWidth costs almost nothing here: the form is tiny and this runs at most once per button press.
 */
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

  // The script shows its own messages, so switch off the browser's pop-up bubbles.
  // Without JavaScript the bubbles still work, because this line never runs.
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

  /** True when the field is fine. Shows its error and returns false when it is not. */
  function checkField(field: Field): boolean {
    const blank = field.value.trim() === '';
    if (!blank && field.validity.valid) {
      clearFieldError(field);
      return true;
    }
    showFieldError(field);
    return false;
  }

  /**
   * Writes the message once and plays the pop. The pop only changes how the box looks, never its text,
   * so a screen reader hears the message one time. Only the text span changes, so the check mark survives.
   */
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
    // Once a field shows an error, re-check it while the person types so the error clears at once.
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
      // One short shake per field that needs fixing. Only a Send attempt shakes, never typing or leaving a field.
      invalid.forEach((field) => replay(field, 'field-shake'));
      invalid[0]?.focus();
      return;
    }

    sending = true;
    // aria-disabled (not disabled) keeps keyboard focus on the button while sending.
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