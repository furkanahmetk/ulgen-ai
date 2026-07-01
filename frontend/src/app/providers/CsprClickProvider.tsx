'use client';

import { ReactNode, useEffect, useRef } from 'react';

// cspr.click SDK is compiled against React 18.
// We load it at runtime to avoid React version conflicts.
export default function CsprClickProvider({ children }: { children: ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Load cspr.click script at runtime
    const script = document.createElement('script');
    script.src = 'https://cdn.cspr.click/sdk/latest/csprclick.js';
    script.async = true;
    script.onload = () => {
      // @ts-expect-error - cspr.click global SDK
      if (window.CsprClick) {
        // @ts-expect-error - cspr.click global SDK
        window.CsprClick.init({
          appName: 'Sentinel AI',
          appId: 'csprclick-template',
          contentMode: 'iframe',
          providers: ['casper-wallet', 'ledger', 'casperdash', 'metamask-snap'],
        });
      }
    };
    document.head.appendChild(script);
  }, []);

  return <>{children}</>;
}
