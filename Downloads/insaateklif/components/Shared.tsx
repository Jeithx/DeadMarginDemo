import React from 'react';
import { VerificationTier, CategoryType } from '../types';
import { CheckCircle, Shield, Hammer, Users, AlertCircle, FileText } from 'lucide-react';

// --- Badges ---

export const VerificationBadge: React.FC<{ tier: VerificationTier; showLabel?: boolean }> = ({ tier, showLabel = true }) => {
  switch (tier) {
    case VerificationTier.TIER_1_COMPANY:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
          <Shield className="w-3 h-3 fill-yellow-500 text-yellow-600" />
          {showLabel && "Onaylı Firma"}
        </span>
      );
    case VerificationTier.TIER_2_INDIVIDUAL:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-300">
          <CheckCircle className="w-3 h-3 text-slate-500" />
          {showLabel && "Onaylı Usta"}
        </span>
      );
    case VerificationTier.TIER_3_COMMUNITY:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-800 border border-orange-200">
          <Users className="w-3 h-3 text-orange-500" />
          {showLabel && "Topluluk Onaylı"}
        </span>
      );
    default:
      return null;
  }
};

export const CategoryBadge: React.FC<{ category: CategoryType }> = ({ category }) => {
  const colorMap: Record<CategoryType, string> = {
    [CategoryType.STRUCTURAL]: 'bg-stone-100 text-stone-800 border-stone-200',
    [CategoryType.FINISHING]: 'bg-teal-50 text-teal-700 border-teal-200',
    [CategoryType.MECHANICAL]: 'bg-blue-50 text-blue-700 border-blue-200',
    [CategoryType.ELECTRICAL]: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    [CategoryType.EXTERIOR]: 'bg-green-50 text-green-700 border-green-200',
    [CategoryType.OTHER]: 'bg-gray-100 text-gray-700 border-gray-200'
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${colorMap[category]}`}>
      {category}
    </span>
  );
};

// --- Form Elements ---

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className, ...props }) => (
  <div className="flex flex-col gap-1.5 mb-4 w-full">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <input 
      className={`border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all w-full placeholder:text-gray-400 ${className}`} 
      {...props} 
    />
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }> = ({ label, children, ...props }) => (
  <div className="flex flex-col gap-1.5 mb-4 w-full">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <select 
      className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white w-full"
      {...props}
    >
      {children}
    </select>
  </div>
);

// --- Modal ---

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  
  const sizeClasses = {
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col`}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
            <span className="text-2xl leading-none">&times;</span>
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Empty State ---

export const EmptyState: React.FC<{ message: string; subMessage?: string }> = ({ message, subMessage }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
       <FileText className="w-8 h-8 text-gray-400" />
    </div>
    <p className="text-gray-900 font-medium text-lg text-center">{message}</p>
    {subMessage && <p className="text-gray-500 text-sm mt-1 text-center max-w-sm">{subMessage}</p>}
  </div>
);

// --- Button ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className, ...props }) => {
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-500/20',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 shadow-sm shadow-secondary-500/20',
    outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button 
      className={`rounded-lg font-medium transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 ${variants[variant]} ${sizes[size]} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};
