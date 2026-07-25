import React from 'react';

export const InitializationOverlay: React.FC = () => (
  <div className="fixed inset-0 z-50 bg-white/90 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);
