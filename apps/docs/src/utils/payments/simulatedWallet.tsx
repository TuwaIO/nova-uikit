import { SatelliteStoreContext } from '@tuwaio/satellite-react';
import type { ReactNode } from 'react';
import { createStore } from 'zustand/vanilla';

/** A connected wallet for the stories: the active connection of a Satellite store, without a wallet extension. */
export function SimulatedWallet({
  connection,
  children,
}: {
  connection?: { address: string; chainId: string | number; connectorType: string };
  children: ReactNode;
}) {
  if (!connection) return <>{children}</>;
  const store = createStore(() => ({ activeConnection: connection }));
  return (
    <SatelliteStoreContext.Provider
      value={store as unknown as Parameters<typeof SatelliteStoreContext.Provider>[0]['value']}
    >
      {children}
    </SatelliteStoreContext.Provider>
  );
}
