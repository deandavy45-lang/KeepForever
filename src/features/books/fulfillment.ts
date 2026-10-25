import type { BookWithPages } from '@/data';

/**
 * Pluggable print-fulfillment adapter. Physical goods are exempt from Apple/Google in-app
 * purchase rules (App Store 3.1.5(a), Play Payments policy), so checkout can use a normal
 * payment processor inside the partner's flow.
 */
export interface FulfillmentQuote {
  provider: string;
  priceCents: number;
  currency: string;
  estimatedDeliveryDays: number;
}

export interface PrintFulfillmentProvider {
  id: string;
  displayName: string;
  quote(book: BookWithPages, postcode: string): Promise<FulfillmentQuote>;
  /** Uploads the print PDF and returns a hosted checkout URL to open in the in-app browser. */
  createOrder(book: BookWithPages, pdfUri: string): Promise<{ checkoutUrl: string }>;
}

/** Placeholder until a binding partner (e.g. Lulu Print API, Peecho, a local courier bindery) is chosen. */
export const courierBindingProvider: PrintFulfillmentProvider = {
  id: 'courier-binding',
  displayName: 'Bound & delivered to your door',
  async quote() {
    throw new Error('Print ordering is not configured yet');
  },
  async createOrder() {
    throw new Error('Print ordering is not configured yet');
  },
};
