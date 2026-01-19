import { Button } from '@/components/ui/Button';
import type { UserRole } from '@/lib/types';

type RoleChangeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
  currentRole: UserRole;
  newRole: UserRole;
  isLoading: boolean;
};

export default function RoleChangeModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
  currentRole,
  newRole,
  isLoading,
}: RoleChangeModalProps) {
  if (!isOpen) return null;

  const getRoleBadgeColor = (role: UserRole) => {
    if (role === 'admin') return 'bg-purple-500/20 text-purple-200';
    if (role === 'superadmin') return 'bg-rose-500/20 text-rose-200';
    return 'bg-blue-500/20 text-blue-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl">
        <h3 className="text-xl font-semibold text-white">Confirm Role Change</h3>
        <p className="mt-3 text-slate-300">
          Are you sure you want to change the role of{' '}
          <span className="font-semibold text-white">{userName}</span>?
        </p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Current Role</p>
              <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadgeColor(currentRole)}`}>
                {currentRole}
              </span>
            </div>
            <div className="text-slate-400">→</div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">New Role</p>
              <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadgeColor(newRole)}`}>
                {newRole}
              </span>
            </div>
          </div>
        </div>

        {newRole === 'admin' && (
          <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3">
            <p className="text-xs text-amber-200">
              ⚠️ This user will gain access to the admin dashboard and can view all registrations and donations.
            </p>
          </div>
        )}

        {newRole === 'user' && currentRole === 'admin' && (
          <div className="mt-4 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3">
            <p className="text-xs text-blue-200">
              ℹ️ This user will lose admin access and will only see their own dashboard.
            </p>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            variant="primary"
            size="sm"
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Confirm'}
          </Button>
        </div>
      </div>
    </div>
  );
}
