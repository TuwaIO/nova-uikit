/**
 * @file ConnectionsContent component for managing multiple wallet connections.
 */

import { getAdapterFromConnectorType, ConnectorType } from '@tuwaio/orbit-core';
import { cn, textCenterEllipsis } from '@tuwaio/nova-core';
import React, { useCallback, useMemo } from 'react';

import { useSatelliteConnectStore } from '../../satellite';
import { useNovaConnect, useNovaConnectLabels } from '../../hooks';

export interface ConnectionsContentProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * ConnectionsContent displays all connected wallets and allows switching between them.
 */
export const ConnectionsContent: React.FC<ConnectionsContentProps> = ({ className }) => {
  const labels = useNovaConnectLabels();

  const { setIsConnectedModalOpen, setIsConnectModalOpen } = useNovaConnect();
  const connections = useSatelliteConnectStore((store) => store.connections);
  const activeConnection = useSatelliteConnectStore((store) => store.activeConnection);
  const switchConnection = useSatelliteConnectStore((store) => store.switchConnection);
  const disconnect = useSatelliteConnectStore((store) => store.disconnect);

  /**
   * Convert connections Record to array for rendering
   */
  const connectionsList = useMemo(() => {
    if (!connections) return [];
    return Object.values(connections);
  }, [connections]);

  /**
   * Handle switching to a different connection
   */
  const handleSwitch = useCallback(
    async (connectorType: ConnectorType) => {
      await switchConnection(connectorType);
    },
    [switchConnection],
  );

  /**
   * Handle disconnecting a specific wallet
   */
  const handleDisconnect = useCallback(
    (connectorType: ConnectorType | undefined, event: React.MouseEvent) => {
      event.stopPropagation();
      if (connectorType) {
        disconnect(connectorType);
      }
    },
    [disconnect],
  );

  if (connectionsList.length === 0) {
    return (
      <div
        className={cn(
          'novacon:flex novacon:flex-col novacon:items-center novacon:justify-center novacon:p-8',
          className,
        )}
      >
        <p className="novacon:text-[var(--tuwa-text-secondary)]">No connections found</p>
      </div>
    );
  }

  return (
    <div className={cn('novacon:flex novacon:flex-col novacon:gap-3 novacon:p-4', className)}>
      {connectionsList.map((connection) => {
        const isActive = activeConnection?.connectorType === connection.connectorType;
        const adapter = getAdapterFromConnectorType(connection.connectorType);
        const abbreviatedAddress = textCenterEllipsis(connection.address, 5, 5);

        return (
          <div
            key={connection.connectorType}
            onClick={() => !isActive && handleSwitch(connection.connectorType)}
            className={cn(
              'novacon:relative novacon:flex novacon:items-center novacon:gap-4 novacon:p-4',
              'novacon:rounded-xl novacon:border novacon:transition-all novacon:duration-200',
              {
                'novacon:bg-[var(--tuwa-bg-accent)] novacon:border-[var(--tuwa-text-accent)] novacon:cursor-default':
                  isActive,
                'novacon:bg-[var(--tuwa-bg-secondary)] novacon:border-[var(--tuwa-border-primary)] novacon:cursor-pointer novacon:hover:bg-[var(--tuwa-bg-muted)] novacon:hover:border-[var(--tuwa-text-accent)]':
                  !isActive,
              },
            )}
          >
            {/* Wallet Icon / Avatar */}
            <div
              className={cn(
                'novacon:flex novacon:h-10 novacon:w-10 novacon:items-center novacon:justify-center',
                'novacon:rounded-full novacon:border novacon:border-[var(--tuwa-border-primary)]',
                'novacon:bg-[var(--tuwa-bg-primary)]',
              )}
            >
              <span className="novacon:text-sm novacon:font-bold novacon:text-[var(--tuwa-text-primary)]">
                {connection.connectorType.slice(0, 2).toUpperCase()}
              </span>
            </div>

            {/* Wallet Info */}
            <div className="novacon:flex novacon:flex-1 novacon:flex-col novacon:gap-1">
              <div className="novacon:flex novacon:items-center novacon:gap-2">
                <span className="novacon:font-medium novacon:text-[var(--tuwa-text-primary)]">
                  {connection.connectorType}
                </span>
                {isActive && (
                  <span
                    className={cn(
                      'novacon:rounded-full novacon:px-2 novacon:py-0.5 novacon:text-xs novacon:font-medium',
                      'novacon:bg-[var(--tuwa-bg-muted)] novacon:text-[var(--tuwa-text-accent)]',
                    )}
                  >
                    {labels.active}
                  </span>
                )}
              </div>
              <span className="novacon:text-sm novacon:text-[var(--tuwa-text-secondary)]">{abbreviatedAddress}</span>
            </div>

            {/* Disconnect Button */}
            <button
              type="button"
              onClick={(e) => handleDisconnect(connection.connectorType, e)}
              className={cn(
                'novacon:rounded-lg novacon:px-3 novacon:py-1.5',
                'novacon:text-sm novacon:font-medium novacon:transition-colors',
                'novacon:text-[var(--tuwa-text-error)] novacon:hover:bg-[var(--tuwa-bg-error)]',
                'novacon:focus:outline-none novacon:focus:ring-2 novacon:focus:ring-[var(--tuwa-border-error)]',
              )}
              aria-label={`${labels.disconnect} ${connection.connectorType}`}
            >
              {labels.disconnect}
            </button>
          </div>
        );
      })}

      <button type="button" onClick={() => {
        setIsConnectedModalOpen(false)
        setIsConnectModalOpen(true)
      }}>
        Add Wallet
      </button>
    </div>  
  );
};

ConnectionsContent.displayName = 'ConnectionsContent';
