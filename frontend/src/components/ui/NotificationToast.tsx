import { useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

interface NotificationToastProps {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  duration?: number;
}

const notificationConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    textColor: 'text-green-900 dark:text-green-100',
    iconColor: 'text-green-600',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    textColor: 'text-yellow-900 dark:text-yellow-100',
    iconColor: 'text-yellow-600',
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-900 dark:text-red-100',
    iconColor: 'text-red-600',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-900 dark:text-blue-100',
    iconColor: 'text-blue-600',
  },
};

export const showNotification = (
  type: 'success' | 'warning' | 'error' | 'info',
  message: string,
  duration: number = 3000
) => {
  const config = notificationConfig[type];
  const Icon = config.icon;

  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 ${config.bgColor} border ${config.borderColor} rounded-lg p-4 shadow-lg animate-slide-in`;
  
  notification.innerHTML = `
    <div class="flex items-center space-x-2">
      <svg class="w-5 h-5 ${config.iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        ${type === 'success' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>' :
          type === 'warning' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>' :
          type === 'error' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>' :
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'}
      </svg>
      <span class="${config.textColor} font-medium">${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), duration);
};

const NotificationToast: React.FC<NotificationToastProps> = ({
  type,
  message,
  duration = 3000,
}) => {
  const config = notificationConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      // Component will unmount
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 ${config.bgColor} border ${config.borderColor} rounded-lg p-4 shadow-lg`}
    >
      <div className="flex items-center space-x-2">
        <Icon className={`w-5 h-5 ${config.iconColor}`} />
        <span className={`${config.textColor} font-medium`}>{message}</span>
      </div>
    </div>
  );
};

export default NotificationToast;

