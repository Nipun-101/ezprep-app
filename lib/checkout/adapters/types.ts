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
}

export type CheckoutOpenResult =
  | { outcome: 'success'; payload: RazorpaySuccessPayload }
  | { outcome: 'dismissed' }
  | { outcome: 'failed'; message: string };

export interface CheckoutAdapter {
  provider: string;
  open(input: OpenCheckoutInput): Promise<CheckoutOpenResult>;
}
