'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth.store';

const navItems = [
  { href: '/leads', label: 'Ліди' },
  { href: '/profile', label: 'Профіль' },
];

const adminNavItems = [
  { href: '/admin/partners', label: 'Партнери' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    clearAuth();
    router.push('/login');
  };

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <span className="font-semibold text-gray-900 text-sm tracking-wide uppercase">
                For You Real Estate
              </span>
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                {user?.role === 'admin' &&
                  adminNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 hidden sm:block">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Вийти
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
