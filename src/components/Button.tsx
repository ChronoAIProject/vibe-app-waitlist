import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'btn min-h-[52px] px-6 rounded-[99px] font-semibold text-base transition-all duration-[200ms] flex items-center justify-center gap-2 focus:outline-none';
  
  const variantClasses = {
    primary: 'bg-black text-white active:opacity-80 active:scale-[0.98]',
    secondary: 'bg-white text-black border border-black active:opacity-80 active:scale-[0.98]',
    text: 'bg-transparent text-black underline-offset-4 active:opacity-80'
  };

  const disabledClasses = 'opacity-40 cursor-not-allowed pointer-events-none';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${disabled || isLoading ? disabledClasses : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

