import Container from '@/components/ui/Container';

export default function Footer() {
  return (
    <footer className="footer">
      <Container className="footer-inner">
        <div>
          <div className="logo small">NGO Relief Hub</div>
          <p className="muted">
            Transparent registration and ethical donation tracking for every
            campaign.
          </p>
        </div>
        <div className="footer-meta">
          <span>Built for NGOs and community impact teams.</span>
          <span>Secure registration • Verified payments • Clear reporting</span>
        </div>
      </Container>
    </footer>
  );
}
