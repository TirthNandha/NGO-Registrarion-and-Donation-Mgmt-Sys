type FeatureCardProps = {
  title: string;
  description: string;
  icon?: string;
};

export default function FeatureCard({
  title,
  description,
  icon,
}: FeatureCardProps) {
  return (
    <div className="card feature-card">
      <div className="feature-icon">{icon ?? 'NGO'}</div>
      <div>
        <h3 className="card-title">{title}</h3>
        <p className="card-body">{description}</p>
      </div>
    </div>
  );
}
