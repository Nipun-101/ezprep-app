import { BillingInput } from '@/lib/api/billing';

export interface BillingFormValues {
  name: string;
  stateCode: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  pincode: string;
}

export const emptyBillingForm = (): BillingFormValues => ({
  name: '',
  stateCode: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  pincode: '',
});

export function validateBillingForm(
  values: BillingFormValues
): Partial<Record<keyof BillingFormValues, string>> {
  const errors: Partial<Record<keyof BillingFormValues, string>> = {};
  if (!values.name.trim()) errors.name = 'Name is required';
  if (!values.stateCode) errors.stateCode = 'State is required';
  if (!values.addressLine1.trim()) errors.addressLine1 = 'Address is required';
  if (!values.city.trim()) errors.city = 'City is required';
  if (!/^\d{6}$/.test(values.pincode.trim())) {
    errors.pincode = 'Enter a 6-digit pincode';
  }
  return errors;
}

export function toBillingInput(values: BillingFormValues): BillingInput {
  const addressLine2 = values.addressLine2.trim();
  return {
    name: values.name.trim(),
    stateCode: values.stateCode,
    addressLine1: values.addressLine1.trim(),
    ...(addressLine2 ? { addressLine2 } : {}),
    city: values.city.trim(),
    pincode: values.pincode.trim(),
  };
}

export function billingFingerprint(values: BillingFormValues): string {
  return JSON.stringify(toBillingInput(values));
}
