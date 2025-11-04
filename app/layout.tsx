   import { PusherProvider } from '@/components/providers/pusher-provider';

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
