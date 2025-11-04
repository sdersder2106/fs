import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const matchedShortcut = shortcuts.find(
        (shortcut) =>
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          !!event.ctrlKey === !!shortcut.ctrl &&
          !!event.shiftKey === !!shortcut.shift &&
          !!event.altKey === !!shortcut.alt
      );

      if (matchedShortcut) {
        event.preventDefault();
        matchedShortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// Global keyboard shortcuts
export function GlobalKeyboardShortcuts() {
  const router = useRouter();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'k',
      ctrl: true,
      description: 'Search',
      action: () => {
        // Focus search input if exists
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
    },
    {
      key: 'd',
      ctrl: true,
      description: 'Go to Dashboard',
      action: () => router.push('/dashboard'),
    },
    {
      key: 't',
      ctrl: true,
      description: 'Go to Targets',
      action: () => router.push('/targets'),
    },
    {
      key: 'p',
      ctrl: true,
      description: 'Go to Pentests',
      action: () => router.push('/pentests'),
    },
    {
      key: 'f',
      ctrl: true,
      description: 'Go to Findings',
      action: () => router.push('/findings'),
    },
    {
      key: 'n',
      ctrl: true,
      shift: true,
      description: 'New Target',
      action: () => router.push('/targets/new'),
    },
    {
      key: '/',
      ctrl: true,
      description: 'Show Shortcuts',
      action: () => {
        toast.info('Keyboard Shortcuts', {
          description: (
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between gap-4">
                <span className="font-mono">Ctrl + K</span>
                <span>Search</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-mono">Ctrl + D</span>
                <span>Dashboard</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-mono">Ctrl + T</span>
                <span>Targets</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-mono">Ctrl + P</span>
                <span>Pentests</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-mono">Ctrl + F</span>
                <span>Findings</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-mono">Ctrl + Shift + N</span>
                <span>New Target</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-mono">Ctrl + /</span>
                <span>Show Shortcuts</span>
              </div>
            </div>
          ),
          duration: 8000,
        });
      },
    },
  ];

  useKeyboardShortcuts(shortcuts);

  return null;
}

// Keyboard shortcut hint component
export function KeyboardShortcutHint({ keys, description }: { keys: string[]; description: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span>{description}</span>
      <div className="flex gap-1">
        {keys.map((key, index) => (
          <kbd
            key={index}
            className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono border"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
}
