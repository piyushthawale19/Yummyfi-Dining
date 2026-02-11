export interface Product {
    id: string;
    name: string;
    price: number;
    offerPrice?: number;
    description: string;
    category: string;
    imageUrl: string;
    imageFocus?: number;
    isVeg: boolean;
}
export interface CartItem extends Product {
    quantity: number;
}
export interface Order {
    id: string;
    tableNumber: string;
    customerName?: string;
    customerEmail?: string;
    items: CartItem[];
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
    createdAt: string;
    confirmedAt?: string;
    readyAt?: string;
    cancelledAt?: string;
    cancelledBy?: 'user' | 'admin';
    userId?: string;
}
export type Category = 'All' | 'Main Course' | 'Rice & Biryani' | 'Starters' | 'Breads' | 'Desserts';
export declare const CATEGORIES: Category[];
export type OrderStatus = Order['status'];
export interface OrderFilters {
    userId?: string;
    status?: OrderStatus;
    dateRange?: {
        start: Date;
        end: Date;
    };
}
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
//# sourceMappingURL=index.d.ts.map