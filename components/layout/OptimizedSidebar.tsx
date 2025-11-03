'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useTransition, useCallback, useEffect } from 'react';
import { usePrefetch } from '@/hooks/useOptimizedQueries';
import {
  LayoutDashboard,
  Shield,
  Target,
  Bug,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    prefetch: 'dashboard'
  },
  {
    label: 'Pentests',
    href: '/dashboard/pentests',
    icon: Shield,
    prefetch: 'pentests'
  },
  {
    label: 'Targets',
    href: '/dashboard/targets',
    icon: Target,
    prefetch: 'targets'
  },
  {
    label: 'Findings',
    href: '/dashboard/findings',
    icon: Bug,
    prefetch: 'findings'
  },
  {
    label: 'Reports',
    href: '/dashboard/reports',
    icon: FileText,
    prefetch: 'reports'
  },
];

export function OptimizedSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [loadingRoute, setLoadingRoute] = useState<string | null>(null);
  const { prefetchDashboard, prefetchPentests, prefetchFindings } = usePrefetch();

  // Prefetch data on hover
  const handleMouseEnter = useCallback((prefetchType: string) => {
    switch (prefetchType) {
      case 'dashboard':
        prefetchDashboard();
        break;
      case 'pentests':
        prefetchPentests();
        break;
      case 'findings':
        prefetchFindings();
        break;
    }
  }, [prefetchDashboard, prefetchPentests, prefetchFindings]);

  // Optimized navigation with transition
  const handleNavigation = useCallback((href: string) => {
    setLoadingRoute(href);
    startTransition(() => {
      router.push(href);
      setTimeout(() => setLoadingRoute(null), 500);
    });
  }, [router]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case '1':
            handleNavigation('/dashboard');
            break;
          case '2':
            handleNavigation('/dashboard/pentests');
            break;
          case '3':
            handleNavigation('/dashboard/targets');
            break;
          case '4':
            handleNavigation('/dashboard/findings');
            break;
          case '5':
            handleNavigation('/dashboard/reports');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleNavigation]);

  return (
    <aside
      className={cn(
        'bg-gray-900 text-white transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className={cn('flex items-center', isCollapsed && 'justify-center')}>
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            {!isCollapsed && (
              <span className="ml-3 text-xl font-semibold">Base44</span>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const isLoading = loadingRoute === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation(item.href);
                }}
                onMouseEnter={() => handleMouseEnter(item.prefetch)}
                className={cn(
                  'flex items-center px-3 py-2 rounded-lg transition-all duration-200',
                  'hover:bg-gray-800 hover:translate-x-1',
                  isActive && 'bg-blue-600 hover:bg-blue-700',
                  isLoading && 'animate-pulse'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex items-center">
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                  {!isCollapsed && (
                    <>
                      <span className="ml-3">{item.label}</span>
                      <span className="ml-auto text-xs text-gray-400">
                        ⌘{index + 1}
                      </span>
                    </>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Loading indicator */}
        {isPending && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600">
            <div className="h-full bg-blue-400 animate-pulse" />
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <button
            className={cn(
              'flex items-center w-full px-3 py-2 rounded-lg',
              'hover:bg-gray-800 transition-colors'
            )}
          >
            <Settings className="h-5 w-5" />
            {!isCollapsed && <span className="ml-3">Settings</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}