export const normalizeSlot = (name: string, scope: {} = {}, $slots: any = {}) => {
  const slot = $slots[name];
  return typeof slot === 'function' ? slot(scope) : slot;
};
