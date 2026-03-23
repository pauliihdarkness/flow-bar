import React from 'react';

const Badge = ({ children, variant = 'primary', className = '' }) => {
  const variants = {
    primary: 'bg-primary/20 text-primary border-primary/20',
    secondary: 'bg-secondary/20 text-secondary border-secondary/20',
    accent: 'bg-accent/20 text-accent border-accent/20',
    gray: 'bg-white/5 text-gray-400 border-white/10'
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
