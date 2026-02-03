export function formatPrice(priceInCents: bigint): string {
  const dollars = Number(priceInCents) / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(dollars);
}

export function getItemImageUrl(): string {
  return '/assets/generated/menu-item-placeholder.dim_1024x768.png';
}
