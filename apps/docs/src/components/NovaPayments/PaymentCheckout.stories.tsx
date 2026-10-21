import { CheckCircleIcon, FaceFrownIcon } from '@heroicons/react/24/outline';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  type CheckoutPrimaryButtonProps,
  type CheckoutScreenProps,
  type CheckoutStatusIconProps,
  type CheckoutTokenOptionProps,
  PaymentCheckout,
  type PaymentCheckoutCustomization,
  useCheckoutContext,
} from '@tuwaio/nova-payments';
import type { CheckoutQuote } from '@tuwaio/quasar-sdk/checkout';
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
  autoReturnSeconds?: number;
  customization?: PaymentCheckoutCustomization;
};

/** A checkout on a simulated Quasar API: no network, the language the buyer picks is kept. */
function SimulatedCheckout({
  display,
  wallet,
  walletOptions,
  payUrl,
  autoReturnSeconds,
  customization,
  ...simulation
}: StoryProps) {
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
        autoReturnSeconds={autoReturnSeconds}
        onPaid={action('onPaid')}
        customization={customization}
      />
    </SimulatedWallet>
  );
}

const meta: Meta<typeof SimulatedCheckout> = {
  title: 'Nova Payments/Checkout/PaymentCheckout',
  component: SimulatedCheckout,
  parameters: { layout: 'centered' },
  args: { display: 'inline', logo: false, mode: 'ok', autoReturnSeconds: 0 },
  argTypes: {
    display: { control: 'inline-radio', options: ['modal', 'inline', 'page'] },
    mode: { control: 'inline-radio', options: ['ok', 'loading', 'notFound', 'failure'] },
    customization: { control: false },
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

/**
 * Pay, then close the checkout while the wallet still asks: the transaction it sends later goes to the app's Pulsar
 * store (see the actions panel), where Nova Transactions shows its toast and keeps tracking it.
 */
export const HandOverAfterClose: Story = {
  args: { display: 'modal', wallet: METAMASK_ON_BASE_SEPOLIA, gasless: false },
};

/** The buyer declines in the wallet: the reason and "Try again". */
export const Declined: Story = { args: { wallet: METAMASK_ON_BASE_SEPOLIA, walletOptions: { decline: true } } };

/**
 * No wallet yet: "Continue" opens the connect modal of Nova Connect on the wallets of the method's family (simulated:
 * MetaMask connects on Ethereum after a moment), then the price is locked for it.
 */
export const ConnectFromCheckout: Story = {};

/** Phantom is connected on devnet: Solana comes first, and the pay step sends USDC from the wallet. */
export const PaySolanaWallet: Story = {
  args: {
    wallet: {
      address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      chainId: 'devnet',
      connectorType: 'solana:phantom',
    },
  },
};

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

/** A price locked earlier for MetaMask on Base Sepolia: the payment the outcome stories are about. */
const LOCKED: CheckoutQuote = {
  object: 'checkout_quote',
  methodId: 'ap_usdc_base',
  payer: 'eip155:84532:0x1111111111111111111111111111111111111111',
  cryptoAmountExpected: '89540000',
  amountToSend: '89540000',
  transferFee: null,
  decimals: 6,
  symbol: 'USDC',
  lockedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 14 * 60_000).toISOString(),
  reference: null,
  rates: [],
  markupBps: 0,
  discountBps: 0,
  instructions: {
    family: 'eip155',
    chainId: 84532,
    to: '0x2222222222222222222222222222222222222222',
    token: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    amount: '89540000',
    decimals: 6,
    symbol: 'USDC',
  },
  gasless: null,
};

/** An invoice of the stories in another state, with the locked price. */
const settled = (invoice: Partial<ReturnType<typeof sampleCheckout>['invoice']>, extra = {}) =>
  sampleCheckout({ quote: LOCKED, ...extra }, invoice);

/** The transaction is on its way: Sent, then Confirming, with the network, amount and sender. */
export const Confirming: Story = {
  args: { wallet: METAMASK_ON_BASE_SEPOLIA, view: settled({ status: 'processing' }) },
};

/** Paid: the amount, network and steps, the receipt to download, and the way back to the seller. */
export const Paid: Story = {
  args: { view: settled({ status: 'paid', amountPaid: '89540000', successUrl: 'https://acme.example/thanks' }) },
};

/** Paid with a return link: a visible countdown sends the buyer back, unless "Stay here". */
export const PaidReturnCountdown: Story = {
  args: { autoReturnSeconds: 30, view: settled({ status: 'paid', amountPaid: '89540000', successUrl: '#returned' }) },
};

/** Paid, then the seller refunded a part. */
export const PartRefunded: Story = {
  args: { view: settled({ status: 'partially_refunded', amountPaid: '89540000', refundedTotalMinor: '1000' }) },
};

/** A paid subscription period: the checkout offers automatic payments for the next ones (ERC-7715). */
export const SubscriptionAutoPay: Story = {
  args: {
    wallet: METAMASK_ON_BASE_SEPOLIA,
    view: settled(
      {
        status: 'paid',
        amountPaid: '89540000',
        subscription: {
          status: 'active',
          interval: 'month',
          intervalCount: 1,
          period: 1,
          periodStart: new Date().toISOString(),
          periodEnd: new Date(Date.now() + 30 * 86_400_000).toISOString(),
          cycles: null,
          endsAt: null,
          cancelAtPeriodEnd: false,
        },
      },
      {
        autoCharge: {
          status: 'available',
          methodId: 'ap_usdc_base',
          request: {
            chainId: '0x14a34',
            to: '0x3333333333333333333333333333333333333333',
            permission: {
              type: 'erc20-token-periodic',
              isAdjustmentAllowed: false,
              data: {
                tokenAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
                periodAmount: '0x2ebae40',
                periodDuration: 2_592_000,
                startTime: Math.floor(Date.now() / 1000),
                justification: 'Pro plan',
              },
            },
            rules: [{ type: 'expiry', data: { timestamp: Math.floor(Date.now() / 1000) + 365 * 86_400 } }],
          },
        },
      },
    ),
  },
};

/** Part of the payment arrived: the rest, from the same wallet, with "Pay the rest". */
export const Underpaid: Story = {
  args: { wallet: METAMASK_ON_BASE_SEPOLIA, view: settled({ status: 'underpaid', amountPaid: '80000000' }) },
};

/** The buyer sent more: the seller reviews the payment. */
export const OnReview: Story = {
  args: { view: settled({ status: 'held', amountPaid: '91000000', review: { reason: 'overpaid' } }) },
};

/** The seller refunded the whole invoice. */
export const Refunded: Story = { args: { view: settled({ status: 'refunded', refundedTotalMinor: '8954' }) } };

/** The deadline passed before the payment. */
export const Expired: Story = {
  args: { view: sampleCheckout({}, { status: 'expired', dueAt: new Date(Date.now() - 3_600_000).toISOString() }) },
};

/** The seller cancelled the invoice. */
export const Cancelled: Story = { args: { view: sampleCheckout({}, { status: 'cancelled' }) } };

/** The seller corrected the invoice: "Open INV-2026-43" opens the new one in the checkout. */
export const Replaced: Story = {
  args: {
    view: sampleCheckout(
      {},
      { status: 'cancelled', replacedBy: { number: 'INV-2026-43', checkoutToken: 'replacement' } },
    ),
    afterReplace: sampleCheckout({}, { id: 'inv_replacement', number: 'INV-2026-43' }),
  },
};

/** The wallet check refused the payer: "Use another wallet". */
export const Blocked: Story = { args: { wallet: METAMASK_ON_BASE_SEPOLIA, quoteError: 'payer_blocked' } };

/** The wallet check is down: the method step says so, in the language of the checkout. */
export const ScreeningUnavailable: Story = {
  args: { wallet: METAMASK_ON_BASE_SEPOLIA, quoteError: 'screening_unavailable' },
};

// --- Customization ---

/**
 * Class name functions add classes to the parts from the state of the checkout. They come after the default classes:
 * change colors the parts already set with the `--tuwa-*` variables, or replace the part.
 */
const brandClassNames: PaymentCheckoutCustomization['classNames'] = {
  container: ({ screen }) =>
    screen === 'paid' ? 'ring-2 ring-emerald-500/50 shadow-xl' : 'ring-2 ring-indigo-500/40 shadow-xl',
  step: ({ step }) => (step.state === 'current' ? 'rounded bg-indigo-500/10 pr-1.5' : undefined),
  tokenOption: ({ selected }) => (selected ? 'shadow-md' : undefined),
  networkOption: ({ method }) => (method.featured ? 'ring-1 ring-indigo-400/60' : undefined),
  primaryButton: () => 'uppercase tracking-widest',
  total: () => 'rounded border border-dashed border-indigo-400/60 px-2 py-1',
  statusIcon: () => 'drop-shadow',
};

/** Classes from the state of the checkout: a ring on the block, the current step marked, the chosen token raised. */
export const CustomClassNames: Story = { args: { customization: { classNames: brandClassNames } } };

/** The main button of the app: same props as the default one (`busy`, `disabled`, `onClick`, `type`…). */
function BrandButton({ busy, children, className, ...props }: CheckoutPrimaryButtonProps) {
  return (
    <button
      type="button"
      {...props}
      disabled={props.disabled || busy}
      aria-busy={busy || undefined}
      className={`inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-[var(--tuwa-rounded-corners)] border-0 bg-emerald-700 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70 ${className ?? ''}`}
    >
      {children}
    </button>
  );
}

/** A token card that shows how many networks the token is on. */
function BrandTokenOption({ group, selected }: CheckoutTokenOptionProps) {
  return (
    <>
      <span className="text-[13px] font-bold">{group.symbol}</span>
      <span className="text-[11px] text-[var(--tuwa-text-secondary)]">
        {group.methods.length} {group.methods.length === 1 ? 'network' : 'networks'}
        {selected ? ' · chosen' : ''}
      </span>
    </>
  );
}

/** One icon for every outcome other than paid. */
function BrandStatusIcon({ className }: CheckoutStatusIconProps) {
  return <FaceFrownIcon aria-hidden className={`h-12 w-12 text-indigo-500 ${className ?? ''}`} />;
}

/** The app's own paid screen, reading the checkout with `useCheckoutContext`. */
function BrandPaidScreen({ screen }: CheckoutScreenProps) {
  const { checkout, close } = useCheckoutContext();
  return (
    <section
      data-screen={screen}
      className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-[var(--tuwa-text-primary)]"
    >
      <CheckCircleIcon aria-hidden className="h-12 w-12 text-emerald-600" />
      <h2 className="m-0 text-lg font-semibold">Thank you for your order</h2>
      <p className="m-0 text-sm text-[var(--tuwa-text-secondary)]">
        {checkout?.merchant.name} received the payment of invoice {checkout?.invoice.number}.
      </p>
      {close && <BrandButton onClick={close}>Back to the shop</BrandButton>}
    </section>
  );
}

const brandComponents: PaymentCheckoutCustomization['components'] = {
  PrimaryButton: BrandButton,
  TokenOption: BrandTokenOption,
  StatusIcon: BrandStatusIcon,
  screens: { paid: BrandPaidScreen },
};

/** Parts replaced by the app's components: the main button, the token cards, the outcome icon. */
export const CustomComponents: Story = { args: { customization: { components: brandComponents } } };

/** The paid screen replaced by the app's own (`components.screens.paid`). */
export const CustomPaidScreen: Story = {
  args: {
    customization: { components: brandComponents },
    view: settled({ status: 'paid', amountPaid: '89540000' }),
  },
};

/** An outcome with the app's icon and classes. */
export const CustomOutcome: Story = {
  args: {
    customization: { classNames: brandClassNames, components: brandComponents },
    view: sampleCheckout({}, { status: 'cancelled' }),
  },
};

/** Handlers that log every action of the buyer and every event to the Actions panel, then let the checkout go on. */
const loggingHandlers: PaymentCheckoutCustomization['handlers'] = {
  onMethodSelect: ({ method, select }) => {
    action('onMethodSelect')(method.id);
    select();
  },
  onQuote: async ({ method, payWith, proceed }) => {
    action('onQuote')(method.id, payWith);
    await proceed();
  },
  onSubmit: async ({ quote, proceed }) => {
    action('onSubmit')(quote.amountToSend, quote.instructions.symbol);
    await proceed();
  },
  onLocaleChange: async ({ locale, proceed }) => {
    action('onLocaleChange')(locale);
    await proceed();
  },
  onStatusChange: action('onStatusChange'),
  onError: action('onError'),
  onExpire: action('onExpire'),
};

/** Every handler logs to the Actions panel: pick a token or a network, continue, pay, change the language. */
export const WithHandlers: Story = {
  args: { wallet: METAMASK_ON_BASE_SEPOLIA, customization: { handlers: loggingHandlers } },
};

/** No steps in the header, no animations, no balance check, the deadline announced 15 and 5 minutes before. */
export const WithConfig: Story = {
  args: {
    wallet: METAMASK_ON_BASE_SEPOLIA,
    customization: {
      config: { showSteps: false, animation: { disabled: true }, balanceCheck: false, deadlineAnnouncements: [15, 5] },
    },
  },
};

/** The Nova Transactions parts of the paid step styled through `childCustomizations`. */
export const WithChildCustomizations: Story = {
  args: {
    view: settled({ status: 'paid', amountPaid: '89540000' }),
    customization: {
      childCustomizations: {
        statusVisual: { iconClassNames: { icon: 'text-indigo-500' } },
        progressIndicator: { stepClassNames: { label: 'uppercase tracking-wider' } },
        hashLink: { classNames: { hash: 'font-semibold' } },
      },
    },
  },
};
