export const KEYS = {
  ESC: 'Esc',
  LEFT: 'Left',
  UP: 'Up',
  RIGHT: 'Right',
  DOWN: 'Down',
};

// --- Dom Utils ---

// Determine if an HTML element is visible - Faster than CSS check
export function isVisibleFilter(el: HTMLElement) {
  if (!document.body.contains(el)) {
    return false;
  }

  if (el.style.display === 'none') {
    return false;
  }

  const bcr = el.getBoundingClientRect();
  return Boolean(bcr && bcr.height > 0 && bcr.width > 0);
}

export function parentElementByClassName(element: HTMLElement | null, className: string) {
  if (element == null) {
    return;
  }

  let parentElement = element.parentElement;

  while (parentElement?.classList.contains(className) === false) {
    parentElement = parentElement.parentElement;
  }

  return parentElement;
}
