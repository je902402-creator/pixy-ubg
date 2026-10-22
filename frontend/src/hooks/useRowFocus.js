import { useEffect, useState } from 'react';

// Keeps a focused item in a horizontal row with arrow-key + Enter navigation.
export const useRowFocus = (items, onLaunch, enabled) => {
  const [focusId, setFocusId] = useState(null);
  const focus = items.find((s) => s.id === focusId) || items[0] || null;

  useEffect(() => {
    if (!enabled) return undefined;
    const handler = (e) => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || !focus) return;
      const idx = items.findIndex((s) => s.id === focus.id);
      if (e.key === 'ArrowRight' && idx < items.length - 1) setFocusId(items[idx + 1].id);
      else if (e.key === 'ArrowLeft' && idx > 0) setFocusId(items[idx - 1].id);
      else if (e.key === 'Enter') onLaunch(focus);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [items, focus, onLaunch, enabled]);

  return { focus, setFocusId };
};
