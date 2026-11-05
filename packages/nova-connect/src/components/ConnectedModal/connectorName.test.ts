import { describe, expect, it } from 'vitest';

import { connectorDisplayName } from './connectorName';

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
