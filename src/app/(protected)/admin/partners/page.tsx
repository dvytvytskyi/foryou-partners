import { RoleGate } from '@/components/auth/RoleGate';

export default function AdminPartnersPage() {
  return (
    <RoleGate allowedRoles={['admin']} fallback={<p className="text-sm text-red-500">Доступ заборонено</p>}>
      <div>
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Партнери</h1>
        {/* AdminPartnersTable — admin slice */}
        <p className="text-sm text-gray-400">AdminPartnersTable — буде реалізовано</p>
      </div>
    </RoleGate>
  );
}
