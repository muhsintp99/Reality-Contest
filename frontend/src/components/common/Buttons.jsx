import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  ...props 
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-brandPrimary hover:bg-brandPrimary/90 text-white shadow-sm border border-brandPrimary/10',
    secondary: 'bg-brandSecondary hover:bg-brandSecondary/90 text-white shadow-sm border border-brandSecondary/10',
    accent: 'bg-brandAccent hover:bg-brandAccent/90 text-white shadow-sm border border-brandAccent/10',
    outline: 'bg-transparent border border-lightBorder dark:border-darkBorder hover:bg-lightBg dark:hover:bg-darkSurface text-slate-800 dark:text-white',
    glass: 'glassmorphism border border-white/20 hover:bg-white/20 text-slate-800 dark:text-white',
    ghost: 'bg-transparent hover:bg-lightBg dark:hover:bg-darkSurface text-slate-500 hover:text-slate-800 dark:text-white/70 dark:hover:text-white',
  };

  const sizes = {
    xs: 'px-2.5 py-1 text-[10px] rounded-lg',
    sm: 'px-3.5 py-1.5 text-xs rounded-xl',
    md: 'px-4.5 py-2 text-xs rounded-xl',
    lg: 'px-5 py-2.5 text-sm rounded-xl',
  };

  const buttonContent = (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );

  // Framer Motion animation wrapper
  return (
    <motion.div
      whileHover={{ y: disabled ? 0 : -1 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className="inline-block"
    >
      {buttonContent}
    </motion.div>
  );
};

export default Button;
