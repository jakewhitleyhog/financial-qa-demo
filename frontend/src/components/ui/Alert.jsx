/**
 * Alert Component
 * Displays important messages and notifications
 */

import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

const alertVariants = {
  default: 'bg-background text-foreground',
  destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
  success: 'border-amber-600/50 text-amber-800 [&>svg]:text-amber-700',
  warning: 'border-yellow-600/50 text-yellow-700 [&>svg]:text-yellow-600',
  info: 'border-amber-600/50 text-amber-800 [&>svg]:text-amber-700',
};

const alertIcons = {
  default: Info,
  destructive: XCircle,
  success: CheckCircle,
  warning: AlertCircle,
  info: Info,
};

export function Alert({ className, variant = 'default', children, ...props }) {
  const Icon = alertIcons[variant];

  return (
    <div
      role="alert"
      className={cn(
        'relative w-full rounded-lg border p-4',
        alertVariants[variant],
        className
      )}
      {...props}
    >
      <div className="flex gap-3">
        <Icon className="h-5 w-5 flex-shrink-0" />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

export function AlertTitle({ className, ...props }) {
  return (
    <h5
      className={cn('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    />
  );
}

export function AlertDescription({ className, ...props }) {
  return (
    <div
      className={cn('text-sm [&_p]:leading-relaxed', className)}
      {...props}
    />
  );
}

export default Alert;
