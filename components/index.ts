// Layout components - Named exports
export { Sidebar } from './layout/Sidebar';
export { Header } from './layout/Header';
export { CompanySelector } from './layout/CompanySelector';

// Chart components - Named exports
export { VulnerabilitySeverityChart } from './charts/VulnerabilitySeverityChart';
export { VulnerabilityBreakdownChart } from './charts/VulnerabilityBreakdownChart';

// Card components
export { default as StatCard } from './cards/StatCard';
export { ComplianceCard } from './cards/ComplianceCard';

// List components - Named exports
export { RecentActivity } from './lists/RecentActivity';

// Utility components - Default exports
export { default as Comments } from './Comments';
export { default as EmptyState } from './EmptyState';
export { default as LoadingSkeleton } from './LoadingSkeleton';
export { default as PageHeader } from './PageHeader';
export { default as SearchBar } from './SearchBar';

// UI components - Re-export all
export * from './ui';

// Context providers
export { CompanyProvider, useCompany } from '@/contexts/CompanyContext';
