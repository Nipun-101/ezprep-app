'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CatalogProduct,
  getProductsForExam,
  getProductsForMockTest,
  offerPricePaise,
  sellableOffers,
} from '@/lib/api/catalog';
import { formatDurationPreset, formatPaiseAsRupees } from '@/lib/commerce-money';
import Link from 'next/link';

export type ViewPlansTarget =
  | { kind: 'exam'; examId: string }
  | { kind: 'mockTest'; mockTestId: string };

interface ViewPlansDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: ViewPlansTarget | null;
}

export default function ViewPlansDialog({ open, onOpenChange, target }: ViewPlansDialogProps) {
  const router = useRouter();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [commerceEnabled, setCommerceEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [openingOfferId, setOpeningOfferId] = useState<string | null>(null);

  const examId = target?.kind === 'exam' ? target.examId : null;
  const mockTestId = target?.kind === 'mockTest' ? target.mockTestId : null;

  useEffect(() => {
    if (!open || (!examId && !mockTestId)) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    const request = examId
      ? getProductsForExam(examId)
      : getProductsForMockTest(mockTestId as string);
    request
      .then((data) => {
        if (!cancelled) {
          setProducts(data.products);
          setCommerceEnabled(data.commerceEnabled);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProducts([]);
          setError('Could not load plans. Please try again.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, examId, mockTestId, retryKey]);

  const rows = products
    .map((product) => ({ product, offers: sellableOffers(product) }))
    .filter((row) => row.offers.length > 0);

  const buy = (offerId: string) => {
    if (openingOfferId) return;
    setOpeningOfferId(offerId);
    router.push(`/dashboard/checkout?offerId=${encodeURIComponent(offerId)}`);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && openingOfferId) return;
        if (!next) setOpeningOfferId(null);
        onOpenChange(next);
      }}
    >
      <DialogContent className="flex max-h-[min(85dvh,calc(100dvh-1.5rem))] w-[calc(100%-1.5rem)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:w-full">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-5 sm:p-6">
          <DialogHeader className="pr-8 text-left">
            <DialogTitle>View plans</DialogTitle>
            <DialogDescription>
              {examId
                ? 'Published plans that cover this exam.'
                : 'Published plans that cover this test.'}
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
            </div>
          ) : error ? (
            <div className="mt-4 space-y-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              <p>{error}</p>
              <Button
                type="button"
                variant="outline"
                className="w-full border-red-200 bg-white text-red-700 hover:bg-red-50 sm:w-auto"
                onClick={() => setRetryKey((key) => key + 1)}
              >
                Try again
              </Button>
            </div>
          ) : rows.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">
              {commerceEnabled
                ? 'No plans are available for this yet.'
                : 'Purchases are not available yet.'}
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {commerceEnabled ? null : (
                <p className="text-sm text-gray-600">Purchases are not available yet.</p>
              )}
              <ul className="space-y-3">
              {rows.map(({ product, offers }) => (
                <li key={product.id} className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
                  <h3 className="break-words font-semibold text-gray-900">{product.name}</h3>
                  {product.description ? (
                    <p className="mt-1 break-words text-sm text-gray-500">{product.description}</p>
                  ) : null}
                  <ul className="mt-3 space-y-2">
                    {offers.map((offer) => {
                      const paise = offerPricePaise(offer);
                      return (
                        <li
                          key={offer.id}
                          className="flex flex-col gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <p className="break-words text-sm font-medium text-gray-900">
                              {formatDurationPreset(offer.durationPreset)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {paise != null ? formatPaiseAsRupees(paise) : '—'}
                            </p>
                            <OwnershipNote product={product} />
                          </div>
                          <PlanAction
                            product={product}
                            commerceEnabled={commerceEnabled}
                            opening={openingOfferId === offer.id}
                            disabled={openingOfferId !== null}
                            onBuy={() => buy(offer.id)}
                          />
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
            </div>
          )}
        </div>

        {openingOfferId ? (
          <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-3 bg-white/90 px-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            <p className="text-sm font-medium text-gray-700">Opening checkout</p>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function planOwnership(product: CatalogProduct): 'lifetime' | 'extend' | 'buy' {
  if (product.coveredForLife || product.ownedUntil === null) return 'lifetime';
  if (typeof product.ownedUntil === 'string' && product.ownedUntil) return 'extend';
  return 'buy';
}

function formatAccessDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function OwnershipNote({ product }: { product: CatalogProduct }) {
  const ownership = planOwnership(product);
  if (ownership === 'lifetime') {
    return (
      <p className="mt-1 text-sm text-gray-600">
        You already have lifetime access.{' '}
        <Link href="/dashboard/subscriptions" className="text-teal-700 underline">
          Subscriptions
        </Link>
      </p>
    );
  }
  if (ownership === 'extend' && product.ownedUntil) {
    const date = formatAccessDate(product.ownedUntil);
    return (
      <div className="mt-1 space-y-1 text-sm text-gray-600">
        <p>Active until {date}</p>
        <p>Starts after your current access ends on {date}.</p>
      </div>
    );
  }
  return null;
}

function PlanAction({
  product,
  commerceEnabled,
  opening,
  disabled,
  onBuy,
}: {
  product: CatalogProduct;
  commerceEnabled: boolean;
  opening: boolean;
  disabled: boolean;
  onBuy: () => void;
}) {
  if (!commerceEnabled || planOwnership(product) === 'lifetime') return null;
  const label = planOwnership(product) === 'extend' ? 'Extend' : 'Buy';
  return (
    <Button
      type="button"
      className="h-11 w-full shrink-0 bg-teal-600 text-white hover:bg-teal-700 sm:h-10 sm:w-auto"
      disabled={disabled}
      onClick={onBuy}
    >
      {opening ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Opening checkout
        </>
      ) : (
        label
      )}
    </Button>
  );
}
