// The token symbols whose icons go into src/utils/web3IconImports.ts for `TokenIcon`, next to the icons the network and
// wallet metadata name. Every entry is one more chunk that the bundler of an app builds (a lazy import, downloaded only
// when the icon is shown), so the list keeps to the tokens people pay and hold most: the assets of Quasar's built-in
// payment presets, the large coins, stablecoins, wrapped and staked tokens, DeFi and Solana tokens that @web3icons/react
// has an icon for (a test checks it). Any other token shows the first letter of its symbol.

/** The assets of Quasar's built-in payment presets and the tokens merchants add most often (@tuwaio/nova-payments). */
export const PAYMENT_TOKENS = ['USDC', 'USDT', 'EURC', 'PYUSD', 'DAI', 'GHO', 'ETH', 'POL', 'BNB', 'SOL'];

/** The most held and traded tokens besides those. */
export const POPULAR_TOKENS = [
  // Large coins
  'BTC',
  'XRP',
  'ADA',
  'DOGE',
  'TRX',
  'TON',
  'AVAX',
  'DOT',
  'LINK',
  'BCH',
  'LTC',
  'XLM',
  'ETC',
  'ATOM',
  'NEAR',
  'ICP',
  'APT',
  'SUI',
  'SEI',
  'TIA',
  'INJ',
  'FIL',
  'HBAR',
  'XMR',
  'VET',
  'ALGO',
  'EGLD',
  'KAS',
  'STX',
  'TAO',
  'MATIC',
  // Stablecoins
  'USDE',
  'FDUSD',
  'TUSD',
  'FRAX',
  'LUSD',
  'CRVUSD',
  'EURS',
  'USDD',
  // Layer 2 and infrastructure
  'ARB',
  'OP',
  'IMX',
  'MNT',
  'STRK',
  'METIS',
  'GRT',
  'FET',
  'RNDR',
  // Wrapped and staked
  'WBTC',
  'RETH',
  'CBETH',
  'MSOL',
  // DeFi
  'UNI',
  'AAVE',
  'MKR',
  'LDO',
  'CRV',
  'COMP',
  'SNX',
  'SUSHI',
  '1INCH',
  'YFI',
  'CAKE',
  'GMX',
  'PENDLE',
  'RPL',
  'FXS',
  'DYDX',
  // Solana
  'JUP',
  'RAY',
  'PYTH',
  // Consumer and community
  'SHIB',
  'PEPE',
  'APE',
  'SAND',
  'MANA',
  'AXS',
  'CHZ',
  'BLUR',
  'ENS',
];
