import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartItem } from './types';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, loginWithGoogle, logoutUser } from './firebase';

export type CurrencyCode = 'NGN' | 'GHS' | 'ZAR' | 'KES' | 'USD';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  rate: number; // Multiplier from base (NGN)
}

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  NGN: { code: 'NGN', symbol: '₦', rate: 1 },
  GHS: { code: 'GHS', symbol: 'GH₵', rate: 0.0083 },
  ZAR: { code: 'ZAR', symbol: 'R', rate: 0.0125 },
  KES: { code: 'KES', symbol: 'KSh', rate: 0.088 },
  USD: { code: 'USD', symbol: '$', rate: 0.00065 },
};

export const formatPrice = (priceInNGN: number, currency: Currency) => {
  const converted = priceInNGN * currency.rate;
  return `${currency.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

interface StoreState {
  products: Product[];
  cart: CartItem[];
  currency: Currency;
  user: FirebaseUser | null;
  authInitialized: boolean;
  setProducts: (products: Product[]) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotal: () => number;
  setCurrency: (code: CurrencyCode) => void;
  setUser: (user: FirebaseUser | null) => void;
  setAuthInitialized: (initialized: boolean) => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      products: [],
      cart: [],
      currency: CURRENCIES.NGN,
      user: null,
      authInitialized: false,
      setProducts: (products) => set({ products }),
      addToCart: (product, quantity = 1) => {
        set((state) => {
          const existing = state.cart.find(item => item.id === product.id);
          if (existing) {
            return {
              cart: state.cart.map(item => 
                item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
              )
            };
          }
          return { cart: [...state.cart, { ...product, quantity }] };
        });
      },
      removeFromCart: (productId) => {
        set((state) => ({
          cart: state.cart.filter(item => item.id !== productId)
        }));
      },
      clearCart: () => set({ cart: [] }),
      cartTotal: () => {
        const { cart } = get();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      setCurrency: (code) => set({ currency: CURRENCIES[code] }),
      setUser: (user) => set({ user }),
      setAuthInitialized: (authInitialized) => set({ authInitialized }),
      login: async () => {
        await loginWithGoogle();
      },
      logout: async () => {
        await logoutUser();
      }
    }),
    {
      name: 'ecommerce-store',
      partialize: (state) => ({ cart: state.cart, currency: state.currency })
    }
  )
);

// Initialize Firebase Auth listener
onAuthStateChanged(auth, (user) => {
  useStore.getState().setUser(user);
  useStore.getState().setAuthInitialized(true);
});
