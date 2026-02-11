// Shared types for Yummyfi web and mobile apps
// Copied from src/types/index.ts and enhanced for mobile compatibility

export interface Product {
  id: string;
  name: string;
  price: number;
  offerPrice?: number;
  description: string;
  category: string;
  imageUrl: string; // Base64 or URL
  imageFocus?: number; // Vertical object-position (0-100)
  isVeg: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  tableNumber: string;
  customerName?: string;
  customerEmail?: string; // Added for better user verification
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
  createdAt: string;
  confirmedAt?: string; // New field to track when timer starts
  readyAt?: string; // Field to track when order is marked ready
  cancelledAt?: string; // Field to track when order was cancelled
  cancelledBy?: 'user' | 'admin'; // Track who cancelled the order
  // Additional field for mobile order tracking
  userId?: string; // Firebase user ID for mobile filtering
}

export type Category = 'All' | 'Main Course' | 'Rice & Biryani' | 'Starters' | 'Breads' | 'Desserts';

export const CATEGORIES: Category[] = ['All', 'Main Course', 'Rice & Biryani', 'Starters', 'Breads', 'Desserts'];

// Additional types for mobile-specific features
export type OrderStatus = Order['status'];

export interface OrderFilters {
  userId?: string;
  status?: OrderStatus;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Auth types for cross-platform compatibility
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}