'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';
import { ClickProvider, ClickUI, CsprClickThemes } from '@make-software/csprclick-ui';

export default function CsprClickProvider({ children }: { children: ReactNode }) {
  const theme = CsprClickThemes?.dark || {
    mode: 'dark',
    backgroundPrimary: '#000000',
    textPrimary: '#ffffff',
  };

  return (
    <ThemeProvider theme={theme}>
      <ClickProvider
        options={{
          appName: process.env.NEXT_PUBLIC_CSPR_CLICK_APP_NAME || 'Ülgen AI',
          appId: process.env.NEXT_PUBLIC_CSPR_CLICK_APP_ID || 'csprclick-template',
          contentMode: 'iframe',
          providers: ['casper-wallet', 'ledger', 'casperdash', 'metamask-snap'],
        }}
      >
        <ClickUI />
        {children}
      </ClickProvider>
    </ThemeProvider>
  );
}
