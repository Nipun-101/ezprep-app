import apiClient from './client';

export interface MyEntitlement {
  id: string;
  scopeType: string;
  scopeId: string;
  status: string;
  startsAt: string;
  expiresAt: string | null;
  sourceType: string;
  productId?: string;
  orderId?: string;
}

export async function getMyEntitlements(): Promise<MyEntitlement[]> {
  const response = await apiClient.get<{ message: string; data: MyEntitlement[] }>(
    '/api/v1/me/entitlements'
  );
  return response.data.data ?? [];
}
