'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Home, 
  Target, 
  Shield, 
  Bug, 
  FileText, 
  Settings, 
  Users, 
  Bell,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  Building,
  BarChart,
  Search
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import NotificationDropdown from '@/components/NotificationDropdown';
import AdvancedSearch from '@/components/search/AdvancedSearch';
import { ToastProvider } from '@/components/ui/toast';
import { useWebSocket } from '@/hooks/useWebSocket';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Pentests', href: '/dashboard/pentests', icon: Shield },
  { name: 'Targets', href: '/dashboard/targets', icon: Target },
  { name: 'Findings', href: '/dashboard/findings', icon: Bug },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
];

const adminNavigation = [
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Templates', href: '/dashboard/templates', icon: FileText },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Initialize WebSocket connection
  const { connected } = useWebSocket({
    autoConnect: true,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const isAdmin = session?.user?.role === 'ADMIN';
  const isPentester = session?.user?.role === 'PENTESTER' || isAdmin;

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <Link href="/dashboard" className="flex items-center">
              <Shield className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Base44</span>
            </Link>
            <button
              type="button"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                  )}
                >
                  <item.icon className={cn(
                    "mr-3 h-5 w-5 transition-colors",
                    isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-indigo-600"
                  )} />
                  {item.name}
                </Link>
              );
            })}

            {/* Admin Navigation */}
            {isAdmin && (
              <>
                <div className="my-4 border-t border-gray-200" />
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Administration
                </div>
                {adminNavigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                      )}
                    >
                      <item.icon className={cn(
                        "mr-3 h-5 w-5 transition-colors",
                        isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-indigo-600"
                      )} />
                      {item.name}
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          {/* User info */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {session?.user?.image ? (
                  <Image
                    className="h-8 w-8 rounded-full"
                    src={session.user.image}
                    alt=""
                    width={32}
                    height={32}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-indigo-600" />
                  </div>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500">
                  {session?.user?.role || 'CLIENT'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 text-gray-500 focus:outline-none lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 items-center justify-between px-4">
            {/* Page title or breadcrumb can go here */}
            <div className="flex-1"></div>

            {/* Actions */}
            <div className="ml-4 flex items-center space-x-4">
              {/* Advanced Search */}
              <AdvancedSearch />
              
              {/* Notifications */}
              <NotificationDropdown />

              {/* User menu */}
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  {session?.user?.image ? (
                    <Image
                      className="h-8 w-8 rounded-full"
                      src={session.user.image}
                      alt=""
                      width={32}
                      height={32}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-indigo-600" />
                    </div>
                  )}
                  <ChevronDown className="ml-2 h-4 w-4 text-gray-400" />
                </button>

                {/* User dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User className="mr-3 h-4 w-4" />
                        Your Profile
                      </Link>
                      <Link
                        href="/dashboard/company"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Building className="mr-3 h-4 w-4" />
                        Company
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="mr-3 h-4 w-4" />
                        Settings
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
      </div>
    </ToastProvider>
  );
}
