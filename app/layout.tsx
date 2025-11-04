// app/layout.tsx ou app/(dashboard)/layout.tsx modifié
import { Inter } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import { PusherProvider } from '@/components/providers/pusher-provider';
// SUPPRIMÉ: import { WebSocketProvider } from '@/components/providers/websocket-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            {/* ANCIEN: <WebSocketProvider> */}
            <PusherProvider>
              {children}
              <Toaster />
            </PusherProvider>
            {/* ANCIEN: </WebSocketProvider> */}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
