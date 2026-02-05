import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const accessibleButtonVariants = cva(
  // Base styles with strong focus states for accessibility
  [
    'inline-flex items-center justify-center gap-2',
    'rounded-md text-sm font-medium',
    'transition-all duration-200',
    // Focus states - WCAG 2.1 compliant
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-primary focus-visible:ring-offset-background',
    // Disabled states
    'disabled:pointer-events-none disabled:opacity-50',
    // Touch targets - minimum 44x44px for mobile
    'min-h-[44px] min-w-[44px] px-4 py-2',
    // Hover/active states
    'hover:scale-[1.02] active:scale-[0.98]',
  ],
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-4 py-2',
        sm: 'h-9 min-h-[36px] px-3 text-xs',
        lg: 'h-12 min-h-[48px] px-8 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface AccessibleButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof accessibleButtonVariants> {
  loading?: boolean;
  loadingText?: string;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ className, variant, size, loading, loadingText, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(accessibleButtonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="sr-only">Loading</span>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {loadingText && <span>{loadingText}</span>}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';
