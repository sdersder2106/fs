'use client';

import * as React from 'react';

export function ThemeProvider({ 
  children,
  attribute = 'class',
  defaultTheme = 'dark',
  enableSystem = false,
  disableTransitionOnChange = true,
  ...props 
}) {
  return <>{children}</>;
}

export const useTheme = () => {
  return {
    theme: 'dark',
    setTheme: () => {},
  };
};