'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';

const ClickProvider: any = dynamic(
  () => import('@make-software/csprclick-ui').then((mod) => mod.ClickProvider as any),
  { ssr: false }
);

export default function CsprClickProvider({ children }: { children: ReactNode }) {
  return (
    <ClickProvider
      options={{
        appName: process.env.NEXT_PUBLIC_CSPR_CLICK_APP_NAME || 'Sentinel AI',
        appId: process.env.NEXT_PUBLIC_CSPR_CLICK_APP_ID || 'csprclick-template',
        contentMode: 'iframe',
        providers: ['casper-wallet', 'ledger', 'casperdash', 'metamask-snap'],
      }}
    >
      {children}
    </ClickProvider>
  );
}
