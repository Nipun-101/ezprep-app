/** API amounts are integer paise. The app shows rupees. */

export function formatPaiseAsRupees(paise: number): string {
  const rupees = paise / 100;
  return `₹${rupees.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

const DURATION_LABELS: Record<string, string> = {
  '1M': '1 month',
  '3M': '3 months',
  '6M': '6 months',
  '12M': '12 months',
  LIFETIME: 'Lifetime',
};

export interface OrderTaxView {
  grossAmount: number;
  taxableAmount: number;
  taxAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  taxRate: number;
  supplyType?: 'INTRA_STATE' | 'INTER_STATE';
  sellerStateCode?: string;
  buyerStateCode?: string;
}

/** "incl. CGST 9% ₹76.19 + SGST 9% ₹76.19" or the IGST line. Percents come from taxRate. */
export function gstBreakdownLine(tax: OrderTaxView): string {
  const inter =
    tax.supplyType === 'INTER_STATE' || (tax.supplyType == null && tax.igst > 0);
  if (inter) {
    return `incl. IGST ${tax.taxRate}% ${formatPaiseAsRupees(tax.igst)}`;
  }
  const half = tax.taxRate / 2;
  return `incl. CGST ${half}% ${formatPaiseAsRupees(tax.cgst)} + SGST ${half}% ${formatPaiseAsRupees(tax.sgst)}`;
}

export function formatDurationPreset(preset: string): string {
  return DURATION_LABELS[preset] ?? preset;
}
