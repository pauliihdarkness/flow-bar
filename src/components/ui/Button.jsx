import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  disabled = false,
  fullWidth = false,
  ...props
}) => {
  const baseStyles = 'px-6 py-3 rounded-2xl font-semibold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-red-600',
    secondary: 'bg-white/10 text-white backdrop-blur-md hover:bg-white/20 border border-white/5',
    accent: 'bg-accent text-dark hover:brightness-110 shadow-lg shadow-accent/20',
    outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary/10'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      {...props}
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
