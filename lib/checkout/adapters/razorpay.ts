import { dismissIsCheckoutTimeout } from '../poll-order-status';
import {
  CheckoutAdapter,
  CheckoutOpenResult,
  OpenCheckoutInput,
  RazorpaySuccessPayload,
} from './types';

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

interface RazorpayFailedResponse {
  error?: {
    description?: string;
    reason?: string;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: 'payment.failed', handler: (response: RazorpayFailedResponse) => void) => void;
}

interface RazorpayConstructor {
  new (options: Record<string, unknown>): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

let scriptPromise: Promise<void> | null = null;
let checkoutOpen = false;

function publicKeyId(): string {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() ?? '';
}

function loadCheckoutScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Payment could not be started. Please try again.'));
  }
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('Payment could not be started. Please try again.'));
    };
    document.body.appendChild(script);
  });
  return scriptPromise;
}

function isSuccessPayload(value: unknown): value is RazorpaySuccessPayload {
  if (!value || typeof value !== 'object') return false;
  const payload = value as Record<string, unknown>;
  return (
    typeof payload.razorpay_order_id === 'string' &&
    payload.razorpay_order_id.trim().length > 0 &&
    typeof payload.razorpay_payment_id === 'string' &&
    payload.razorpay_payment_id.trim().length > 0 &&
    typeof payload.razorpay_signature === 'string' &&
    payload.razorpay_signature.trim().length > 0
  );
}

export const razorpayCheckoutAdapter: CheckoutAdapter = {
  provider: 'razorpay',

  async open(input: OpenCheckoutInput): Promise<CheckoutOpenResult> {
    const key = publicKeyId();
    const serverKey = input.serverKeyId?.trim() ?? '';
    if (!key || (serverKey && serverKey !== key)) {
      throw new Error('Card checkout is not configured.');
    }
    if (!input.providerOrderId.trim()) {
      throw new Error('Payment could not be started. Please try again.');
    }

    if (checkoutOpen) {
      throw new Error('Payment could not be started. Please try again.');
    }

    await loadCheckoutScript();
    const Razorpay = window.Razorpay;
    if (!Razorpay) {
      throw new Error('Payment could not be started. Please try again.');
    }

    checkoutOpen = true;
    return new Promise((resolve) => {
      let settled = false;
      let lastError: string | null = null;
      const finish = (result: CheckoutOpenResult) => {
        if (settled) return;
        settled = true;
        checkoutOpen = false;
        resolve(result);
      };

      const checkout = new Razorpay({
        key,
        amount: input.amount,
        currency: input.currency,
        order_id: input.providerOrderId,
        name: input.merchantName?.trim() || 'EzPrep',
        description: input.description,
        prefill: input.prefillName ? { name: input.prefillName } : undefined,
        ...(typeof input.timeoutSeconds === 'number' && input.timeoutSeconds > 0
          ? { timeout: input.timeoutSeconds }
          : {}),
        handler: (response: unknown) => {
          if (!isSuccessPayload(response)) {
            finish({ outcome: 'confirm' });
            return;
          }
          finish({ outcome: 'success', payload: response });
        },
        modal: {
          ondismiss: () => {
            if (dismissIsCheckoutTimeout(input.expiresAt, Date.now())) {
              finish({ outcome: 'expired' });
              return;
            }
            if (lastError) {
              finish({ outcome: 'failed', message: lastError });
              return;
            }
            finish({ outcome: 'dismissed' });
          },
        },
        theme: { color: '#0d9488' },
      });

      checkout.on('payment.failed', (response) => {
        lastError =
          response.error?.description?.trim() ||
          response.error?.reason?.trim() ||
          'Payment failed.';
      });
      try {
        checkout.open();
      } catch (error) {
        finish({
          outcome: 'failed',
          message:
            error instanceof Error && error.message
              ? error.message
              : 'Payment could not be started. Please try again.',
        });
      }
    });
  },
};
