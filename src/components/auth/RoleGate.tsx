'use client';

import { useAuthStore } from '@/lib/stores/auth.store';
import type { UserRole } from '@/lib/types/auth.types';

interface RoleGateProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGate({ allowedRoles, children, fallback = null }: RoleGateProps) {
  const { user } = useAuthStore();

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
