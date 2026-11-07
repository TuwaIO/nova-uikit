import { describe, expect, it } from 'vitest';

import { connectorDisplayName, isImpersonatedConnector } from './connectorName';

describe('connectorDisplayName', () => {
  const connectors = {
    evm: [{ name: 'MetaMask' }, { name: 'Impersonated Connector' }],
    solana: [{ name: 'Phantom' }],
  };

  it('takes the name of the connector: the ID alone reads as Metamask', () => {
    expect(connectorDisplayName('evm:metamask', connectors)).toBe('MetaMask');
    expect(connectorDisplayName('solana:phantom', connectors)).toBe('Phantom');
  });

  it('falls back to the normalized ID of a wallet without a connector', () => {
    expect(connectorDisplayName('evm:rabbywallet', connectors)).toBe('Rabbywallet');
    expect(connectorDisplayName('evm:rabbywallet')).toBe('Rabbywallet');
  });
});

describe('isImpersonatedConnector', () => {
  it('goes by the type, as the display name of a listed connector is another word', () => {
    expect(connectorDisplayName('evm:impersonatedwallet', { evm: [{ name: 'Impersonated Connector' }] })).toBe(
      'Impersonated Connector',
    );
    expect(isImpersonatedConnector('evm:impersonatedwallet')).toBe(true);
    expect(isImpersonatedConnector('evm:metamask')).toBe(false);
    expect(isImpersonatedConnector('impersonatedwallet')).toBe(false);
  });
});
