/**
 * User profile card component showing registration details
 */

import type { UserProfile } from '@/lib/types';

type UserProfileCardProps = {
  userData: UserProfile;
};

export default function UserProfileCard({ userData }: UserProfileCardProps) {
  const profileFields = [
    ['Full name', userData.name],
    ['Email', userData.email],
    ['Phone Number', userData.phoneNumber],
    ['Registered on', userData.createdAt],
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-lg font-semibold">Registration Details</h2>
      <p className="mt-2 text-sm text-slate-300">
        Your profile is saved even if a donation does not complete.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {profileFields.map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-slate-900/40 p-4"
          >
            <p className="text-xs uppercase tracking-wide text-slate-400">
              {label}
            </p>
            <p className="mt-2 text-sm font-semibold text-white">
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
