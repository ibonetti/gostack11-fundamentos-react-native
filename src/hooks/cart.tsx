import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  const storeProducts = useCallback(async () => {
    console.log('store');
    await AsyncStorage.setItem('@cart', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const prod = await AsyncStorage.getItem('@cart');
      if (prod) {
        setProducts(JSON.parse(prod));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productFound = products.find(prod => prod.id === product.id);
      if (productFound) {
        setProducts(
          products.map(prod =>
            prod.id === product.id
              ? { ...product, quantity: prod.quantity + 1 }
              : prod,
          ),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProducts = products.map(prod =>
        prod.id === id ? { ...prod, quantity: prod.quantity + 1 } : prod,
      );

      setProducts(newProducts);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      console.log(products);
      const newProducts = products.map(prod =>
        prod.id === id
          ? { ...prod, quantity: prod.quantity === 1 ? 1 : prod.quantity - 1 }
          : prod,
      );

      setProducts(newProducts);
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
