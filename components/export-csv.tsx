import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ExportCSVProps {
  data: any[];
  filename: string;
  headers?: string[];
}

export function ExportCSV({ data, filename, headers }: ExportCSVProps) {
  const exportToCSV = () => {
    if (!data || data.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      // Get headers from first object if not provided
      const csvHeaders = headers || Object.keys(data[0]);

      // Create CSV content
      const csvContent = [
        // Headers
        csvHeaders.join(','),
        // Data rows
        ...data.map((row) =>
          csvHeaders
            .map((header) => {
              const value = row[header];
              // Handle nested objects
              if (typeof value === 'object' && value !== null) {
                return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
              }
              // Escape commas and quotes
              if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value ?? '';
            })
            .join(',')
        ),
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Export successful');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  return (
    <Button onClick={exportToCSV} variant="outline">
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  );
}
