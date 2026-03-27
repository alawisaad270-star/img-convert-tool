import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  as?: React.ElementType;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '', 
  isLoading = false,
  disabled,
  as: Component = 'button',
  ...props 
}) => {
  const baseStyle = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variants = {
    primary: "bg-primary text-white hover:bg-primary-dark focus:ring-primary shadow-sm hover:shadow-md border border-transparent",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-500 border border-transparent",
    outline: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-500 shadow-sm",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900",
  };

  return (
    <Component 
      className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </Component>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-xl p-6 ${onClick ? 'cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all duration-300 group' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export const Label: React.FC<{ children: React.ReactNode; htmlFor?: string; className?: string }> = ({ children, htmlFor, className = '' }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-slate-700 mb-1.5 ${className}`}>
    {children}
  </label>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <input 
    className={`block w-full rounded-lg border-slate-300 border shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 bg-white text-slate-900 placeholder:text-slate-400 transition-colors ${className}`}
    {...props}
  />
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className = '', children, ...props }) => (
  <select 
    className={`block w-full rounded-lg border-slate-300 border shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 bg-white text-slate-900 ${className}`}
    {...props}
  >
    {children}
  </select>
);

export const Badge: React.FC<{ children: React.ReactNode; type?: 'info' | 'success' | 'warning' }> = ({ children, type = 'info' }) => {
  const styles = {
    info: 'bg-blue-50 text-blue-700 ring-blue-700/10',
    success: 'bg-green-50 text-green-700 ring-green-600/20',
    warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${styles[type]}`}>
      {children}
    </span>
  );
};

export const Tabs: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`flex space-x-1 rounded-lg bg-slate-100 p-1 ${className}`}>
    {children}
  </div>
);

export const Tab: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
      active 
        ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' 
        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
    }`}
  >
    {children}
  </button>
);