import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, Order } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockData';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from './ToastContext';

interface AppContextType {
  products: Product[];
  productsLoading: boolean;
  cart: CartItem[];
  orders: Order[];
  ordersLoading: boolean;
  tableNumber: string | null;
  customerName: string | null;
  setTableInfo: (num: string, name: string) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  placeOrder: (orderTableNumber?: string, orderCustomerName?: string, orderCustomerEmail?: string) => Promise<string | null>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  cancelOrder: (orderId: string, cancelledBy: 'user' | 'admin') => Promise<void>;
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

  const { showSuccess } = useToast();

  const isDev = import.meta.env.DEV;

  // Subscribe to Firestore products
  useEffect(() => {
    const productsRef = collection(db, 'products');
    const unsubscribe = onSnapshot(
      productsRef,
      (snapshot) => {
        if (isDev) console.log('📦 Products snapshot received:', snapshot.size, 'products');

        if (snapshot.empty) {
          if (isDev) console.log('⚠️ No products in Firestore, showing empty list');
          setProducts([]);
          setProductsLoading(false);
          return;
        }

        const loadedProducts: Product[] = snapshot.docs.map((d) => {
          const data = d.data();
          if (isDev) console.log('Product:', d.id, data);
          return {
            ...(data as Omit<Product, 'id'>),
            id: d.id,
          };
        });

        if (isDev) console.log('✅ Loaded products:', loadedProducts);
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
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loadedOrders: Order[] = snapshot.docs.map((d) => ({
          ...(d.data() as Omit<Order, 'id'>),
          id: d.id,
        }));
        setOrders(loadedOrders);
        setOrdersLoading(false);
      },
      (error) => {
        console.error('❌ Error loading orders from Firestore:', error);
        // Fallback to empty orders list and clear loading flag so UI doesn't hang
        setOrders([]);
        setOrdersLoading(false);
      }
    );

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

    // Show success toast notification with brand styling
    showSuccess(`${product.name} added to cart!`, '🛒 Added to Cart');
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

  const placeOrder = async (orderTableNumber?: string, orderCustomerName?: string, orderCustomerEmail?: string) => {
    // Use arguments if provided, otherwise fall back to state
    const finalTableNumber = orderTableNumber || tableNumber;
    const finalCustomerName = orderCustomerName || customerName;

    if (!finalTableNumber || cart.length === 0) return null;

    const newOrder: Omit<Order, 'id'> = {
      tableNumber: finalTableNumber,
      customerName: finalCustomerName || 'Guest',
      customerEmail: orderCustomerEmail || undefined,
      items: [...cart],
      totalAmount: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
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

  const deleteOrder = async (orderId: string) => {
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      console.log(`🗑️ Order ${orderId} deleted successfully`);
    } catch (error) {
      console.error(`❌ Error deleting order ${orderId}:`, error);
      throw error;
    }
  };

  const cancelOrder = async (orderId: string, cancelledBy: 'user' | 'admin') => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        cancelledBy: cancelledBy
      });
      console.log(`❌ Order ${orderId} cancelled by ${cancelledBy}`);
    } catch (error) {
      console.error(`❌ Error cancelling order ${orderId}:`, error);
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{
      products, productsLoading, cart, orders, ordersLoading, tableNumber, customerName,
      setTableInfo, addToCart, removeFromCart, updateQuantity, placeOrder,
      addProduct, deleteProduct, updateOrderStatus, deleteOrder, cancelOrder
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
