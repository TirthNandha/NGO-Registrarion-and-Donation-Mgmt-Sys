import Link from 'next/link';
import Container from '@/components/ui/Container';
import { ButtonLink } from '@/components/ui/Button';

type NavbarProps = {
  cta: {
    href: string;
    label: string;
  };
};

export default function Navbar({ cta }: NavbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <Container className="flex items-center justify-between gap-6 py-5">
        <Link href="/" className="block">
          <div className="text-base font-semibold text-white">Sahaay</div>
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Connecting Hearts, Securing Futures
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <a href="#about" className="transition hover:text-white">
            About
          </a>
          <a href="#how-it-works" className="transition hover:text-white">
            How it works
          </a>
          <a href="#impact" className="transition hover:text-white">
            Impact
          </a>
          <a href="#donations" className="transition hover:text-white">
            Donations
          </a>
        </nav>
        <ButtonLink
          href={cta.href}
          variant="outline"
          size="sm"
          className="border-white/30 text-white hover:border-white hover:text-white"
        >
          {cta.label}
        </ButtonLink>
      </Container>
    </header>
  );
}
