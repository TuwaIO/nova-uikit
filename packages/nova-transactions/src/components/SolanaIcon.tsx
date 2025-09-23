import { ComponentProps } from 'react';

// eslint-disable-next-line react-refresh/only-export-components
export function getSolanaChainName(chainId: string) {
  switch (chainId) {
    case 'solana:mainnet':
      return 'Solana Mainnet';
    case 'solana:devnet':
      return 'Solana Devnet';
    case 'solana:testnet':
      return 'Solana Testent';
    default:
      return chainId;
  }
}

const Image = ({ svgCode, ...props }: { svgCode: string } & ComponentProps<'img'>) => {
  return (
    <img
      {...props}
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      src={`data:image/svg+xml;base64,${btoa(svgCode)}`}
      style={{ outline: 'none !important', pointerEvents: 'none' }}
      alt={props.alt}
    />
  );
};

export function SolanaIcon({ chainId, ...props }: { chainId: string } & ComponentProps<'img'>) {
  switch (chainId) {
    case 'solana:mainnet':
      return (
        <Image
          svgCode={`<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="solanamainnet__a" x1="0" x2=".5" y1=".5" y2="0"><stop offset="0%" stop-color="#9844FE"/><stop offset="50%" stop-color="#5496D4" stop-opacity=".8"/><stop offset="100%" stop-color="#16FA9A"/></linearGradient></defs><g fill="none"><circle cx="16" cy="16" r="16" fill="#000"/><path fill="url(#solanamainnet__a)" d="M9.925 19.687a.6.6 0 0 1 .415-.17h14.366a.29.29 0 0 1 .207.497l-2.838 2.815a.6.6 0 0 1-.415.171H7.294a.291.291 0 0 1-.207-.498zm0-10.517A.6.6 0 0 1 10.34 9h14.366c.261 0 .392.314.207.498l-2.838 2.815a.6.6 0 0 1-.415.17H7.294a.291.291 0 0 1-.207-.497zm12.15 5.225a.6.6 0 0 0-.415-.17H7.294a.291.291 0 0 0-.207.498l2.838 2.815c.11.109.26.17.415.17h14.366a.291.291 0 0 0 .207-.498z"/></g></svg>`}
          alt={chainId}
          {...props}
        />
      );
    case 'solana:devnet':
      return (
        <Image
          svgCode={`<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <path
                fill="#C4BFB8"
                d="M16 0c8.837 0 16 7.163 16 16s-7.163 16-16 16S0 24.837 0 16 7.163 0 16 0m8.706 19.517H10.34a.6.6 0 0 0-.415.17l-2.838 2.815a.291.291 0 0 0 .207.498H21.66a.6.6 0 0 0 .415-.17l2.838-2.816a.291.291 0 0 0-.207-.497m-3.046-5.292H7.294l-.068.007a.291.291 0 0 0-.14.49l2.84 2.816.07.06c.1.07.22.11.344.11h14.366l.068-.007a.291.291 0 0 0 .14-.49l-2.84-2.816-.07-.06a.6.6 0 0 0-.344-.11M24.706 9H10.34a.6.6 0 0 0-.415.17l-2.838 2.816a.291.291 0 0 0 .207.497H21.66a.6.6 0 0 0 .415-.17l2.838-2.815A.291.291 0 0 0 24.706 9"
              />
            </svg>`}
          alt={chainId}
          {...props}
        />
      );
    case 'solana:testnet':
      return (
        <Image
          svgCode={`<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <path
                fill="#C4BFB8"
                d="M16 0c8.837 0 16 7.163 16 16s-7.163 16-16 16S0 24.837 0 16 7.163 0 16 0m8.706 19.517H10.34a.6.6 0 0 0-.415.17l-2.838 2.815a.291.291 0 0 0 .207.498H21.66a.6.6 0 0 0 .415-.17l2.838-2.816a.291.291 0 0 0-.207-.497m-3.046-5.292H7.294l-.068.007a.291.291 0 0 0-.14.49l2.84 2.816.07.06c.1.07.22.11.344.11h14.366l.068-.007a.291.291 0 0 0 .14-.49l-2.84-2.816-.07-.06a.6.6 0 0 0-.344-.11M24.706 9H10.34a.6.6 0 0 0-.415.17l-2.838 2.816a.291.291 0 0 0 .207.497H21.66a.6.6 0 0 0 .415-.17l2.838-2.815A.291.291 0 0 0 24.706 9"
              />
            </svg>`}
          alt={chainId}
          {...props}
        />
      );
    default:
      return (
        <Image
          svgCode={`<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="solanamainnet__a" x1="0" x2=".5" y1=".5" y2="0"><stop offset="0%" stop-color="#9844FE"/><stop offset="50%" stop-color="#5496D4" stop-opacity=".8"/><stop offset="100%" stop-color="#16FA9A"/></linearGradient></defs><g fill="none"><circle cx="16" cy="16" r="16" fill="#000"/><path fill="url(#solanamainnet__a)" d="M9.925 19.687a.6.6 0 0 1 .415-.17h14.366a.29.29 0 0 1 .207.497l-2.838 2.815a.6.6 0 0 1-.415.171H7.294a.291.291 0 0 1-.207-.498zm0-10.517A.6.6 0 0 1 10.34 9h14.366c.261 0 .392.314.207.498l-2.838 2.815a.6.6 0 0 1-.415.17H7.294a.291.291 0 0 1-.207-.497zm12.15 5.225a.6.6 0 0 0-.415-.17H7.294a.291.291 0 0 0-.207.498l2.838 2.815c.11.109.26.17.415.17h14.366a.291.291 0 0 0 .207-.498z"/></g></svg>`}
          alt={chainId}
          {...props}
        />
      );
  }
}
