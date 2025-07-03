/**
 * Notification service for displaying user notifications
 */

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationOptions {
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  onClose?: () => void;
  onClick?: () => void;
}

/**
 * Show a notification to the user
 */
export function showNotification({
  type = 'info',
  title,
  message,
  duration = 5000,
  position = 'top-right',
  onClose,
  onClick
}: NotificationOptions): (() => void) | undefined {
  try {
    // Color schemes for different notification types
    const colorSchemes = {
      success: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        icon: '✓'
      },
      error: {
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        icon: '⚠'
      },
      info: {
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        icon: 'ℹ'
      },
      warning: {
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        icon: '⚠'
      }
    };

    const scheme = colorSchemes[type];
    
    // Position styles
    const positionStyles = {
      'top-right': 'top: 20px; right: 20px;',
      'top-left': 'top: 20px; left: 20px;',
      'bottom-right': 'bottom: 20px; right: 20px;',
      'bottom-left': 'bottom: 20px; left: 20px;',
      'top-center': 'top: 20px; left: 50%; transform: translateX(-50%);',
      'bottom-center': 'bottom: 20px; left: 50%; transform: translateX(-50%);'
    };
    
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      ${positionStyles[position]}
      background: ${scheme.background};
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 500;
      max-width: 350px;
      animation: slideIn 0.3s ease-out;
      cursor: pointer;
      user-select: none;
      border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    
    // Add animation keyframes if not already present
    if (!document.querySelector('#notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        @keyframes slideIn {
          from { 
            transform: ${position.includes('right') ? 'translateX(100%)' : 
                        position.includes('left') ? 'translateX(-100%)' : 
                        position.includes('top') ? 'translateY(-100%)' : 
                        'translateY(100%)'};
            opacity: 0; 
          }
          to { 
            transform: ${position.includes('center') ? 'translateX(-50%)' : 'translateX(0)'};
            opacity: 1; 
          }
        }
        @keyframes slideOut {
          from { 
            transform: ${position.includes('center') ? 'translateX(-50%)' : 'translateX(0)'};
            opacity: 1; 
          }
          to { 
            transform: ${position.includes('right') ? 'translateX(100%)' : 
                        position.includes('left') ? 'translateX(-100%)' : 
                        position.includes('top') ? 'translateY(-100%)' : 
                        'translateY(100%)'};
            opacity: 0; 
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 20px; height: 20px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          ${scheme.icon}
        </div>
        <div>
          <div style="font-weight: 600; margin-bottom: 2px;">${title}</div>
          <div style="opacity: 0.9; font-size: 12px; line-height: 1.4;">${message}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove notification after specified duration
    const removeNotification = () => {
      notification.style.animation = 'slideOut 0.3s ease-in forwards';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
          if (onClose) onClose();
        }
      }, 300);
    };
    
    if (duration > 0) {
      setTimeout(removeNotification, duration);
    }
    
    // Allow manual dismissal by clicking
    notification.addEventListener('click', () => {
      if (onClick) onClick();
      removeNotification();
    });
    
    // Return a function to manually close the notification
    return removeNotification;
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}