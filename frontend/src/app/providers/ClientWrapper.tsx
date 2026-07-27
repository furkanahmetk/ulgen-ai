'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// Dynamically import the provider with ssr: false to prevent Next.js from
// running it on the server, avoiding ReactCurrentDispatcher errors.
const CsprClickProvider = dynamic(() => import('./CsprClickProvider'), { 
  ssr: false 
});

export default function ClientWrapper({ children }: { children: ReactNode }) {
  return <CsprClickProvider>{children}</CsprClickProvider>;
}
