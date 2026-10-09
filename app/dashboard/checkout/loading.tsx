export default function CheckoutLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      <p className="text-sm font-medium text-gray-700">Opening checkout</p>
    </div>
  );
}
