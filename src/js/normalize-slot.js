export const normalizeSlot = (name, scope = {}, $slots = {}) => {
    const slot = $slots[name];
    return typeof slot === 'function' ? slot(scope) : slot;
};
