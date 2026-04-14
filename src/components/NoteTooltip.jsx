import React from 'react';

export default function NoteTooltip({ note, children }) {
  if (!note) return <>{children}</>;

  return (
    <div className="tooltip-container">
      {children}
      <div className="tooltip-box">{note}</div>
    </div>
  );
}
