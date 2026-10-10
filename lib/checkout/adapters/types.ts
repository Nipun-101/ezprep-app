export interface RazorpaySuccessPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface OpenCheckoutInput {
  amount: number;
  currency: string;
  providerOrderId: string;
  serverKeyId?: string;
  description?: string;
  prefillName?: string;
  merchantName?: string;
  /** Checkout.js timeout in seconds. */
  timeoutSeconds?: number;
  /** Order expiry. A dismiss at or after this time minus 60 seconds is a timeout. */
  expiresAt?: string;
}

export type CheckoutOpenResult =
  | { outcome: 'success'; payload: RazorpaySuccessPayload }
  | { outcome: 'confirm' }
  | { outcome: 'dismissed' }
  | { outcome: 'expired' }
  | { outcome: 'failed'; message: string };

export interface CheckoutAdapter {
  provider: string;
  open(input: OpenCheckoutInput): Promise<CheckoutOpenResult>;
}
