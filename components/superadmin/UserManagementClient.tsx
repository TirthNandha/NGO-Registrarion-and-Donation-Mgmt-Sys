'use client';

/**
 * Client wrapper for User Management with refresh capability
 */

import { useRouter } from 'next/navigation';
import UserManagement from './UserManagement';
import type { Registration } from '@/lib/types';

type UserManagementClientProps = {
  users: Registration[];
};

export default function UserManagementClient({ users }: UserManagementClientProps) {
  const router = useRouter();

  const handleRoleChange = () => {
    // Refresh the server component data
    router.refresh();
  };

  return <UserManagement users={users} onRoleChange={handleRoleChange} />;
}
