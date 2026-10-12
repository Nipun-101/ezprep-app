import apiClient from './client';

export interface IndianStateOption {
  code: string;
  name: string;
}

export interface BillingProfile {
  name: string;
  state: string;
  stateCode: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  pincode: string;
}

export interface BillingInput {
  name: string;
  stateCode: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  pincode: string;
}

export async function getIndianStates(): Promise<IndianStateOption[]> {
  const response = await apiClient.get<{
    message: string;
    data: IndianStateOption[];
  }>('/api/v1/meta/indian-states');
  return response.data.data ?? [];
}

export async function getBillingProfile(): Promise<BillingProfile | null> {
  const response = await apiClient.get<{
    message: string;
    data: BillingProfile | null;
  }>('/api/v1/me/billing-profile');
  return response.data.data ?? null;
}

export async function updateBillingProfile(billing: BillingInput): Promise<BillingProfile> {
  const response = await apiClient.patch<{
    message: string;
    data: BillingProfile;
  }>('/api/v1/me/billing-profile', billing);
  return response.data.data;
}
