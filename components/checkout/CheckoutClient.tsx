'use client';

import { FormEvent, MutableRefObject, ReactNode, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import BillingForm from '@/components/checkout/BillingForm';
import {
  BillingFormValues,
  emptyBillingForm,
  toBillingInput,
  validateBillingForm,
} from '@/components/checkout/billing-values';
import { Button } from '@/components/ui/button';
import {
  BillingProfile,
  getBillingProfile,
  getIndianStates,
  IndianStateOption,
  updateBillingProfile,
} from '@/lib/api/billing';
import { CatalogOffer, CatalogProduct, findCatalogOffer, offerPricePaise } from '@/lib/api/catalog';
import {
  CheckoutOrder,
  createCheckoutOrder,
  getCheckoutOrder,
  verifyCheckoutOrder,
} from '@/lib/api/checkout';
import { apiErrorCode, apiErrorMessage } from '@/lib/api/errors';
import { getMyProfile } from '@/lib/api/users';
import { checkoutService } from '@/lib/checkout/CheckoutService';
import { checkoutTimeoutSeconds, nextOrderPollAction } from '@/lib/checkout/poll-order-status';
import { formatDurationPreset, formatPaiseAsRupees, gstBreakdownLine } from '@/lib/commerce-money';

const GENERIC_RETRY = 'Payment could not be started. Please try again.';
const TOO_MANY_OPEN_ORDERS = 'You have a payment in progress. Finish or wait a few minutes.';
const CONFIRMING_COPY =
  'We are confirming your payment. Your access will appear in Subscriptions shortly.';
const EXPIRED_COPY = 'This payment window has expired.';
const LIFETIME_COPY = 'You already have lifetime access.';
const COMMERCE_OFF_COPY = 'Purchases are not available yet.';
const BILLING_SAVE_NOTICE = 'Your billing details were not saved for next time. You can still pay.';

const CLOSED_STATUSES = new Set(['EXPIRED', 'FAILED', 'CANCELLED', 'REFUNDED']);

function orderIsClosed(order: CheckoutOrder): boolean {
  if (CLOSED_STATUSES.has(order.status)) return true;
  if (order.status !== 'PENDING_PAYMENT' || !order.expiresAt) return false;
  const time = new Date(order.expiresAt).getTime();
  return Number.isFinite(time) && time <= Date.now();
}

function providerString(data: Record<string, unknown>, key: string): string {
  const value = data[key];
  return typeof value === 'string' ? value : '';
}

export default function CheckoutClient() {
  const params = useSearchParams();
  const offerId = params.get('offerId')?.trim() || '';
  const intentRef = useRef<{ key: string; fingerprint: string } | null>(null);
  const payingRef = useRef(false);

  const [loading, setLoading] = useState(Boolean(offerId));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [offer, setOffer] = useState<CatalogOffer | null>(null);
  const [states, setStates] = useState<IndianStateOption[]>([]);
  const [values, setValues] = useState<BillingFormValues>(emptyBillingForm);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof BillingFormValues, string>>>(
    {}
  );
  const [paying, setPaying] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [billingNotice, setBillingNotice] = useState<string | null>(null);
  const [paidOrder, setPaidOrder] = useState<CheckoutOrder | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [expired, setExpired] = useState(false);
  const [lifetime, setLifetime] = useState(false);
  const [commerceOff, setCommerceOff] = useState(false);

  useEffect(() => {
    intentRef.current = null;
    setPaidOrder(null);
    setConfirming(false);
    setExpired(false);
    setLifetime(false);
    setCommerceOff(false);
    setNotice(null);
    setBillingNotice(null);
  }, [offerId]);

  useEffect(() => {
    if (!offerId) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setProduct(null);
    setOffer(null);

    Promise.all([
      findCatalogOffer(offerId),
      getIndianStates(),
      getBillingProfile().catch(() => null),
      getMyProfile().catch(() => null),
    ])
      .then(([found, stateList, profile, account]) => {
        if (cancelled) return;
        setStates(stateList);
        if (!found.commerceEnabled) {
          setCommerceOff(true);
          return;
        }
        if (!found.offer || !found.product || offerPricePaise(found.offer) == null || stateList.length === 0) {
          setLoadError(
            !found.offer || !found.product || offerPricePaise(found.offer) == null
              ? 'This plan is not available.'
              : 'Could not load checkout. Please try again.'
          );
          return;
        }
        setProduct(found.product);
        setOffer(found.offer);
        setValues(prefill(profile, account?.name ?? ''));
      })
      .catch(() => {
        if (!cancelled) setLoadError('Could not load checkout. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [offerId, retryKey]);

  const price = offer ? offerPricePaise(offer) : null;

  const startPayment = async () => {
    if (!offer || price == null || payingRef.current) return;
    const errors = validateBillingForm(values);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    payingRef.current = true;
    setPaying(true);
    setNotice(null);
    setExpired(false);
    const billing = toBillingInput(values);
    const fingerprint = checkoutFingerprint(offerId, values);

    try {
      const order = await createOrderWithRetry(offerId, billing, fingerprint, intentRef);
      void updateBillingProfile(billing).catch(() => {
        setBillingNotice(BILLING_SAVE_NOTICE);
      });

      if (order.status === 'PAID') {
        setPaidOrder(order);
        return;
      }
      if (orderIsClosed(order) || order.status !== 'PENDING_PAYMENT') {
        intentRef.current = null;
        if (orderIsClosed(order)) {
          setExpired(true);
        } else {
          setNotice(GENERIC_RETRY);
        }
        return;
      }
      if (order.provider !== 'razorpay') {
        setNotice('This environment is not set up for card checkout.');
        return;
      }

      const result = await checkoutService.open('razorpay', {
        amount: order.amount,
        currency: order.currency,
        providerOrderId: providerString(order.providerData, 'razorpayOrderId'),
        serverKeyId: providerString(order.providerData, 'keyId'),
        description: product?.name,
        prefillName: billing.name,
        merchantName: providerString(order.providerData, 'merchantName') || undefined,
        timeoutSeconds: checkoutTimeoutSeconds(order.expiresAt, Date.now()),
        expiresAt: order.expiresAt,
      });

      if (result.outcome === 'dismissed') {
        setNotice('Payment was not completed. You can try again.');
        return;
      }
      if (result.outcome === 'expired') {
        intentRef.current = null;
        setExpired(true);
        return;
      }
      if (result.outcome === 'failed') {
        setNotice(result.message);
        return;
      }

      const confirmed = await confirmAfterHandler(order.id, result.outcome === 'success' ? result.payload : null);
      if (confirmed === 'confirming') {
        setConfirming(true);
        return;
      }
      setPaidOrder(confirmed);
    } catch (error) {
      const code = apiErrorCode(error);
      if (code === 'ALREADY_COVERED') {
        setLifetime(true);
        return;
      }
      if (code === 'TOO_MANY_OPEN_ORDERS') {
        setNotice(TOO_MANY_OPEN_ORDERS);
        return;
      }
      if (code === 'COMMERCE_DISABLED') {
        setCommerceOff(true);
        return;
      }
      if (error instanceof Error && error.message === GENERIC_RETRY) {
        setNotice(GENERIC_RETRY);
        return;
      }
      setNotice(checkoutStartMessage(error));
    } finally {
      // The click that closes Razorpay can land on Pay securely once the modal
      // is gone. Hold the lock through that second click.
      window.setTimeout(() => {
        payingRef.current = false;
        setPaying(false);
      }, 600);
    }
  };

  const pay = (event: FormEvent) => {
    event.preventDefault();
    void startPayment();
  };

  if (!offerId) {
    return (
      <CheckoutCard>
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        <p className="mt-2 text-sm text-gray-600">Choose a plan from View plans to continue.</p>
      </CheckoutCard>
    );
  }

  if (commerceOff) {
    return (
      <CheckoutCard>
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        <p className="mt-2 text-sm text-gray-600">{COMMERCE_OFF_COPY}</p>
      </CheckoutCard>
    );
  }

  if (lifetime) {
    return (
      <CheckoutCard>
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        <p className="mt-2 text-sm text-gray-600">{LIFETIME_COPY}</p>
        <Button asChild className="mt-6 bg-teal-600 text-white hover:bg-teal-700">
          <Link href="/dashboard/subscriptions">Subscriptions</Link>
        </Button>
      </CheckoutCard>
    );
  }

  if (confirming) {
    return (
      <CheckoutCard>
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        <p className="mt-2 text-sm text-gray-600">{CONFIRMING_COPY}</p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/dashboard/subscriptions">Subscriptions</Link>
        </Button>
      </CheckoutCard>
    );
  }

  if (expired) {
    return (
      <CheckoutCard>
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        <p className="mt-2 text-sm text-gray-600">{EXPIRED_COPY}</p>
        <Button
          type="button"
          className="mt-6 bg-teal-600 text-white hover:bg-teal-700"
          disabled={paying}
          onClick={() => {
            intentRef.current = null;
            void startPayment();
          }}
        >
          Try again
        </Button>
      </CheckoutCard>
    );
  }

  if (paidOrder) {
    return (
      <CheckoutCard>
        <h1 className="text-2xl font-bold text-gray-900">Payment received</h1>
        <p className="mt-2 text-sm text-gray-600">Payment received. Your access is active.</p>
        <p className="mt-4 text-sm font-medium text-gray-900">
          {formatPaiseAsRupees(paidOrder.tax?.grossAmount ?? paidOrder.amount)}
        </p>
        {paidOrder.tax ? (
          <p className="mt-1 text-sm text-gray-600">{gstBreakdownLine(paidOrder.tax)}</p>
        ) : null}
        <Button asChild className="mt-6 bg-teal-600 text-white hover:bg-teal-700">
          <Link href="/dashboard/subscriptions">View subscriptions</Link>
        </Button>
      </CheckoutCard>
    );
  }

  return (
    <CheckoutCard>
      <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <p className="text-sm font-medium text-gray-700">Loading checkout</p>
        </div>
      ) : loadError ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-red-600">{loadError}</p>
          {loadError !== 'This plan is not available.' ? (
            <Button type="button" variant="outline" onClick={() => setRetryKey((key) => key + 1)}>
              Try again
            </Button>
          ) : null}
        </div>
      ) : (
        <form className="mt-6 space-y-6" onSubmit={pay}>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="font-semibold text-gray-900">{product?.name}</p>
            <p className="mt-1 text-sm text-gray-600">
              {offer ? formatDurationPreset(offer.durationPreset) : ''}
              {price != null ? ` · ${formatPaiseAsRupees(price)}` : ''}
            </p>
            {price != null ? (
              <p className="mt-1 text-sm text-gray-600">Price includes GST</p>
            ) : null}
          </div>
          <BillingForm
            values={values}
            states={states}
            errors={fieldErrors}
            disabled={paying}
            onChange={setValues}
          />
          {billingNotice ? (
            <p className="text-sm text-gray-500">{billingNotice}</p>
          ) : null}
          {notice ? (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-800"
            >
              {notice}
            </p>
          ) : null}
          <Button
            type="submit"
            className="w-full bg-teal-600 text-white hover:bg-teal-700"
            disabled={paying || price == null}
          >
            {paying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait…
              </>
            ) : (
              'Pay securely'
            )}
          </Button>
          <div className="space-y-2 text-sm text-gray-600">
            <p>One-time payment. Does not renew. Prices include GST.</p>
            <p>
              By paying, you agree to the{' '}
              <Link href="/terms#plans" className="text-teal-700 underline">
                Terms
              </Link>{' '}
              and the{' '}
              <Link href="/terms#refunds" className="text-teal-700 underline">
                Refund policy
              </Link>
              .
            </p>
          </div>
        </form>
      )}
    </CheckoutCard>
  );
}

function checkoutStartMessage(error: unknown): string {
  const raw = apiErrorMessage(error, 'Payment could not be started. Please try again.');
  if (/providerPaymentId|provider_1_providerPaymentId/i.test(raw)) {
    return 'Payment could not be started. Please try again.';
  }
  return raw;
}

function CheckoutCard({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
      {children}
    </div>
  );
}

function prefill(profile: BillingProfile | null, accountName: string): BillingFormValues {
  if (profile) {
    return {
      name: profile.name,
      stateCode: profile.stateCode,
      addressLine1: profile.addressLine1,
      addressLine2: profile.addressLine2 ?? '',
      city: profile.city,
      pincode: profile.pincode,
    };
  }
  return { ...emptyBillingForm(), name: accountName };
}

function checkoutFingerprint(offerId: string, values: BillingFormValues): string {
  return JSON.stringify({ offerId, billing: toBillingInput(values) });
}

async function createOrderWithRetry(
  offerId: string,
  billing: ReturnType<typeof toBillingInput>,
  fingerprint: string,
  intentRef: MutableRefObject<{ key: string; fingerprint: string } | null>
): Promise<CheckoutOrder> {
  const create = (key: string) => createCheckoutOrder({ offerId, billing, idempotencyKey: key });
  const key = keyForFingerprint(intentRef, fingerprint);
  try {
    return await create(key);
  } catch (error) {
    const code = apiErrorCode(error);
    if (code === 'IDEMPOTENCY_KEY_REUSED') {
      intentRef.current = null;
      return create(keyForFingerprint(intentRef, fingerprint));
    }
    if (code === 'CHECKOUT_IN_PROGRESS') {
      await delay(1000);
      try {
        return await create(key);
      } catch (retryError) {
        const retryCode = apiErrorCode(retryError);
        if (
          retryCode === 'ALREADY_COVERED' ||
          retryCode === 'TOO_MANY_OPEN_ORDERS' ||
          retryCode === 'COMMERCE_DISABLED' ||
          retryCode === 'IDEMPOTENCY_KEY_REUSED'
        ) {
          throw retryError;
        }
        throw new Error(GENERIC_RETRY);
      }
    }
    throw error;
  }
}

async function confirmAfterHandler(
  orderId: string,
  payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string } | null
): Promise<CheckoutOrder | 'confirming'> {
  if (payload) {
    try {
      const verified = await verifyCheckoutOrder(orderId, payload);
      if (verified.status === 'PAID') return verified;
    } catch {
      // Poll. A success callback is never shown as a failure.
    }
  }

  let readsCompleted = 0;
  let resumeUsed = false;
  let status: string | null = null;
  let latest: CheckoutOrder | null = null;

  for (;;) {
    const action = nextOrderPollAction({
      readsCompleted,
      status,
      hidden: typeof document !== 'undefined' && document.hidden,
      resumeUsed,
    });
    if (action.type === 'paid') return latest ?? 'confirming';
    if (action.type === 'confirming') return 'confirming';
    if (action.type === 'pause') {
      await waitUntilVisible();
      resumeUsed = true;
      continue;
    }
    await delay(action.delayMs);
    if (typeof document !== 'undefined' && document.hidden) {
      if (resumeUsed) return 'confirming';
      await waitUntilVisible();
      resumeUsed = true;
    }
    try {
      latest = await getCheckoutOrder(orderId);
      status = latest.status;
    } catch {
      latest = null;
      status = null;
    }
    readsCompleted += 1;
    if (status === 'PAID' && latest) return latest;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function waitUntilVisible(): Promise<void> {
  if (typeof document === 'undefined' || !document.hidden) return Promise.resolve();
  return new Promise((resolve) => {
    const onChange = () => {
      if (!document.hidden) {
        document.removeEventListener('visibilitychange', onChange);
        resolve();
      }
    };
    document.addEventListener('visibilitychange', onChange);
  });
}

function keyForFingerprint(
  intentRef: MutableRefObject<{ key: string; fingerprint: string } | null>,
  fingerprint: string
): string {
  if (intentRef.current?.fingerprint === fingerprint) return intentRef.current.key;
  const key = crypto.randomUUID();
  intentRef.current = { key, fingerprint };
  return key;
}
