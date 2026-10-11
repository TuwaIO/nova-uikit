import type { Meta, StoryObj } from '@storybook/react-vite';
import { PaymentCheckout } from '@tuwaio/nova-payments';
import { useMemo, useState } from 'react';
import { action } from 'storybook/actions';

import { sampleCheckout, simulatedCheckoutApi, type SimulationOptions } from '../../utils/payments/simulatedCheckout';
import { SimulatedWallet } from '../../utils/payments/simulatedWallet';

type StoryProps = SimulationOptions & {
  display: 'modal' | 'inline' | 'page';
  wallet?: { address: string; chainId: string | number; connectorType: string };
  payUrl?: string;
};

/** A checkout on a simulated Quasar API: no network, the language the buyer picks is kept. */
function SimulatedCheckout({ display, wallet, payUrl, ...simulation }: StoryProps) {
  const api = useMemo(() => simulatedCheckoutApi(simulation), [simulation]);
  const [open, setOpen] = useState(true);
  return (
    <SimulatedWallet connection={wallet}>
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

/** A wallet is connected on Base Sepolia: its network comes first and is marked, the wallet shows under "Wallet". */
export const ConnectedWallet: Story = {
  args: {
    wallet: { address: '0x1111111111111111111111111111111111111111', chainId: 84532, connectorType: 'evm:metamask' },
  },
};

/** With the payment page of the invoice, an EVM method can also be paid with a QR code on a phone. */
export const WithPayUrl: Story = { args: { payUrl: 'https://quasar.tuwa.io/pay/story' } };

/** The merchant asks for the buyer's full details, and offers a company invoice. */
export const BuyerDetails: Story = {
  args: { view: sampleCheckout({ buyer: { collect: 'full', required: true, companyInvoice: true } }) },
};
