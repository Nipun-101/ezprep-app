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
