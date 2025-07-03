import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { useTheme } from '../../hooks';

export interface IconButtonProps {
  icon: typeof LucideIcon;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  'aria-label'?: string;
  title?: string;
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
}

export default function IconButton({
  icon: Icon,
  onClick,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  'aria-label': ariaLabel,
  title,
  type = 'button',
  style,
  ...props
}: IconButtonProps) {
  const { themeConfig } = useTheme();

  // Size configurations with proper alignment
  const sizeConfig = {
    xs: {
      button: 'w-6 h-6 min-w-[24px] min-h-[24px]',
      icon: 'w-3 h-3',
      padding: 'p-1.5'
    },
    sm: {
      button: 'w-8 h-8 min-w-[32px] min-h-[32px]',
      icon: 'w-4 h-4',
      padding: 'p-2'
    },
    md: {
      button: 'w-10 h-10 min-w-[40px] min-h-[40px]',
      icon: 'w-5 h-5',
      padding: 'p-2.5'
    },
    lg: {
      button: 'w-12 h-12 min-w-[48px] min-h-[48px]',
      icon: 'w-6 h-6',
      padding: 'p-3'
    },
    xl: {
      button: 'w-14 h-14 min-w-[56px] min-h-[56px]',
      icon: 'w-7 h-7',
      padding: 'p-3.5'
    }
  };

  // Variant configurations
  const variantConfig = {
    primary: {
      background: themeConfig.colors.primary,
      color: '#ffffff',
      hover: themeConfig.colors.primaryHover,
      border: 'transparent'
    },
    secondary: {
      background: themeConfig.colors.secondary,
      color: '#ffffff',
      hover: themeConfig.colors.secondary + 'DD',
      border: 'transparent'
    },
    ghost: {
      background: 'transparent',
      color: themeConfig.colors.textSecondary,
      hover: themeConfig.colors.surface,
      border: 'transparent'
    },
    danger: {
      background: themeConfig.colors.error,
      color: '#ffffff',
      hover: themeConfig.colors.error + 'DD',
      border: 'transparent'
    },
    success: {
      background: themeConfig.colors.success,
      color: '#ffffff',
      hover: themeConfig.colors.success + 'DD',
      border: 'transparent'
    },
    warning: {
      background: themeConfig.colors.warning,
      color: '#ffffff',
      hover: themeConfig.colors.warning + 'DD',
      border: 'transparent'
    },
    info: {
      background: themeConfig.colors.info,
      color: '#ffffff',
      hover: themeConfig.colors.info + 'DD',
      border: 'transparent'
    }
  };

  const currentSize = sizeConfig[size];
  const currentVariant = variantConfig[variant];

  const buttonStyle: React.CSSProperties = {
    backgroundColor: currentVariant.background,
    color: currentVariant.color,
    borderColor: currentVariant.border,
    ...style
  };

  const hoverStyle = `
    &:hover:not(:disabled) {
      background-color: ${currentVariant.hover} !important;
    }
  `;

  return (
    <>
      <style>{hoverStyle}</style>
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={`
          ${currentSize.button}
          ${currentSize.padding}
          rounded-lg
          border
          transition-all
          duration-200
          ease-in-out
          focus:outline-none
          focus:ring-2
          focus:ring-offset-2
          disabled:opacity-50
          disabled:cursor-not-allowed
          flex
          items-center
          justify-center
          flex-shrink-0
          touch-target
          ${className}
        `}
        style={buttonStyle}
        aria-label={ariaLabel}
        title={title}
        {...props}
      >
        {loading ? (
          <div className={`${currentSize.icon} animate-spin`}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                className="opacity-25"
              />
              <path
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                className="opacity-75"
              />
            </svg>
          </div>
        ) : (
          <Icon className={`${currentSize.icon} flex-shrink-0`} />
        )}
      </button>
    </>
  );
}