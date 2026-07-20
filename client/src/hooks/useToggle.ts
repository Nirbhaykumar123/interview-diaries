import { useState, useCallback } from 'react';

/**
 * Reusable hook to handle boolean toggles (Modals, Collapsible Drawers).
 * Memoizes callbacks using useCallback to prevent unnecessary child re-renders.
 */
export default function useToggle(initialValue = false): [boolean, () => void, (val: boolean) => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((v) => !v);
  }, []);

  const setToggleValue = useCallback((val: boolean) => {
    setValue(val);
  }, []);

  return [value, toggle, setToggleValue];
}
