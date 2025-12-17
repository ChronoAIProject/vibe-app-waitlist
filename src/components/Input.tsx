import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  required,
  ...props
}) => {
  return (
    <div className="w-full mb-[12px]">
      {label && (
        <label className="block text-sm font-medium text-black mb-[8px]">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        className={`
          w-full min-h-[52px] px-4 rounded-[99px] border
          ${error ? 'border-red-500' : 'border-black'}
          focus:outline-none
          placeholder:text-gray-400 text-base
          transition-all duration-[200ms]
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

