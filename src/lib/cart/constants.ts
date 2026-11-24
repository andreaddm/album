export const CART_STORAGE_KEY = "album-cart";
export const CART_CHANGE_EVENT = "album-cart-change";
export const MAX_CART_QUANTITY = 20;

export type StoredCartItem = {
  productId: string;
  quantity: number;
};
