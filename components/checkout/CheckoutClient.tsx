'use client';

import { FormEvent, MutableRefObject, ReactNode, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import BillingForm from '@/components/checkout/BillingForm';
import {
  BillingFormValues,
  billingFingerprint,
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
import { CheckoutOrder, createCheckoutOrder, verifyCheckoutOrder } from '@/lib/api/checkout';
import { apiErrorMessage } from '@/lib/api/errors';
import { getMyProfile } from '@/lib/api/users';
import { checkoutService } from '@/lib/checkout/CheckoutService';
import { formatDurationPreset, formatPaiseAsRupees } from '@/lib/commerce-money';

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
  const [paid, setPaid] = useState(false);

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
        if (!found || offerPricePaise(found.offer) == null || stateList.length === 0) {
          setLoadError(
            !found || offerPricePaise(found.offer) == null
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

  const pay = async (event: FormEvent) => {
    event.preventDefault();
    if (!offer || price == null || payingRef.current) return;
    const errors = validateBillingForm(values);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    payingRef.current = true;
    setPaying(true);
    setNotice(null);
    const billing = toBillingInput(values);
    const fingerprint = billingFingerprint(values);
    const idempotencyKey = keyForFingerprint(intentRef, fingerprint);

    try {
      const order = await createCheckoutOrder({ offerId, billing, idempotencyKey });
      try {
        await updateBillingProfile(billing);
      } catch (error) {
        setNotice(apiErrorMessage(error, 'Could not save your billing details. Please try again.'));
        return;
      }

      if (order.status === 'PAID') {
        setPaid(true);
        return;
      }
      if (orderIsClosed(order) || order.status !== 'PENDING_PAYMENT') {
        intentRef.current = null;
        setNotice(
          orderIsClosed(order)
            ? 'This checkout has expired. Start again.'
            : 'Payment could not be started. Please try again.'
        );
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
      });

      if (result.outcome === 'dismissed') {
        setNotice('Payment was not completed. You can try again.');
        return;
      }
      if (result.outcome === 'failed') {
        setNotice(result.message);
        return;
      }

      try {
        const verified = await verifyCheckoutOrder(order.id, result.payload);
        if (verified.status !== 'PAID') {
          setNotice('Payment could not be confirmed.');
          return;
        }
        setPaid(true);
      } catch (error) {
        setNotice(apiErrorMessage(error, 'Payment could not be confirmed.'));
      }
    } catch (error) {
      setNotice(checkoutStartMessage(error));
    } finally {
      payingRef.current = false;
      setPaying(false);
    }
  };

  if (!offerId) {
    return (
      <CheckoutCard>
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        <p className="mt-2 text-sm text-gray-600">Choose a plan from View plans to continue.</p>
      </CheckoutCard>
    );
  }

  if (paid) {
    return (
      <CheckoutCard>
        <h1 className="text-2xl font-bold text-gray-900">Payment received</h1>
        <p className="mt-2 text-sm text-gray-600">Payment received. Your access is active.</p>
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
          </div>
          <BillingForm
            values={values}
            states={states}
            errors={fieldErrors}
            disabled={paying}
            onChange={setValues}
          />
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

function keyForFingerprint(
  intentRef: MutableRefObject<{ key: string; fingerprint: string } | null>,
  fingerprint: string
): string {
  if (intentRef.current?.fingerprint === fingerprint) return intentRef.current.key;
  const key = crypto.randomUUID();
  intentRef.current = { key, fingerprint };
  return key;
}
