import { Button } from '@heroui/react';
import type { ComponentProps, ReactNode } from 'react';

type CtaButtonProps = Omit<ComponentProps<typeof Button>, 'children'> & {
  children: ReactNode;
  isLoading?: boolean;
  tone?: 'primary' | 'secondary';
};

export function CtaButton({ children, className = '', isLoading = false, tone = 'primary', ...props }: CtaButtonProps) {
  const interactionClass =
    'motion-safe:transition-all motion-safe:duration-150 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 active:scale-[0.98] disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:active:scale-100';
  const loadingClass =
    'relative overflow-hidden data-[loading=true]:animate-pulse data-[loading=true]:after:absolute data-[loading=true]:after:inset-0 data-[loading=true]:after:-translate-x-full data-[loading=true]:after:animate-[shimmer_1.1s_ease-in-out_infinite] data-[loading=true]:after:bg-gradient-to-r data-[loading=true]:after:from-transparent data-[loading=true]:after:via-white/30 data-[loading=true]:after:to-transparent';
  const toneClass =
    tone === 'primary'
      ? 'bg-black text-white hover:bg-black/90 active:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/90'
      : '';

  return (
    <Button
      className={`${interactionClass} ${loadingClass} ${toneClass} ${className}`.trim()}
      data-loading={isLoading ? 'true' : undefined}
      isPending={isLoading}
      size={props.size ?? 'sm'}
      variant={props.variant ?? 'secondary'}
      {...props}
      isDisabled={isLoading || props.isDisabled}
    >
      {isLoading ? <span className="mr-2 size-3 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" /> : null}
      {children}
    </Button>
  );
}

type IconButtonProps = Omit<ComponentProps<typeof Button>, 'children'> & {
  children: ReactNode;
};

export function IconButton({ children, className = '', ...props }: IconButtonProps) {
  return (
    <Button
      className={`motion-safe:transition-all motion-safe:duration-150 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 active:scale-[0.96] ${className}`.trim()}
      size={props.size ?? 'sm'}
      variant={props.variant ?? 'secondary'}
      {...props}
    >
      {children}
    </Button>
  );
}
