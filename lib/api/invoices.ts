import apiClient from './client';

export interface MyInvoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  status: string;
  issuedAt: string;
  grossAmount: number;
}

export async function getMyInvoices(): Promise<MyInvoice[]> {
  const response = await apiClient.get<{ message: string; data: MyInvoice[] }>(
    '/api/v1/me/invoices'
  );
  return response.data.data ?? [];
}

export async function downloadMyInvoice(invoiceId: string, filename: string): Promise<void> {
  const response = await apiClient.get<Blob>(`/api/v1/me/invoices/${invoiceId}/pdf`, {
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
