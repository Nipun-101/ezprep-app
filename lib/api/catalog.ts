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
}

interface CatalogProductsResponse {
  message: string;
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

export function sellableOffers(product: CatalogProduct): CatalogOffer[] {
  return (product.offers ?? []).filter(
    (offer) => Boolean(offer.id) && offerPricePaise(offer) != null
  );
}

export async function listCatalogProducts(params: {
  page?: number;
  limit?: number;
}): Promise<{ data: CatalogProduct[]; pagination: CatalogPagination }> {
  const response = await apiClient.get<CatalogListResponse>('/api/v1/catalog/products', {
    params,
  });
  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination,
  };
}

/** Finds one offer by paging the published catalog. Price display only. */
export async function findCatalogOffer(offerId: string): Promise<{
  product: CatalogProduct;
  offer: CatalogOffer;
} | null> {
  let page = 1;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const result = await listCatalogProducts({ page, limit: 100 });
    for (const product of result.data) {
      const offer = (product.offers ?? []).find((item) => item.id === offerId);
      if (offer) return { product, offer };
    }
    if (!result.pagination?.hasNextPage) return null;
    page += 1;
  }
  return null;
}

export async function getProductsForExam(examId: string): Promise<CatalogProduct[]> {
  const response = await apiClient.get<CatalogProductsResponse>(
    `/api/v1/catalog/products/for-exam/${examId}`
  );
  return response.data.data ?? [];
}

export async function getProductsForMockTest(mockTestId: string): Promise<CatalogProduct[]> {
  const response = await apiClient.get<CatalogProductsResponse>(
    `/api/v1/catalog/products/for-mock-test/${mockTestId}`
  );
  return response.data.data ?? [];
}
