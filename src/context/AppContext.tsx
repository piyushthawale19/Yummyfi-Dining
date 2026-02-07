import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, Order } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockData';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

interface AppContextType {
  products: Product[];
  productsLoading: boolean;
  cart: CartItem[];
  orders: Order[];
  ordersLoading: boolean;
  tableNumber: string | null;
  customerName: string | null;
  toastVisible: boolean;
  toastMessage: string;
  toastProductName: string;
  setTableInfo: (num: string, name: string) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  placeOrder: () => Promise<string | null>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (id: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  hideToast: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [productsLoading, setProductsLoading] = useState(true);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [tableNumber, setTableNumber] = useState<string | null>(localStorage.getItem('tableNumber'));
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastProductName, setToastProductName] = useState('');

  // Subscribe to Firestore products
  useEffect(() => {
    const productsRef = collection(db, 'products');
    const unsubscribe = onSnapshot(
      productsRef,
      (snapshot) => {
        console.log('📦 Products snapshot received:', snapshot.size, 'products');

        if (snapshot.empty) {
          console.log('⚠️ No products in Firestore, showing empty list');
          setProducts([]);
          setProductsLoading(false);
          return;
        }

        const loadedProducts: Product[] = snapshot.docs.map((d) => {
          const data = d.data();
          console.log('Product:', d.id, data);
          return {
            ...(data as Omit<Product, 'id'>),
            id: d.id,
          };
        });

        console.log('✅ Loaded products:', loadedProducts);
        setProducts(loadedProducts);
        setProductsLoading(false);
      },
      (error) => {
        console.error('❌ Error loading products from Firestore:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        // Fallback to empty array on error
        setProducts([]);
        setProductsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Subscribe to Firestore orders (newest first)
  useEffect(() => {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedOrders: Order[] = snapshot.docs.map((d) => ({
        ...(d.data() as Omit<Order, 'id'>),
        id: d.id,
      }));
      setOrders(loadedOrders);
      setOrdersLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (tableNumber) localStorage.setItem('tableNumber', tableNumber);
    if (customerName) localStorage.setItem('customerName', customerName);
  }, [tableNumber, customerName]);

  const setTableInfo = (num: string, name: string) => {
    setTableNumber(num);
    setCustomerName(name);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    // Show toast notification
    setToastMessage('Added to cart!');
    setToastProductName(product.name);
    setToastVisible(true);
  };

  const hideToast = () => {
    setToastVisible(false);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const placeOrder = async () => {
    if (!tableNumber || cart.length === 0) return null;

    const newOrder: Omit<Order, 'id'> = {
      tableNumber,
      customerName: customerName || 'Guest',
      items: [...cart],
      totalAmount: cart.reduce((sum, item) => sum + (item.offerPrice || item.price) * item.quantity, 0),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'orders'), newOrder);
    setCart([]);

    localStorage.setItem('lastOrderId', docRef.id);

    return docRef.id;
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    await addDoc(collection(db, 'products'), {
      name: product.name,
      price: product.price,
      offerPrice: product.offerPrice,
      description: product.description,
      category: product.category,
      imageUrl: product.imageUrl,
      isVeg: product.isVeg,
    });
  };

  const deleteProduct = async (id: string) => {
    await deleteDoc(doc(db, 'products', id));
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const updates: Partial<Order> = { status };
    if (status === 'confirmed') {
      updates.confirmedAt = new Date().toISOString();
    }
    if (status === 'ready') {
      updates.readyAt = new Date().toISOString();
    }
    await updateDoc(doc(db, 'orders', orderId), updates as any);
  };

  return (
    <AppContext.Provider value={{
      products, productsLoading, cart, orders, ordersLoading, tableNumber, customerName,
      toastVisible, toastMessage, toastProductName,
      setTableInfo, addToCart, removeFromCart, updateQuantity, placeOrder,
      addProduct, deleteProduct, updateOrderStatus,
      hideToast
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
