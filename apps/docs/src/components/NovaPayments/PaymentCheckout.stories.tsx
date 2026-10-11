import type { Meta, StoryObj } from '@storybook/react-vite';
import { PaymentCheckout } from '@tuwaio/nova-payments';
import { useMemo, useState } from 'react';
import { action } from 'storybook/actions';

import { sampleCheckout, simulatedCheckoutApi, type SimulationOptions } from '../../utils/payments/simulatedCheckout';
import {
  type SimulatedConnection,
  SimulatedWallet,
  type SimulatedWalletOptions,
} from '../../utils/payments/simulatedWallet';

type StoryProps = SimulationOptions & {
  display: 'modal' | 'inline' | 'page';
  wallet?: SimulatedConnection;
  walletOptions?: SimulatedWalletOptions;
  payUrl?: string;
};

/** A checkout on a simulated Quasar API: no network, the language the buyer picks is kept. */
function SimulatedCheckout({ display, wallet, walletOptions, payUrl, ...simulation }: StoryProps) {
  const api = useMemo(() => simulatedCheckoutApi(simulation), [simulation]);
  const [open, setOpen] = useState(true);
  return (
    <SimulatedWallet connection={wallet} options={walletOptions}>
      {display === 'modal' && !open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded bg-[var(--tuwa-button-primary-bg)] px-4 py-2 text-white"
        >
          Open the checkout
        </button>
      )}
      <PaymentCheckout
        // A new simulation for new controls: remounting gives a new checkout store
        key={JSON.stringify(simulation)}
        token="story"
        api={api}
        EventSource={null}
        pollMs={60_000}
        display={display}
        open={open}
        onOpenChange={(next) => {
          action('onOpenChange')(next);
          setOpen(next);
        }}
        onClose={action('onClose')}
        payUrl={payUrl}
      />
    </SimulatedWallet>
  );
}

const meta: Meta<typeof SimulatedCheckout> = {
  title: 'Nova Payments/Checkout/PaymentCheckout',
  component: SimulatedCheckout,
  parameters: { layout: 'centered' },
  args: { display: 'inline', logo: false, mode: 'ok' },
  argTypes: {
    display: { control: 'inline-radio', options: ['modal', 'inline', 'page'] },
    mode: { control: 'inline-radio', options: ['ok', 'loading', 'notFound', 'failure'] },
  },
};
export default meta;

type Story = StoryObj<typeof SimulatedCheckout>;

/** The checkout in the page: the order on the left, the steps, language and close in the header. */
export const Inline: Story = {};

/** The modal over the page; under 640 px it is a sheet from the bottom. */
export const Modal: Story = { args: { display: 'modal' } };

/** The merchant's logo instead of its first letter. */
export const WithLogo: Story = { args: { logo: true } };

/** A live invoice (no test badge) in Ukrainian, with one VAT-free line. */
export const LiveInvoice: Story = {
  args: {
    view: sampleCheckout(
      {},
      {
        environment: 'live',
        locale: 'uk',
        lineItems: [
          {
            name: 'Annual license',
            quantity: '1',
            unitPrice: '1200.00',
            taxCategory: 'O',
            taxRate: '0',
            netMinor: '120000',
          },
        ],
        total: '1200.00',
        totalMinor: '120000',
      },
    ),
  },
};

/** While the checkout loads. */
export const Loading: Story = { args: { mode: 'loading' } };

/** A wrong or retired payment link. */
export const NotFound: Story = { args: { mode: 'notFound' } };

/** The API is down: the buyer can try again. */
export const Failure: Story = { args: { mode: 'failure' } };

/** Two minutes before the deadline: the countdown shows seconds and screen readers hear the time left. */
export const DeadlineSoon: Story = {
  args: { view: sampleCheckout({}, { dueAt: new Date(Date.now() + 61_000).toISOString() }) },
};

const METAMASK_ON_BASE_SEPOLIA: SimulatedConnection = {
  address: '0x1111111111111111111111111111111111111111',
  chainId: 84532,
  connectorType: 'evm:metamask',
};

/** A wallet is connected on Base Sepolia: its network comes first and is marked, the wallet shows under "Wallet". */
export const ConnectedWallet: Story = { args: { wallet: METAMASK_ON_BASE_SEPOLIA } };

/** With the payment page of the invoice, an EVM method can also be paid with a QR code on a phone. */
export const WithPayUrl: Story = { args: { payUrl: 'https://quasar.tuwa.io/pay/story' } };

