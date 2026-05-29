'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const links = [
    { href: '/', label: 'Record' },
    { href: '/history', label: 'History' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <svg
            className="h-6 w-6 text-zinc-900 dark:text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
          <span className="font-semibold text-lg tracking-tight text-zinc-950 dark:text-white">
            EchoScribe
          </span>
        </Link>

        {user && (
          <nav className="flex items-center gap-6">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-zinc-950 dark:hover:text-white ${
                    isActive
                      ? 'text-zinc-950 dark:text-white font-semibold'
                      : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Hi, <span className="font-semibold text-zinc-800 dark:text-zinc-200 uppercase">{user}</span>
              </span>
              <div className="h-8 w-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center dark:bg-zinc-800 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 select-none uppercase">
                {user.slice(0, 2)}
              </div>
              <button
                onClick={logout}
                className="text-xs font-medium text-red-500 hover:text-red-600 hover:underline transition-all"
              >
                Logout
              </button>
            </div>
          ) : (
            pathname !== '/login' && (
              <Link
                href="/login"
                className="text-sm font-medium text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-4 py-2 rounded-xl dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-750 transition-colors"
              >
                Login
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
}
