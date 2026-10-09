import { razorpayCheckoutAdapter } from './adapters/razorpay';
import { CheckoutAdapter, CheckoutOpenResult, OpenCheckoutInput } from './adapters/types';

const CARD_CHECKOUT_UNAVAILABLE = 'This environment is not set up for card checkout.';

export class CheckoutService {
  constructor(private readonly adapters: CheckoutAdapter[]) {}

  open(provider: string, input: OpenCheckoutInput): Promise<CheckoutOpenResult> {
    const adapter = this.adapters.find((item) => item.provider === provider);
    if (!adapter) {
      return Promise.reject(new Error(CARD_CHECKOUT_UNAVAILABLE));
    }
    return adapter.open(input);
  }
}

export const checkoutService = new CheckoutService([razorpayCheckoutAdapter]);
