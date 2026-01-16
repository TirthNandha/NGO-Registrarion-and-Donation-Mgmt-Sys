import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const variantClass: Record<Variant, string> = {
  primary: 'btn-primary',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
};

const sizeClass: Record<Size, string> = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`btn ${variantClass[variant]} ${sizeClass[size]} ${
        className ?? ''
      }`}
    />
  );
}

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
};

export function ButtonLink({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`btn ${variantClass[variant]} ${sizeClass[size]} ${
        className ?? ''
      }`}
    >
      {children}
    </Link>
  );
}
