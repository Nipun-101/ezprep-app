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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

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
        if (!cancelled) setProducts(data);
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
    onOpenChange(false);
    router.push(`/dashboard/checkout?offerId=${encodeURIComponent(offerId)}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto">
        <DialogHeader>
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
          <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            <p>{error}</p>
            <Button
              type="button"
              variant="outline"
              className="border-red-200 bg-white text-red-700 hover:bg-red-50"
              onClick={() => setRetryKey((key) => key + 1)}
            >
              Try again
            </Button>
          </div>
        ) : rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">
            No plans are available for this yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {rows.map(({ product, offers }) => (
              <li key={product.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                {product.description ? (
                  <p className="mt-1 text-sm text-gray-500">{product.description}</p>
                ) : null}
                <ul className="mt-3 space-y-2">
                  {offers.map((offer) => {
                    const paise = offerPricePaise(offer);
                    return (
                      <li
                        key={offer.id}
                        className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDurationPreset(offer.durationPreset)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {paise != null ? formatPaiseAsRupees(paise) : '—'}
                          </p>
                        </div>
                        <Button
                          type="button"
                          className="w-full bg-teal-600 text-white hover:bg-teal-700 sm:w-auto"
                          onClick={() => buy(offer.id)}
                        >
                          Buy
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
