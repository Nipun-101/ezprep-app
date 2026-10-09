import { BillingInput } from './billing';
import apiClient from './client';

export interface CheckoutOrder {
  id: string;
  status: string;
  amount: number;
  currency: string;
  provider: string;
  providerData: Record<string, unknown>;
  expiresAt?: string;
  paidAt?: string;
}

export interface RazorpayVerifyPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export async function createCheckoutOrder(body: {
  offerId: string;
  billing: BillingInput;
  idempotencyKey: string;
}): Promise<CheckoutOrder> {
  const response = await apiClient.post<{ message: string; data: CheckoutOrder }>(
    '/api/v1/checkout/orders',
    body
  );
  return response.data.data;
}

export async function verifyCheckoutOrder(
  orderId: string,
  providerPayload: RazorpayVerifyPayload
): Promise<CheckoutOrder> {
  const response = await apiClient.post<{ message: string; data: CheckoutOrder }>(
    `/api/v1/checkout/orders/${orderId}/verify`,
    { provider: 'razorpay', providerPayload }
  );
  return response.data.data;
}
