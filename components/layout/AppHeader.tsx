import Link from 'next/link';
import type { ReactNode } from 'react';
import Container from '@/components/ui/Container';

type AppHeaderProps = {
  actions?: ReactNode;
};

export default function AppHeader({ actions }: AppHeaderProps) {
  return (
    <header className="border-b border-white/10 bg-slate-950/80">
      <Container className="flex flex-wrap items-center justify-between gap-4 py-6">
        <div className="space-y-1">
          <Link href="/" className="block">
          <div className="text-base font-semibold text-white">Sahaay</div>
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Connecting Hearts, Securing Futures
            </div>
          </Link>
        </div>
        {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
      </Container>
    </header>
  );
}
