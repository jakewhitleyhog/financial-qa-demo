import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg~*]:pl-7',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive: 'border-destructive/50 text-destructive bg-destructive/10 [&>svg]:text-destructive',
        success: 'border-green-500/50 text-green-800 bg-green-50 [&>svg]:text-green-600',
        warning: 'border-yellow-500/50 text-yellow-800 bg-yellow-50 [&>svg]:text-yellow-600',
        info: 'border-blue-500/50 text-blue-800 bg-blue-50 [&>svg]:text-blue-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const ICONS = {
  default: AlertCircle,
  destructive: AlertCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
};

function Alert({ className, variant = 'default', children, ...props }) {
  const Icon = ICONS[variant] || AlertCircle;
  return (
    <div role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      <Icon className="h-4 w-4" />
      {children}
    </div>
  );
}

function AlertTitle({ className, ...props }) {
  return (
    <h5 className={cn('mb-1 font-medium leading-none tracking-tight', className)} {...props} />
  );
}

function AlertDescription({ className, ...props }) {
  return (
    <div className={cn('text-sm leading-relaxed', className)} {...props} />
  );
}

export { Alert, AlertTitle, AlertDescription };
