import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Trash2, Archive, Mail, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BulkActionsProps<T> {
  items: T[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onBulkAction: (action: string, ids: string[]) => void;
  actions?: {
    label: string;
    icon: React.ReactNode;
    action: string;
    variant?: 'default' | 'destructive';
  }[];
}

export function BulkActions<T extends { id: string }>({
  items,
  selectedIds,
  onSelectionChange,
  onBulkAction,
  actions = [],
}: BulkActionsProps<T>) {
  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < items.length;

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(items.map((item) => item.id));
    }
  };

  const defaultActions = [
    {
      label: 'Delete Selected',
      icon: <Trash2 className="h-4 w-4" />,
      action: 'delete',
      variant: 'destructive' as const,
    },
    {
      label: 'Archive Selected',
      icon: <Archive className="h-4 w-4" />,
      action: 'archive',
      variant: 'default' as const,
    },
    {
      label: 'Export Selected',
      icon: <Download className="h-4 w-4" />,
      action: 'export',
      variant: 'default' as const,
    },
  ];

  const allActions = [...defaultActions, ...actions];

  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
      <Checkbox
        checked={allSelected}
        onCheckedChange={toggleAll}
        aria-label="Select all"
        className={someSelected ? 'data-[state=checked]:bg-primary/50' : ''}
      />
      <Badge variant="secondary">{selectedIds.length} selected</Badge>

      <div className="flex gap-2 ml-auto">
        {allActions.slice(0, 2).map((action) => (
          <Button
            key={action.action}
            variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => onBulkAction(action.action, selectedIds)}
          >
            {action.icon}
            {action.label}
          </Button>
        ))}

        {allActions.length > 2 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {allActions.slice(2).map((action) => (
                <DropdownMenuItem
                  key={action.action}
                  onClick={() => onBulkAction(action.action, selectedIds)}
                  className={action.variant === 'destructive' ? 'text-destructive' : ''}
                >
                  {action.icon}
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button variant="ghost" size="sm" onClick={() => onSelectionChange([])}>
          Clear
        </Button>
      </div>
    </div>
  );
}

// Hook for managing bulk selection
export function useBulkSelection<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((item) => item.id));
    }
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const isSelected = (id: string) => selectedIds.includes(id);

  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < items.length;

  return {
    selectedIds,
    setSelectedIds,
    toggleItem,
    toggleAll,
    clearSelection,
    isSelected,
    allSelected,
    someSelected,
    selectedCount: selectedIds.length,
  };
}
