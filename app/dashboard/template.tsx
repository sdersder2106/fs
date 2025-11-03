import { ReactNode } from 'react';
import './layout';

// Disable static generation for all dashboard routes
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = false;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';
export const preferredRegion = 'auto';

export default function DashboardRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}