/** The merchant asks for the buyer's full details, and offers a company invoice. */
export const BuyerDetails: Story = {
  args: { view: sampleCheckout({ buyer: { collect: 'full', required: true, companyInvoice: true } }) },
};

/**
 * The pay step of a gasless method: "Continue" locks the price, "Sign to pay" asks the wallet for a signature and the
 * merchant pays the gas; "Pay with gas instead" sends the transfer from the wallet with a fee estimate.
 */
export const PayGasless: Story = { args: { wallet: METAMASK_ON_BASE_SEPOLIA } };

/** The merchant sponsors no gas: the buyer pays it, with an estimate in the native coin. */
export const PayWithGas: Story = { args: { wallet: METAMASK_ON_BASE_SEPOLIA, gasless: false } };

/** A smart wallet that takes a paymaster sends the quoted calls; the merchant pays the gas. */
export const SmartWallet: Story = { args: { wallet: METAMASK_ON_BASE_SEPOLIA, walletOptions: { sponsor: true } } };

/** The wallet is on Ethereum: the pay step asks to switch to Base Sepolia first. */
export const WrongNetwork: Story = { args: { wallet: { ...METAMASK_ON_BASE_SEPOLIA, chainId: 1 } } };

/**
 * The wallet holds 52.10 USDC and 0.08 ETH: the pay step offers ETH, which this wallet can pay, and the seller's
 * top-up link.
 */
export const NotEnough: Story = {
  args: {
    wallet: METAMASK_ON_BASE_SEPOLIA,
    walletOptions: { balance: 52_100_000n, balances: { native: 80_000_000_000_000_000n } },
    view: sampleCheckout({
      methods: [
        ...sampleCheckout().methods,
        {
          id: 'ap_eth_base',
          name: 'ETH on Base',
          symbol: 'ETH',
          chainId: 'eip155:84532',
          assetId: 'eip155:84532/slip44:60',
          decimals: 18,
          gasless: 'off',
          featured: false,
          markupBps: 0,
          discountBps: 0,
        },
      ],
    }),
  },
};

/** The buyer declines in the wallet: the reason and "Try again". */
export const Declined: Story = { args: { wallet: METAMASK_ON_BASE_SEPOLIA, walletOptions: { decline: true } } };

/**
 * No wallet yet: "Continue" opens the connect modal of Nova Connect on the wallets of the method's family (simulated:
 * MetaMask connects on Ethereum after a moment), then the price is locked for it.
 */
export const ConnectFromCheckout: Story = {};

/** A token that keeps a 0.2 % fee on every transfer: the buyer sends a bit more, and sees why. */
export const TransferFee: Story = { args: { wallet: METAMASK_ON_BASE_SEPOLIA, transferFeeBps: 20 } };

/** A price that holds 70 seconds: "Keep this price" shows ten seconds after it is locked. */
export const PriceEnding: Story = {
  args: { wallet: METAMASK_ON_BASE_SEPOLIA, view: sampleCheckout({ quoteTtlSeconds: 70 }) },
};

/** A Solana Pay price locked earlier without a payer: the QR code shows again, as after a reload. */
export const SolanaPayQr: Story = {
  args: {
    view: sampleCheckout({
      quote: {
        object: 'checkout_quote',
        methodId: 'ap_usdc_sol',
        payer: null,
        cryptoAmountExpected: '89540000',
        amountToSend: '89540000',
        transferFee: null,
        decimals: 6,
        symbol: 'USDC',
        lockedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 14 * 60_000).toISOString(),
        reference: '9yYb9dhzyFZGnJgUqt9uZaCvYEJcVwd8xTbgaiVtVb8Y',
        rates: [],
        markupBps: 0,
        discountBps: 0,
        instructions: {
          family: 'solana',
          chainId: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
          to: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
          token: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
          amount: '89540000',
          decimals: 6,
          symbol: 'USDC',
          reference: '9yYb9dhzyFZGnJgUqt9uZaCvYEJcVwd8xTbgaiVtVb8Y',
          solanaPayUrl:
            'solana:7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU?amount=89.54&spl-token=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU&reference=9yYb9dhzyFZGnJgUqt9uZaCvYEJcVwd8xTbgaiVtVb8Y&label=Acme%20Labs',
        },
        gasless: null,
      },
    }),
  },
};
