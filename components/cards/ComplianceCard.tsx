'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

interface ComplianceCardProps {
  standard: 'SOC2' | 'PCI-DSS' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'OWASP';
  status: 'compliant' | 'partial' | 'non-compliant' | 'pending';
  score?: number;
  details?: string;
  lastAudit?: Date | string;
  nextAudit?: Date | string;
  className?: string;
}

export const ComplianceCard: React.FC<ComplianceCardProps> = ({
  standard,
  status,
  score,
  details,
  lastAudit,
  nextAudit,
  className,
}) => {
  const statusConfig = {
    compliant: {
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      label: 'Compliant',
    },
    partial: {
      icon: <AlertCircle className="w-5 h-5" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      label: 'Partially Compliant',
    },
    'non-compliant': {
      icon: <XCircle className="w-5 h-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      label: 'Non-Compliant',
    },
    pending: {
      icon: <Clock className="w-5 h-5" />,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      label: 'Pending Audit',
    },
  };

  const config = statusConfig[status];

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const standardLogos: Record<string, string> = {
    'SOC2': '🔒',
    'PCI-DSS': '💳',
    'ISO27001': '🏆',
    'GDPR': '🇪🇺',
    'HIPAA': '🏥',
    'OWASP': '🛡️',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl border p-6 hover:shadow-md transition-all',
        config.borderColor,
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <span className="text-2xl mr-3">{standardLogos[standard]}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{standard}</h3>
            <div className={cn('flex items-center mt-1', config.color)}>
              {config.icon}
              <span className="ml-2 text-sm font-medium">{config.label}</span>
            </div>
          </div>
        </div>
        {score !== undefined && (
          <div className="text-right">
            <div className={cn('text-2xl font-bold', getScoreColor(score))}>
              {score}%
            </div>
            <div className="text-xs text-gray-500 uppercase">Score</div>
          </div>
        )}
      </div>

      {details && (
        <p className="text-sm text-gray-600 mb-4">{details}</p>
      )}

      <div className="flex justify-between text-xs text-gray-500">
        {lastAudit && (
          <div>
            <span className="font-medium">Last Audit:</span> {formatDate(lastAudit)}
          </div>
        )}
        {nextAudit && (
          <div>
            <span className="font-medium">Next Audit:</span> {formatDate(nextAudit)}
          </div>
        )}
      </div>

      {score !== undefined && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={cn(
                'h-2 rounded-full transition-all',
                score >= 90 ? 'bg-green-500' :
                score >= 70 ? 'bg-yellow-500' :
                score >= 50 ? 'bg-orange-500' : 'bg-red-500'
              )}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
