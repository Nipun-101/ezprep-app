import apiClient from './client';

export interface MyOrderItem {
  productName: string;
  durationPreset: string;
  amount: number;
}

export interface MyOrder {
  id: string;
  orderNumber: string;
  status: string;
  amount: number;
  currency: string;
  createdAt?: string;
  paidAt?: string;
  expiresAt?: string;
  items: MyOrderItem[];
}

export interface MyOrdersPage {
  data: MyOrder[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export async function getMyOrders(params?: {
  page?: number;
  limit?: number;
}): Promise<MyOrdersPage> {
  const response = await apiClient.get<{
    message: string;
    data: MyOrder[];
    pagination: MyOrdersPage['pagination'];
  }>('/api/v1/me/orders', { params });
  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination,
  };
}

export async function getMyOrder(orderId: string): Promise<MyOrder> {
  const response = await apiClient.get<{ message: string; data: MyOrder }>(
    `/api/v1/me/orders/${orderId}`
  );
  return response.data.data;
}
