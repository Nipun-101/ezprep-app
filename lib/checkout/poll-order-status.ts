/** Delays after the success callback, in order. Five reads at most. */
export const ORDER_POLL_DELAYS_MS = [2_000, 4_000, 8_000, 16_000, 30_000] as const;

export function orderPollDelayMs(readIndex: number): number | null {
  if (!Number.isInteger(readIndex) || readIndex < 0) return null;
  return ORDER_POLL_DELAYS_MS[readIndex] ?? null;
}

/**
 * Checkout.js `timeout` in seconds: time left until `expiresAt`, minus 60, with a floor of 120.
 */
export function checkoutTimeoutSeconds(expiresAt: string | undefined, nowMs: number): number {
  const expiry = expiresAt ? new Date(expiresAt).getTime() : Number.NaN;
  if (!Number.isFinite(expiry)) return 120;
  const remaining = Math.floor((expiry - nowMs) / 1000) - 60;
  return Math.max(120, remaining);
}

/** True once the modal timeout point (expiresAt minus 60 seconds) has been reached. */
export function dismissIsCheckoutTimeout(expiresAt: string | undefined, nowMs: number): boolean {
  const expiry = expiresAt ? new Date(expiresAt).getTime() : Number.NaN;
  if (!Number.isFinite(expiry)) return false;
  return nowMs >= expiry - 60_000;
}

export type OrderPollAction =
  | { type: 'paid' }
  | { type: 'wait'; delayMs: number }
  | { type: 'pause' }
  | { type: 'confirming' };

/**
 * Next step for a confirmation poll.
 * `readsCompleted` is how many order reads have already happened.
 * A hidden page pauses once (`resumeUsed` false). A second hide stops at the confirming screen.
 */
export function nextOrderPollAction(input: {
  readsCompleted: number;
  status: string | null;
  hidden: boolean;
  resumeUsed: boolean;
}): OrderPollAction {
  if (input.status === 'PAID') return { type: 'paid' };
  if (input.readsCompleted >= ORDER_POLL_DELAYS_MS.length) return { type: 'confirming' };
  if (input.hidden) {
    return input.resumeUsed ? { type: 'confirming' } : { type: 'pause' };
  }
  const delayMs = orderPollDelayMs(input.readsCompleted);
  if (delayMs == null) return { type: 'confirming' };
  return { type: 'wait', delayMs };
}
