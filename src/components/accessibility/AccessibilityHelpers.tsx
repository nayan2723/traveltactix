import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SkipLinkProps {
  href?: string;
  children?: ReactNode;
}

/**
 * Skip link for keyboard navigation accessibility.
 * Allows users to skip directly to main content.
 */
export const SkipLink = ({ 
  href = '#main-content', 
  children = 'Skip to main content' 
}: SkipLinkProps) => (
  <a
    href={href}
    className={cn(
      'sr-only focus:not-sr-only',
      'fixed top-4 left-4 z-[100]',
      'bg-primary text-primary-foreground',
      'px-4 py-2 rounded-md font-medium',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
      'transition-transform focus:translate-y-0 -translate-y-20'
    )}
  >
    {children}
  </a>
);

interface VisuallyHiddenProps {
  children: ReactNode;
}

/**
 * Visually hidden content for screen readers only.
 */
export const VisuallyHidden = ({ children }: VisuallyHiddenProps) => (
  <span className="sr-only">{children}</span>
);

interface LiveRegionProps {
  children: ReactNode;
  mode?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  className?: string;
}

/**
 * Live region for announcing dynamic content changes to screen readers.
 */
export const LiveRegion = ({ 
  children, 
  mode = 'polite',
  atomic = true,
  className 
}: LiveRegionProps) => (
  <div 
    role="status" 
    aria-live={mode} 
    aria-atomic={atomic}
    className={cn('sr-only', className)}
  >
    {children}
  </div>
);

/**
 * Indicator for when a section is loading (for screen readers).
 */
export const LoadingAnnouncer = ({ loading, label = 'Loading' }: { loading: boolean; label?: string }) => (
  <LiveRegion mode="assertive">
    {loading && label}
  </LiveRegion>
);

/**
 * Accessible card component with proper ARIA attributes.
 */
interface AccessibleCardProps {
  children: ReactNode;
  as?: 'article' | 'section' | 'div';
  label?: string;
  labelledBy?: string;
  className?: string;
}

export const AccessibleCard = ({ 
  children, 
  as = 'article',
  label,
  labelledBy,
  className,
}: AccessibleCardProps) => {
  const Component = as;
  return (
    <Component
      aria-label={label}
      aria-labelledby={labelledBy}
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2',
        className
      )}
    >
      {children}
    </Component>
  );
};

/**
 * Heading with proper hierarchy for accessibility.
 */
interface AccessibleHeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
  className?: string;
  id?: string;
}

const headingStyles: Record<number, string> = {
  1: 'text-4xl font-bold tracking-tight',
  2: 'text-3xl font-semibold tracking-tight',
  3: 'text-2xl font-semibold',
  4: 'text-xl font-semibold',
  5: 'text-lg font-medium',
  6: 'text-base font-medium',
};

export const AccessibleHeading = ({ level, children, className, id }: AccessibleHeadingProps) => {
  const baseStyle = headingStyles[level];
  
  switch (level) {
    case 1:
      return <h1 id={id} className={cn(baseStyle, className)}>{children}</h1>;
    case 2:
      return <h2 id={id} className={cn(baseStyle, className)}>{children}</h2>;
    case 3:
      return <h3 id={id} className={cn(baseStyle, className)}>{children}</h3>;
    case 4:
      return <h4 id={id} className={cn(baseStyle, className)}>{children}</h4>;
    case 5:
      return <h5 id={id} className={cn(baseStyle, className)}>{children}</h5>;
    case 6:
      return <h6 id={id} className={cn(baseStyle, className)}>{children}</h6>;
    default:
      return <h2 id={id} className={cn(baseStyle, className)}>{children}</h2>;
  }
};
