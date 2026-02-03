import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { Item } from '../backend';

export interface CartItem {
  item: Item;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { item: Item; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { itemId: bigint } }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: bigint; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

interface CartContextType {
  state: CartState;
  addItem: (item: Item, quantity: number) => void;
  removeItem: (itemId: bigint) => void;
  updateQuantity: (itemId: bigint, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'munchies-cart';

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        (cartItem) => cartItem.item.id === action.payload.item.id
      );

      if (existingIndex >= 0) {
        const newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + action.payload.quantity,
        };
        return { items: newItems };
      }

      return {
        items: [...state.items, { item: action.payload.item, quantity: action.payload.quantity }],
      };
    }

    case 'REMOVE_ITEM':
      return {
        items: state.items.filter((cartItem) => cartItem.item.id !== action.payload.itemId),
      };

    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map((cartItem) =>
        cartItem.item.id === action.payload.itemId
          ? { ...cartItem, quantity: action.payload.quantity }
          : cartItem
      );
      return { items: newItems.filter((item) => item.quantity > 0) };
    }

    case 'CLEAR_CART':
      return { items: [] };

    case 'LOAD_CART':
      return { items: action.payload };

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        dispatch({ type: 'LOAD_CART', payload: parsed });
      }
    } catch (error) {
      console.error('Failed to load cart from storage:', error);
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    } catch (error) {
      console.error('Failed to save cart to storage:', error);
    }
  }, [state.items]);

  const addItem = (item: Item, quantity: number) => {
    dispatch({ type: 'ADD_ITEM', payload: { item, quantity } });
  };

  const removeItem = (itemId: bigint) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { itemId } });
  };

  const updateQuantity = (itemId: bigint, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getTotal = () => {
    return state.items.reduce((total, cartItem) => {
      return total + Number(cartItem.item.price) * cartItem.quantity;
    }, 0);
  };

  const getItemCount = () => {
    return state.items.reduce((count, cartItem) => count + cartItem.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{ state, addItem, removeItem, updateQuantity, clearCart, getTotal, getItemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
