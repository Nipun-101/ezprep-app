import { IndianStateOption } from '@/lib/api/billing';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BillingFormValues } from './billing-values';

interface BillingFormProps {
  values: BillingFormValues;
  states: IndianStateOption[];
  errors: Partial<Record<keyof BillingFormValues, string>>;
  disabled: boolean;
  onChange: (values: BillingFormValues) => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-red-600">{message}</p>;
}

export default function BillingForm({
  values,
  states,
  errors,
  disabled,
  onChange,
}: BillingFormProps) {
  const set = (patch: Partial<BillingFormValues>) => onChange({ ...values, ...patch });

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="billing-name">Billing name</Label>
        <Input
          id="billing-name"
          autoComplete="name"
          value={values.name}
          disabled={disabled}
          onChange={(event) => set({ name: event.target.value })}
        />
        <FieldError message={errors.name} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="billing-state">State</Label>
        <Select
          value={values.stateCode || undefined}
          disabled={disabled}
          onValueChange={(stateCode) => set({ stateCode })}
        >
          <SelectTrigger id="billing-state" className="w-full">
            <SelectValue placeholder="Select a state" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {states.map((state) => (
              <SelectItem key={state.code} value={state.code}>
                {state.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError message={errors.stateCode} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="billing-line1">Address line 1</Label>
        <Input
          id="billing-line1"
          autoComplete="address-line1"
          value={values.addressLine1}
          disabled={disabled}
          onChange={(event) => set({ addressLine1: event.target.value })}
        />
        <FieldError message={errors.addressLine1} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="billing-line2">Address line 2</Label>
        <Input
          id="billing-line2"
          autoComplete="address-line2"
          value={values.addressLine2}
          disabled={disabled}
          onChange={(event) => set({ addressLine2: event.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="billing-city">City</Label>
          <Input
            id="billing-city"
            autoComplete="address-level2"
            value={values.city}
            disabled={disabled}
            onChange={(event) => set({ city: event.target.value })}
          />
          <FieldError message={errors.city} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="billing-pincode">Pincode</Label>
          <Input
            id="billing-pincode"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            value={values.pincode}
            disabled={disabled}
            onChange={(event) => set({ pincode: event.target.value.replace(/\D/g, '').slice(0, 6) })}
          />
          <FieldError message={errors.pincode} />
        </div>
      </div>
    </div>
  );
}
