import type { ReactNode } from 'react';

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

export default function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white ${className ?? ''}`}
    >
      {children}
    </span>
  );
}
