import Container from '@/components/ui/Container';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <Container className="grid gap-6 py-12 text-sm text-slate-400 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          <div className="text-base font-semibold text-white">
            Sahaay
          </div>
          <p>
            Connecting Hearts, Securing Futures.
          </p>
        </div>
        <div className="space-y-2">
          <span className="block">Built for NGOs and community impact teams.</span>
          <span className="block">
            Secure registration • Verified payments • Clear reporting
          </span>
        </div>
      </Container>
    </footer>
  );
}
