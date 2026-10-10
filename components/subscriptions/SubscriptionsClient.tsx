'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiErrorMessage } from '@/lib/api/errors';
import { MyEntitlement, getMyEntitlements } from '@/lib/api/entitlements';
import { MyInvoice, downloadMyInvoice, getMyInvoices } from '@/lib/api/invoices';
import { MyOrder, getMyOrder, getMyOrders } from '@/lib/api/orders';
import { resolveScopeLabel } from '@/lib/api/scope-labels';
import { formatDurationPreset, formatPaiseAsRupees, gstBreakdownLine } from '@/lib/commerce-money';

const ORDER_STATUS_LABELS: Record<string, string> = {
  CREATED: 'Created',
  PENDING_PAYMENT: 'Pending',
  PAID: 'Paid',
  FAILED: 'Failed',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
};

interface AccessCard {
  id: string;
  title: string;
  scopes: string[];
  startsAt: string;
  expiresAt: string | null;
}

export default function SubscriptionsClient() {
  const [loading, setLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);
  const [accessCards, setAccessCards] = useState<AccessCard[]>([]);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [ordersPage, setOrdersPage] = useState(1);
  const [hasMoreOrders, setHasMoreOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [invoices, setInvoices] = useState<MyInvoice[]>([]);
  const [invoicesError, setInvoicesError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setAccessError(null);
    setOrdersError(null);
    setInvoicesError(null);

    Promise.allSettled([
      getMyEntitlements(),
      getMyOrders({ page: 1, limit: 20 }),
      getMyInvoices(),
    ]).then(async ([entitlementResult, orderResult, invoiceResult]) => {
      if (cancelled) return;

      const loadedOrders = orderResult.status === 'fulfilled' ? orderResult.value.data : [];
      if (orderResult.status === 'fulfilled') {
        setOrders(loadedOrders);
        setOrdersPage(1);
        setHasMoreOrders(orderResult.value.pagination?.hasNextPage ?? false);
      } else {
        setOrders([]);
        setOrdersError(apiErrorMessage(orderResult.reason, 'Could not load orders.'));
      }

      if (invoiceResult.status === 'fulfilled') {
        setInvoices(invoiceResult.value);
      } else {
        setInvoices([]);
        setInvoicesError(apiErrorMessage(invoiceResult.reason, 'Could not load invoices.'));
      }

      if (entitlementResult.status === 'fulfilled') {
        setAccessCards(await buildAccessCards(entitlementResult.value, loadedOrders));
      } else {
        setAccessCards([]);
        setAccessError(apiErrorMessage(entitlementResult.reason, 'Could not load access.'));
      }

      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  const loadMoreOrders = async () => {
    setLoadingMore(true);
    setOrdersError(null);
    try {
      const next = ordersPage + 1;
      const page = await getMyOrders({ page: next, limit: 20 });
      setOrders((current) => [...current, ...page.data]);
      setOrdersPage(next);
      setHasMoreOrders(page.pagination?.hasNextPage ?? false);
    } catch (error) {
      setOrdersError(apiErrorMessage(error, 'Could not load orders.'));
    } finally {
      setLoadingMore(false);
    }
  };

  const download = async (invoice: MyInvoice) => {
    setDownloadingId(invoice.id);
    setDownloadError(null);
    try {
      await downloadMyInvoice(invoice.id, invoiceFilename(invoice.invoiceNumber));
    } catch (error) {
      setDownloadError(apiErrorMessage(error, 'Could not download the invoice.'));
    } finally {
      setDownloadingId(null);
    }
  };

  const pendingInvoices = invoicesError
    ? []
    : orders.filter(
        (order) => order.status === 'PAID' && !invoices.some((invoice) => invoice.orderId === order.id)
      );

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">My Subscriptions</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Active access</h2>
        {accessError ? <ErrorText message={accessError} onRetry={() => setRetryKey((key) => key + 1)} /> : null}
        {!accessError && accessCards.length === 0 ? (
          <p className="text-sm text-gray-600">You do not have active access yet.</p>
        ) : null}
        <ul className="space-y-3">
          {accessCards.map((card) => (
            <li key={card.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="font-semibold text-gray-900">{card.title}</p>
              {card.scopes.length > 0 ? (
                <p className="mt-1 text-sm text-gray-600">{card.scopes.join(', ')}</p>
              ) : null}
              <p className="mt-2 text-sm text-gray-500">
                {formatWhen(card.startsAt)} – {card.expiresAt ? formatWhen(card.expiresAt) : 'Lifetime'}
              </p>
              {isFutureStart(card.startsAt) ? (
                <p className="mt-1 text-sm text-gray-500">Starts {formatWhen(card.startsAt)}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Orders</h2>
        {ordersError ? <ErrorText message={ordersError} /> : null}
        {!ordersError && orders.length === 0 ? (
          <p className="text-sm text-gray-600">No orders yet.</p>
        ) : null}
        <ul className="space-y-3">
          {orders.map((order) => (
            <li key={order.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                  <p className="text-sm text-gray-600">{orderProductLabel(order)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatPaiseAsRupees(order.amount)}</p>
                  {order.tax ? (
                    <p className="text-sm text-gray-500">{gstBreakdownLine(order.tax)}</p>
                  ) : null}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {orderStatusLabel(order.status)} · {formatWhen(order.paidAt || order.createdAt)}
              </p>
            </li>
          ))}
        </ul>
        {hasMoreOrders ? (
          <Button type="button" variant="outline" disabled={loadingMore} onClick={loadMoreOrders}>
            {loadingMore ? 'Loading…' : 'Show more'}
          </Button>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Invoices</h2>
        {invoicesError ? <ErrorText message={invoicesError} /> : null}
        {downloadError ? <p className="text-sm text-red-600">{downloadError}</p> : null}
        {!invoicesError && invoices.length === 0 && pendingInvoices.length === 0 ? (
          <p className="text-sm text-gray-600">No invoices yet.</p>
        ) : null}
        <ul className="space-y-3">
          {pendingInvoices.map((order) => (
            <li key={order.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="font-semibold text-gray-900">{order.orderNumber}</p>
              <p className="text-sm text-gray-500">Invoice is being prepared</p>
            </li>
          ))}
          {invoices.map((invoice) => (
            <li
              key={invoice.id}
              className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-gray-900">{invoice.invoiceNumber}</p>
                <p className="text-sm text-gray-500">
                  {formatWhen(invoice.issuedAt)} · {formatPaiseAsRupees(invoice.grossAmount)}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={downloadingId === invoice.id}
                onClick={() => download(invoice)}
              >
                {downloadingId === invoice.id ? 'Downloading…' : 'Download invoice'}
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ErrorText({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-red-600">{message}</p>
      {onRetry ? (
        <Button type="button" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

async function buildAccessCards(rows: MyEntitlement[], orders: MyOrder[]): Promise<AccessCard[]> {
  const names = new Map(orders.map((order) => [order.id, orderProductNames(order)]));
  const grouped = new Map<string, MyEntitlement[]>();
  const grants: MyEntitlement[] = [];

  for (const row of rows) {
    if (row.orderId) {
      const list = grouped.get(row.orderId) ?? [];
      list.push(row);
      grouped.set(row.orderId, list);
    } else {
      grants.push(row);
    }
  }

  const cards: AccessCard[] = [];
  for (const [orderId, group] of Array.from(grouped.entries())) {
    cards.push({
      id: orderId,
      title: names.get(orderId) ?? (await orderTitle(orderId)),
      scopes: await Promise.all(group.map((item) => resolveScopeLabel(item.scopeType, item.scopeId))),
      startsAt: earliest(group.map((item) => item.startsAt)),
      expiresAt: combinedExpiry(group),
    });
  }

  for (const grant of grants) {
    cards.push({
      id: grant.id,
      title: await resolveScopeLabel(grant.scopeType, grant.scopeId),
      scopes: [],
      startsAt: grant.startsAt,
      expiresAt: grant.expiresAt,
    });
  }
  return cards;
}

async function orderTitle(orderId: string): Promise<string> {
  try {
    return orderProductNames(await getMyOrder(orderId));
  } catch {
    return 'Purchase';
  }
}

function orderProductNames(order: MyOrder): string {
  const names = order.items.map((item) => item.productName).filter(Boolean);
  return names.join(', ') || 'Purchase';
}

function orderProductLabel(order: MyOrder): string {
  const names = order.items
    .map((item) => {
      const duration = item.durationPreset ? formatDurationPreset(item.durationPreset) : '';
      return duration ? `${item.productName} · ${duration}` : item.productName;
    })
    .filter(Boolean);
  return names.join(', ') || 'Purchase';
}

function earliest(values: string[]): string {
  return values.reduce((best, value) =>
    new Date(value).getTime() < new Date(best).getTime() ? value : best
  );
}

function combinedExpiry(rows: MyEntitlement[]): string | null {
  if (rows.some((row) => !row.expiresAt)) return null;
  return rows.reduce<string | null>((latest, row) => {
    if (!row.expiresAt) return latest;
    if (!latest || new Date(row.expiresAt).getTime() > new Date(latest).getTime()) {
      return row.expiresAt;
    }
    return latest;
  }, null);
}

function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}

function isFutureStart(value: string): boolean {
  const time = new Date(value).getTime();
  return Number.isFinite(time) && time > Date.now();
}

function formatWhen(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function invoiceFilename(invoiceNumber: string): string {
  const safe = invoiceNumber.replace(/[^\w.-]+/g, '-');
  return safe.toLowerCase().endsWith('.pdf') ? safe : `${safe}.pdf`;
}
