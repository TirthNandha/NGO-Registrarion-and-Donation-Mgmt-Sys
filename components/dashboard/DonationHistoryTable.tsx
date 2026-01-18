/**
 * Donation history table component showing user's donation records
 */

type Donation = {
  id: string;
  amount: number;
  status: string;
  timestamp: string;
  transaction_id: string;
};

type DonationHistoryTableProps = {
  donations: Donation[];
};

export default function DonationHistoryTable({ donations }: DonationHistoryTableProps) {
  const getStatusStyles = (status: string) => {
    if (status === 'success') return 'bg-emerald-500/10 text-emerald-200';
    if (status === 'pending') return 'bg-amber-400/10 text-amber-200';
    return 'bg-rose-500/10 text-rose-200';
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div>
        <h2 className="text-lg font-semibold">Donation History</h2>
        <p className="text-sm text-slate-300">
          Latest donations with status tracking.
        </p>
      </div>
      <div className="mt-6 grid gap-3">
        {donations.length === 0 ? (
          <p className="text-center text-slate-400 py-12">No donations yet. Make your first one!</p>
        ) : (
          donations.map((row) => (
            <div
              key={row.id}
              className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/40 p-4 sm:grid-cols-[1fr_1fr_1fr_auto]"
            >
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Donation ID
                </p>
                <p className="mt-1 text-sm font-semibold text-white">{row.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Amount
                </p>
                <p className="mt-1 text-sm font-semibold text-white">₹{row.amount}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Date
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {new Date(row.timestamp).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <span
                className={`h-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyles(row.status)}`}
              >
                {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
