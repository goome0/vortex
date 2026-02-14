/**
 * Product with quantity. The comp_hack API expects a flat number[] (one ID per item).
 * We support { productId, quantity } for efficient storage and UX.
 */
export type ProductWithQuantity = { productId: number; quantity: number };

/** Normalize products from API/DB (legacy number[] or new format) to ProductWithQuantity[] */
export function normalizeProducts(value: unknown): ProductWithQuantity[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((el) => {
    if (typeof el === 'number' && el > 0) return [{ productId: el, quantity: 1 }];
    if (el && typeof el === 'object' && 'productId' in el) {
      const pid = Number((el as { productId: unknown }).productId);
      const qty = 'quantity' in el ? Math.max(1, Math.floor(Number((el as { quantity: unknown }).quantity))) : 1;
      if (pid > 0) return [{ productId: pid, quantity: qty }];
    }
    return [];
  });
}

/** Expand to flat number[] for comp_hack post_items API */
export function expandProductsForApi(products: ProductWithQuantity[]): number[] {
  return products.flatMap((p) => Array(p.quantity).fill(p.productId));
}
