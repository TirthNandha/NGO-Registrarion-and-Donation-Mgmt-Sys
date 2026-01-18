/**
 * Donation summary card showing donation statistics for a user
 */

type DonationSummaryCardProps = {
  totalAttempts: number;
  successful: number;
  pending: number;
  failed: number;
};

export default function DonationSummaryCard({
  totalAttempts,
  successful,
  pending,
  failed,
}: DonationSummaryCardProps) {
  const summaryItems = [
    ['Total attempts', totalAttempts],
    ['Successful donations', successful],
    ['Pending', pending],
    ['Failed', failed],
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-lg font-semibold">Donation Summary</h2>
      <p className="mt-2 text-sm text-slate-300">
        Track every attempt and status in one place.
      </p>
      <div className="mt-6 space-y-4">
        {summaryItems.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-3"
          >
            <span className="text-sm text-slate-300">{label}</span>
            <span className="text-sm font-semibold text-white">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
