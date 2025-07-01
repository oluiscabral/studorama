import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-2xl',
    md: 'w-12 h-12 text-4xl',
    lg: 'w-16 h-16 text-5xl'
  };

  return (
    <div className={`${sizeClasses[size]} bg-primary-500 rounded-xl flex items-center justify-center font-bold text-white border-2 border-white shadow-lg ${className}`}>
      S
    </div>
  );
}