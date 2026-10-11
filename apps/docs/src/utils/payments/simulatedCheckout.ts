import { QuasarSDKError } from '@tuwaio/quasar-sdk';
import type { CheckoutApi, CheckoutView } from '@tuwaio/quasar-sdk/checkout';

/** A logo for the stories: the letter A on the TUWA blue. */
export const STORY_LOGO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><rect width="36" height="36" rx="4" fill="#111827"/><path d="M18 8l8 20h-4l-1.6-4h-4.8L14 28h-4l8-20zm0 7l-1.6 5h3.2L18 15z" fill="#fff"/></svg>',
  );

/** The invoice of the sketch: three lines with VAT 21 %, due in about a day, on test networks. */
export function sampleCheckout(
  overrides: Partial<CheckoutView> = {},
  invoice: Partial<CheckoutView['invoice']> = {},
): CheckoutView {
  return {
    object: 'checkout',
    merchant: {
      name: 'Acme Labs',
      website: 'https://acme.example',
      supportEmail: 'support@acme.example',
      logo: false,
      seller: {
        legalName: 'Acme Labs B.V.',
        tradingName: 'Acme Labs',
        address: 'Main 1, 1011 AB Amsterdam',
        country: 'NL',
        registrationNumber: 'KvK 12345678',
        taxId: 'NL123456789B01',
      },
      links: {
        terms: 'https://acme.example/terms',
        refundPolicy: 'https://acme.example/refunds',
        privacy: 'https://acme.example/privacy',
      },
      fundingUrl: 'https://acme.example/get-usdc',
    },
    theme: { mode: 'system', accentColor: null },
    invoice: {
      id: 'inv_story',
      number: 'INV-2026-42',
      status: 'open',
      environment: 'test',
      currency: 'USD',
      total: '89.54',
      totalMinor: '8954',
      lineItems: [
        {
          name: 'Pro plan, October',
          quantity: '1',
          unitPrice: '49.00',
          taxCategory: 'S',
          taxRate: '21',
          netMinor: '4900',
        },
        { name: 'Extra seats', quantity: '3', unitPrice: '5.00', taxCategory: 'S', taxRate: '21', netMinor: '1500' },
        {
          name: 'Onboarding call',
          quantity: '1',
          unitPrice: '10.00',
          taxCategory: 'S',
          taxRate: '21',
          netMinor: '1000',
        },
      ],
      locale: 'en',
      dueAt: new Date(Date.now() + 23 * 3_600_000 + 41 * 60_000).toISOString(),
      successUrl: null,
      cancelUrl: null,
      amountPaid: null,
      review: null,
      refundedTotalMinor: null,
      replacedBy: null,
      subscription: null,
      ...invoice,
    },
    buyer: { collect: 'off', required: false, companyInvoice: false },
    methods: [
      {
        id: 'ap_usdc_base',
        name: 'USDC on Base',
        symbol: 'USDC',
        chainId: 'eip155:84532',
        assetId: null,
        decimals: 6,
        gasless: 'auto',
        featured: true,
      },
      {
        id: 'ap_usdc_sol',
        name: 'USDC on Solana',
        symbol: 'USDC',
        chainId: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
        assetId: null,
        decimals: 6,
        gasless: 'off',
        featured: false,
      },
      {
        id: 'ap_sol',
        name: 'SOL',
        symbol: 'SOL',
        chainId: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
        assetId: null,
        decimals: 9,
        gasless: 'off',
        featured: false,
      },
    ],
    quote: null,
    autoCharge: null,
    ...overrides,
  };
}

/** What the simulated checkout answers. */
export interface SimulationOptions {
  /** The checkout to show. */
  view?: CheckoutView;
  /** `loading`: never answers; `notFound`: a retired link; `failure`: the API is down. */
  mode?: 'ok' | 'loading' | 'notFound' | 'failure';
  /** Serve a logo. */
  logo?: boolean;
}

/**
 * A checkout API without a network, for the stories (`api` of `PaymentCheckout`): it answers from memory, keeps the
 * language the buyer picks and refuses as the engine would.
 */
export function simulatedCheckoutApi({
  view = sampleCheckout(),
  mode = 'ok',
  logo = false,
}: SimulationOptions = {}): CheckoutApi {
  let current: CheckoutView = { ...view, merchant: { ...view.merchant, logo } };
  const never = <T>() => new Promise<T>(() => undefined);
  const refuse = (code: string, status: number) => {
    const message = code === 'checkout_not_found' ? 'No such checkout' : 'Service unavailable';
    return Promise.reject(new QuasarSDKError(message, status, new Error(message), { code }));
  };
  return {
    view: () => {
      if (mode === 'loading') return never();
      if (mode === 'notFound') return refuse('checkout_not_found', 404);
      if (mode === 'failure') return refuse('request_failed', 503);
      return Promise.resolve(current);
    },
    quote: () => never(),
    buyer: () => Promise.resolve(current),
    locale: (locale) => {
      current = { ...current, invoice: { ...current.invoice, locale } };
      return Promise.resolve({ locale });
    },
    submit: () => never(),
    relay: () => never(),
    permission: () => never(),
    url: (route) => (route === 'logo' ? STORY_LOGO : `sim://checkout/${route}`),
  };
}
