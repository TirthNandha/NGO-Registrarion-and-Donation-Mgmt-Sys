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
    <header className="navbar">
      <Container className="navbar-inner">
        <Link href="/" className="logo">
          NGO Relief Hub
        </Link>
        <nav className="nav-links">
          <a href="#about">About</a>
          <a href="#how-it-works">How it works</a>
          <a href="#donations">Donations</a>
        </nav>
        <ButtonLink href={cta.href} variant="outline" size="sm">
          {cta.label}
        </ButtonLink>
      </Container>
    </header>
  );
}
