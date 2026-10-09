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

export function formatDurationPreset(preset: string): string {
  return DURATION_LABELS[preset] ?? preset;
}
