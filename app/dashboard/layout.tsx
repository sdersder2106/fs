import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { CompanyProvider } from '@/contexts/CompanyContext';

// TODO: Replace with actual session data from NextAuth
const mockUser = {
  id: '1',
  email: 'admin@base44.com',
  fullName: 'John Pentester',
  role: 'ADMIN' as const,
  avatar: undefined,
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CompanyProvider user={mockUser}>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar - Fixed left */}
        <Sidebar userRole={mockUser.role} />

        {/* Main content area */}
        <div className="flex-1 flex flex-col ml-64">
          {/* Header - Sticky top */}
          <Header user={mockUser} />

          {/* Page content - Scrollable */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </CompanyProvider>
  );
}
