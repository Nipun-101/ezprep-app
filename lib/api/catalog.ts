import apiClient from './client';

export interface CatalogOffer {
  id: string;
  productId: string;
  durationPreset: string;
  currency: string;
  listAmount: number;
  saleAmount?: number;
  effectiveAmount?: number;
  status: string;
}

export interface CatalogProduct {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: string;
  offers: CatalogOffer[];
  coveredForLife?: boolean;
  /** Omitted when the user has no payment row. Null is lifetime. */
  ownedUntil?: string | null;
}

interface CatalogProductsResponse {
  message: string;
  commerceEnabled?: boolean;
  data: CatalogProduct[];
}

export interface CatalogPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface CatalogListResponse extends CatalogProductsResponse {
  pagination: CatalogPagination;
}

/** Price the catalog says to charge, in paise. Prefers the server effective amount. */
export function offerPricePaise(offer: CatalogOffer): number | null {
  const amount = offer.effectiveAmount ?? offer.saleAmount ?? offer.listAmount;
  return Number.isFinite(amount) ? amount : null;
}

export interface OfferListDiscount {
  listPaise: number;
  percentOff: number;
}

/**
 * List vs current selling price. Null when there is no real discount
 * (missing list, sale not lower than list, or the sale window is inactive
 * so effectiveAmount already equals list).
 */
export function offerListDiscount(offer: CatalogOffer): OfferListDiscount | null {
  const selling = offerPricePaise(offer);
  const listPaise = offer.listAmount;
  if (selling == null || !Number.isFinite(listPaise) || listPaise <= 0 || listPaise <= selling) {
    return null;
  }
  return {
    listPaise,
    percentOff: Math.floor(((listPaise - selling) / listPaise) * 100),
  };
}

export function sellableOffers(product: CatalogProduct): CatalogOffer[] {
  return (product.offers ?? []).filter(
    (offer) => Boolean(offer.id) && offerPricePaise(offer) != null
  );
}

export async function listCatalogProducts(params: {
  page?: number;
  limit?: number;
}): Promise<{ data: CatalogProduct[]; pagination: CatalogPagination; commerceEnabled: boolean }> {
  const response = await apiClient.get<CatalogListResponse>('/api/v1/catalog/products', {
    params,
  });
  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination,
    commerceEnabled: response.data.commerceEnabled !== false,
  };
}

export interface CatalogOfferMatch {
  product: CatalogProduct | null;
  offer: CatalogOffer | null;
  commerceEnabled: boolean;
}

/** Finds one offer by paging the published catalog. Price display only. */
export async function findCatalogOffer(offerId: string): Promise<CatalogOfferMatch> {
  let page = 1;
  let commerceEnabled = true;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const result = await listCatalogProducts({ page, limit: 100 });
    commerceEnabled = result.commerceEnabled;
    if (!commerceEnabled) {
      return { product: null, offer: null, commerceEnabled: false };
    }
    for (const product of result.data) {
      const offer = (product.offers ?? []).find((item) => item.id === offerId);
      if (offer) return { product, offer, commerceEnabled };
    }
    if (!result.pagination?.hasNextPage) break;
    page += 1;
  }
  return { product: null, offer: null, commerceEnabled };
}

export interface CoveringProductsResult {
  products: CatalogProduct[];
  commerceEnabled: boolean;
}

export async function getProductsForExam(examId: string): Promise<CoveringProductsResult> {
  const response = await apiClient.get<CatalogProductsResponse>(
    `/api/v1/catalog/products/for-exam/${examId}`
  );
  return {
    products: response.data.data ?? [],
    commerceEnabled: response.data.commerceEnabled !== false,
  };
}

export async function getProductsForMockTest(mockTestId: string): Promise<CoveringProductsResult> {
  const response = await apiClient.get<CatalogProductsResponse>(
    `/api/v1/catalog/products/for-mock-test/${mockTestId}`
  );
  return {
    products: response.data.data ?? [],
    commerceEnabled: response.data.commerceEnabled !== false,
  };
}
