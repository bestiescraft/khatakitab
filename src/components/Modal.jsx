import React from 'react';

export default function Modal({ open, onClose, title, children, testID }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center animate-fadeIn"
      onClick={onClose}
      data-testid={testID ? `${testID}-overlay` : undefined}
    >
      <div
        className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 pb-8 max-h-[90vh] overflow-y-auto animate-slideUp scroll-hide"
        onClick={(e) => e.stopPropagation()}
        data-testid={testID}
      >
        <div className="mx-auto w-12 h-1.5 rounded-full bg-gray-300 mb-4 sm:hidden" />
        {title && <h2 className="text-lg font-bold text-center mb-4">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
