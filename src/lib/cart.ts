// localStorage駆動の軽量カート。ワインセラー本体は「即購入」導線が基本だが、
// オプショナルパーツ追加後の複数点購入にも対応できるよう、汎用カートとして実装する。

export interface CartItem {
  slug: string;
  model: string;
  price: string; // 表示用（サーバー側では再計算するため信頼しない）
  qty: number;
}

const STORAGE_KEY = 'besson_cart_v1';

function readCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('besson:cart-updated', { detail: items }));
}

export function getCart(): CartItem[] {
  return readCart();
}

export function addToCart(item: Omit<CartItem, 'qty'>, qty = 1) {
  const items = readCart();
  const existing = items.find((i) => i.slug === item.slug);
  if (existing) {
    existing.qty += qty;
  } else {
    items.push({ ...item, qty });
  }
  writeCart(items);
  return items;
}

export function updateQty(slug: string, qty: number) {
  let items = readCart();
  if (qty <= 0) {
    items = items.filter((i) => i.slug !== slug);
  } else {
    const existing = items.find((i) => i.slug === slug);
    if (existing) existing.qty = qty;
  }
  writeCart(items);
  return items;
}

export function removeFromCart(slug: string) {
  const items = readCart().filter((i) => i.slug !== slug);
  writeCart(items);
  return items;
}

export function clearCart() {
  writeCart([]);
}

export function cartCount(items: CartItem[] = readCart()): number {
  return items.reduce((sum, i) => sum + i.qty, 0);
}
