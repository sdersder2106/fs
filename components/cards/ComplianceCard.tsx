'use client';

import React from 'react';
import { Shield, CreditCard, FileCheck, Lock, Heart, AlertTriangle } from 'lucide-react';

interface ComplianceItem {
  standard: string;
  failedCount: number;
  icon: string;
  color: string;
}

interface ComplianceCardProps {
  data?: ComplianceItem[];
}

export function ComplianceCard({ data }: ComplianceCardProps) {
  // Default demo data
  const defaultData: ComplianceItem[] = [
    { standard: 'SOC2', failedCount: 0, icon: 'shield', color: 'blue' },
    { standard: 'PCI-DSS', failedCount: 8, icon: 'credit-card', color: 'green' },
    { standard: 'ISO 27001', failedCount: 8, icon: 'file-check', color: 'blue' },
    { standard: 'GDPR', failedCount: 2, icon: 'lock', color: 'blue' },
    { standard: 'HIPAA', failedCount: 8, icon: 'heart', color: 'cyan' },
    { standard: 'OWASP', failedCount: 8, icon: 'alert', color: 'purple' },
  ];

  const complianceData = data || defaultData;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'shield':
        return Shield;
      case 'credit-card':
        return CreditCard;
      case 'file-check':
        return FileCheck;
      case 'lock':
        return Lock;
      case 'heart':
        return Heart;
      case 'alert':
        return AlertTriangle;
      default:
        return Shield;
    }
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
      green: { bg: 'bg-green-100', text: 'text-green-600' },
      cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Failed Compliances
            </h3>
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
              34
            </span>
          </div>
        </div>
        <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>Last month</option>
          <option>Last 3 months</option>
          <option>Last 6 months</option>
        </select>
      </div>

      {/* Compliance Grid */}
      <div className="grid grid-cols-2 gap-4">
        {complianceData.map((item, index) => {
          const Icon = getIcon(item.icon);
          const colors = getColorClasses(item.color);
          
          return (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* Icon */}
              <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-6 h-6 ${colors.text}`} />
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-bold text-gray-900">
                  {item.failedCount}
                </p>
                <p className="text-sm text-gray-600 truncate">
                  {item.standard}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
