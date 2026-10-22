import React, { useState } from 'react';

export const useDragReorder = (onReorder) => {
  const [dragId, setDragId] = useState(null);
  const dragProps = (id) => ({
    draggable: true,
    onDragStart: (e) => {
      setDragId(id);
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', id); } catch { /* */ }
    },
    onDragOver: (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; },
    onDrop: (e) => {
      e.preventDefault();
      let src = dragId;
      if (!src) { try { src = e.dataTransfer.getData('text/plain'); } catch { /* */ } }
      onReorder(src, id);
      setDragId(null);
    },
    onDragEnd: () => setDragId(null),
  });
  return { dragId, dragProps };
};

export const Countdown = ({ secs, className = '' }) =>
  secs > 0 ? (
    <div
      data-testid="install-countdown"
      className={`pointer-events-none absolute flex items-center justify-center rounded-full bg-black/70 backdrop-blur-md ${className}`}
    >
      <span className="text-3xl font-black tabular-nums text-white">{secs}</span>
    </div>
  ) : null;

export const DraggableTile = ({ id, drag, className = '', children }) => (
  <div
    data-testid={`tile-${id}`}
    {...drag.dragProps(id)}
    className={`relative shrink-0 transition-transform duration-200 ${drag.dragId === id ? 'scale-95 opacity-50' : ''} ${className}`}
  >
    {children}
  </div>
);
