import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  duration = 2000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    // Auto dismiss after duration
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      // Wait for exit animation to complete before calling onClose
      setTimeout(() => {
        onClose();
      }, 300); // Match animation duration
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-green-50 border-green-200 text-green-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case 'error':
        return (
          <svg
            className="w-5 h-5 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      case 'info':
        return (
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`fixed top-4 left-1/2 z-50 w-[90%] max-w-md transition-all duration-300 ${
        isExiting
          ? 'opacity-0 -translate-y-2'
          : isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-2'
      }`}
      style={{
        transform: isExiting
          ? 'translateX(-50%) translateY(-8px)'
          : isVisible
          ? 'translateX(-50%) translateY(0)'
          : 'translateX(-50%) translateY(-8px)',
      }}
    >
      <div
        className={`${getTypeStyles()} rounded-xl px-4 py-3 border shadow-lg flex items-center gap-3`}
      >
        {getIcon()}
        <p className="text-sm font-medium flex-1">{message}</p>
      </div>
    </div>
  );
};

