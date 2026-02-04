import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, CATEGORIES, Order } from '../../types';
import { fileToBase64, formatPrice, cn } from '../../utils/helpers';
import {
  Plus, Trash2, Image as ImageIcon, X,
  LayoutDashboard, ClipboardList, Package,
  ChevronRight, Clock, CheckCircle, ChevronDown,
  LogOut, ArrowLeft, Menu,
  TrendingUp, ShoppingBag, DollarSign, FileText,
  Eye, Edit2, Download, User, Phone, Printer, ChevronUp,
  ListFilter, RefreshCw, Database, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BillReceipt } from '../../components/BillReceipt';

// --- HELPER COMPONENT FOR TIMER ---
const OrderTimer = ({ confirmedAt }: { confirmedAt: string }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculateTime = () => {
      const confirmedTime = new Date(confirmedAt).getTime();
      const now = new Date().getTime();
      const elapsedSeconds = Math.floor((now - confirmedTime) / 1000);
      const remaining = Math.max(0, (20 * 60) - elapsedSeconds);
      setTimeLeft(remaining);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [confirmedAt]);

  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  const timeString = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  if (timeLeft <= 0) return <span className="text-green-600 font-bold">Ready</span>;

  return (
    <div className="flex items-center gap-1 text-brand-maroon font-mono font-bold bg-brand-cream px-2 py-0.5 rounded text-xs">
      <Flame size={10} className="text-brand-yellow" fill="currentColor" />
      {timeString}
    </div>
  );
};

// --- SUB-COMPONENTS ---

const SidebarItem = ({ icon: Icon, label, active, onClick, count, collapsed }: any) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center transition-all relative group mb-1",
        collapsed ? "justify-center py-3 px-2" : "gap-3 py-4 px-6 rounded-r-full mr-4",
        active
          ? "bg-brand-maroon text-white shadow-md"
          : "text-gray-600 hover:bg-brand-cream hover:text-brand-maroon"
      )}
      title={label}
    >
      <Icon size={20} className={active ? "text-white" : "text-gray-500 group-hover:text-brand-maroon"} />
      {!collapsed && (
        <>
          <span className={cn("font-medium", active ? "font-bold" : "")}>{label}</span>
          {count !== undefined && count > 0 && (
            <span className={cn(
              "ml-auto text-xs font-bold px-2 py-0.5 rounded-full",
              active ? "bg-white text-brand-maroon" : "bg-brand-maroon text-white"
            )}>
              {count}
            </span>
          )}
        </>
      )}
      {!collapsed && active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-yellow rounded-r-full" />}
      {collapsed && count !== undefined && count > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-maroon text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">
          {count}
        </span>
      )}
    </button>
  );
};

const StatCard = ({ icon: Icon, label, value, trend, trendValue }: any) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-full hover:shadow-md transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className="text-brand-maroon">
        <Icon size={28} strokeWidth={1.5} />
      </div>
      {trend && (
        <span className="text-xs font-bold text-green-600 flex items-center gap-1">
          <TrendingUp size={12} /> {trendValue}
        </span>
      )}
    </div>
    <div>
      <p className="text-brand-maroon/60 font-medium text-sm mb-2">{label}</p>
      <h3 className="text-3xl font-bold text-gray-900 font-serif">{value}</h3>
    </div>
  </div>
);

const FilterCard = ({ label, count, active, onClick, icon: Icon }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all w-full",
      active
        ? "border-brand-maroon bg-brand-cream/30 shadow-sm"
        : "border-gray-100 bg-white hover:border-brand-maroon/30"
    )}
  >
    <div className={cn("mb-3 p-2 rounded-full", active ? "bg-brand-maroon text-white" : "bg-gray-100 text-gray-500")}>
      <Icon size={20} />
    </div>
    <span className={cn("text-sm font-medium mb-1", active ? "text-brand-maroon" : "text-gray-500")}>{label}</span>
    <span className={cn("text-2xl font-bold font-serif", active ? "text-brand-maroon" : "text-brand-yellow")}>{count}</span>
  </button>
);

// Specific Card for Dashboard View
const DashboardOrderCard = ({ order, onUpdateStatus }: { order: Order, onUpdateStatus: any }) => {
  const statusConfig = {
    pending: { label: 'Pending Confirmation', bg: 'border-brand-yellow text-brand-yellow', badge: 'bg-brand-yellow/10 text-brand-mustard' },
    confirmed: { label: 'Confirmed', bg: 'border-brand-maroon text-brand-maroon', badge: 'bg-green-50 text-green-700' },
    ready: { label: 'Ready for Pickup', bg: 'border-green-600 text-green-600', badge: 'bg-green-100 text-green-800' },
    completed: { label: 'Completed', bg: 'border-gray-400 text-gray-400', badge: 'bg-gray-100 text-gray-600' },
  };
  const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;

  // Calculate time ago (mock)
  const timeAgo = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000);
  const timeDisplay = timeAgo < 1 ? 'Just now' : `${timeAgo} mins ago`;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-gray-900 font-serif">Order #{order.id}</h3>
          <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", config.badge, "border-transparent")}>
            {config.label}
          </span>
        </div>

        {/* Timer Display for Confirmed Orders */}
        {order.status === 'confirmed' && order.confirmedAt && (
          <OrderTimer confirmedAt={order.confirmedAt} />
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
        <div className="flex items-center gap-1.5">
          <User size={14} />
          <span>{order.customerName}</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-gray-300" />
        <div className="flex items-center gap-1.5">
          <Clock size={14} />
          <span>{timeDisplay}</span>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 flex items-center justify-center bg-brand-cream text-brand-maroon font-bold rounded text-xs">
                {item.quantity}
              </span>
              <span className="text-gray-700 font-medium">{item.name}</span>
            </div>
            <span className="font-bold text-gray-900">{formatPrice((item.offerPrice || item.price) * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 pt-4 flex justify-between items-center mb-6">
        <span className="font-bold text-gray-800">Total Amount</span>
        <span className="text-xl font-bold text-brand-maroon font-serif">{formatPrice(order.totalAmount)}</span>
      </div>

      <div className="flex gap-3">
        {order.status === 'pending' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'confirmed')}
            className="flex-1 bg-brand-maroon text-white py-3 rounded-full font-bold hover:bg-brand-burgundy transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <CheckCircle size={16} /> Confirm Order
          </button>
        )}
        {order.status === 'confirmed' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'ready')}
            className="flex-1 bg-green-600 text-white py-3 rounded-full font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <CheckCircle size={16} /> Mark Ready
          </button>
        )}
        {order.status === 'ready' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'completed')}
            className="flex-1 bg-gray-800 text-white py-3 rounded-full font-bold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <CheckCircle size={16} /> Complete
          </button>
        )}
        <button className="flex-1 bg-brand-cream text-brand-maroon py-3 rounded-full font-bold hover:bg-brand-goldGlow transition-colors flex items-center justify-center gap-2 text-sm">
          <Eye size={16} /> View Details
        </button>
      </div>
    </div>
  );
};

// Detailed Card for Orders View
const OrderManagementCard = ({ order, onUpdateStatus }: { order: Order, onUpdateStatus: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showBillReceipt, setShowBillReceipt] = useState(false);

  const statusConfig = {
    pending: { label: 'Pending', bg: 'bg-brand-yellow', text: 'text-brand-maroon', icon: Clock },
    confirmed: { label: 'In Kitchen', bg: 'bg-brand-maroon', text: 'text-white', icon: Flame },
    ready: { label: 'Ready', bg: 'bg-green-600', text: 'text-white', icon: CheckCircle },
    completed: { label: 'Completed', bg: 'bg-gray-500', text: 'text-white', icon: CheckCircle },
  };

  const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
      {/* Card Header */}
      <div className="p-5 pb-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-gray-900 font-serif">Order #{order.id}</h3>
            <span className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold", config.bg, config.text)}>
              <StatusIcon size={12} /> {config.label}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center bg-brand-yellow text-brand-maroon w-12 h-12 rounded-xl shadow-sm">
            <span className="text-[10px] font-bold uppercase leading-none">Table</span>
            <span className="text-xl font-bold leading-none">{order.tableNumber}</span>
          </div>
        </div>

        {/* Timer Row */}
        {order.status === 'confirmed' && order.confirmedAt && (
          <div className="mb-4 flex items-center gap-2 bg-brand-cream/50 p-2 rounded-lg border border-brand-maroon/10">
            <span className="text-xs font-bold text-brand-maroon uppercase tracking-wider">Time Remaining:</span>
            <OrderTimer confirmedAt={order.confirmedAt} />
          </div>
        )}

        {/* Customer Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User size={16} className="text-brand-maroon" />
            <span className="font-medium">{order.customerName || 'Guest Customer'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock size={16} className="text-brand-maroon" />
            <span className="font-medium">{new Date(order.createdAt).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
          </div>
        </div>

        <div className="border-t border-gray-100 my-3"></div>

        {/* Items Accordion Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex justify-between items-center py-2 group"
        >
          <span className="font-bold text-gray-700">{order.items.reduce((acc, i) => acc + i.quantity, 0)} Items</span>
          <span className="text-xs font-bold text-brand-maroon flex items-center gap-1 group-hover:underline">
            {isExpanded ? 'Hide Details' : 'View Details'}
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </button>

        {/* Expanded Items */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 py-3 bg-gray-50 rounded-xl px-3 mt-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 flex items-center justify-center bg-white border border-gray-200 text-brand-maroon font-bold rounded text-xs shadow-sm">
                        {item.quantity}
                      </span>
                      <span className="text-gray-700 font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold text-gray-900">{formatPrice((item.offerPrice || item.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="border-t border-gray-100 my-4"></div>

        {/* Total Amount */}
        <div className="flex justify-between items-center mb-6">
          <span className="font-bold text-gray-800">Total Amount:</span>
          <span className="text-2xl font-bold text-brand-yellow drop-shadow-sm font-serif">{formatPrice(order.totalAmount)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-4">
          {order.status === 'pending' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'confirmed')}
              className="flex-1 bg-brand-maroon text-white py-2.5 rounded-lg font-bold hover:bg-brand-burgundy transition-colors flex items-center justify-center gap-2 text-sm shadow-md"
            >
              <CheckCircle size={16} /> Confirm Order
            </button>
          )}

          {order.status === 'confirmed' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'ready')}
              className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm shadow-md"
            >
              <CheckCircle size={16} /> Mark Ready
            </button>
          )}

          {order.status === 'ready' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'completed')}
              className="flex-1 bg-gray-800 text-white py-2.5 rounded-lg font-bold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 text-sm shadow-md"
            >
              <CheckCircle size={16} /> Complete
            </button>
          )}

          <button
            onClick={() => setShowBillReceipt(true)}
            className="flex-1 bg-brand-cream text-brand-maroon py-2.5 rounded-lg font-bold hover:bg-brand-goldGlow transition-colors flex items-center justify-center gap-2 text-sm border border-brand-maroon/10"
          >
            <Printer size={16} /> Print Receipt
          </button>
        </div>
      </div>

      {/* Bill Receipt Modal */}
      <BillReceipt
        order={order}
        isOpen={showBillReceipt}
        onClose={() => setShowBillReceipt(false)}
      />
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---

export const AdminDashboard = () => {
  const { orders, products, addProduct, deleteProduct, updateOrderStatus, logoutAdmin } = useApp();
  const [activeView, setActiveView] = useState<'dashboard' | 'orders' | 'products'>('dashboard');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'confirmed' | 'ready' | 'completed'>('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Product Form State
  const [showProductForm, setShowProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '', price: 0, category: 'Main Course', description: '', isVeg: true,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const confirmedOrders = orders.filter(o => o.status === 'confirmed');
  const readyOrders = orders.filter(o => o.status === 'ready');
  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  // --- Handlers ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const base64 = await fileToBase64(file);
      setImagePreview(base64);
      setNewProduct(prev => ({ ...prev, imageUrl: base64 }));
    } catch (err) { console.error(err); alert("Failed to process image"); }
    finally { setIsUploading(false); }
  };

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.imageUrl) {
      alert("Please fill all required fields."); return;
    }
    const product: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: newProduct.name!,
      price: Number(newProduct.price),
      offerPrice: newProduct.offerPrice ? Number(newProduct.offerPrice) : undefined,
      description: newProduct.description || '',
      category: newProduct.category as string,
      imageUrl: newProduct.imageUrl!,
      isVeg: newProduct.isVeg || false,
    };
    addProduct(product);
    setShowProductForm(false);
    setNewProduct({ name: '', price: 0, category: 'Main Course', description: '', isVeg: true });
    setImagePreview(null);
  };

  return (
    <div className="flex min-h-screen bg-brand-offWhite font-sans">
      {/* SIDEBAR */}
      <aside className={cn(
        "bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-20 flex flex-col shadow-sm transition-all duration-300",
        sidebarCollapsed ? "w-20" : "w-64"
      )}>
        {/* Toggle Button - Floating Style */}
        <motion.button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "absolute top-6 -right-4 z-30 w-8 h-8 rounded-full bg-gradient-to-br from-brand-maroon to-brand-burgundy text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center border-4 border-brand-offWhite group",
            "hover:from-brand-burgundy hover:to-brand-maroon"
          )}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <motion.div
            animate={{ rotate: sidebarCollapsed ? 0 : 180 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center"
          >
            <ChevronRight size={16} strokeWidth={3} />
          </motion.div>
        </motion.button>

        <div className={cn("p-6 flex items-center gap-3 mb-4", sidebarCollapsed && "justify-center p-4")}>
          <img
            src="/542169443-ff628a00-4675-44b8-9fb4-6c3b6630590b.png"
            alt="Admin Logo"
            className="w-10 h-10 object-contain drop-shadow-sm rounded-full"
          />
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-xl font-bold text-brand-maroon font-serif leading-none">Yummy-Fi</h1>
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Admin Panel</span>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 py-2 space-y-1">
          <SidebarItem
            icon={LayoutDashboard}
            label="Dashboard"
            active={activeView === 'dashboard'}
            onClick={() => setActiveView('dashboard')}
            collapsed={sidebarCollapsed}
          />
          <SidebarItem
            icon={ClipboardList}
            label="Orders"
            active={activeView === 'orders'}
            onClick={() => setActiveView('orders')}
            count={pendingOrders.length}
            collapsed={sidebarCollapsed}
          />
          <SidebarItem
            icon={Package}
            label="Products"
            active={activeView === 'products'}
            onClick={() => setActiveView('products')}
            collapsed={sidebarCollapsed}
          />
        </nav>

        <div className="p-4 mt-auto border-t border-gray-100">
          <button onClick={logoutAdmin} className={cn(
            "w-full flex items-center gap-3 py-4 text-gray-600 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50",
            sidebarCollapsed ? "justify-center px-2" : "px-6"
          )}>
            <LogOut size={20} />
            {!sidebarCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className={cn(
        "flex-1 p-8 overflow-y-auto h-screen transition-all duration-300",
        sidebarCollapsed ? "ml-20" : "ml-64"
      )}>

        {/* --- DASHBOARD VIEW (UPDATED LAYOUT) --- */}
        {activeView === 'dashboard' && (
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-brand-maroon font-serif mb-2">Dashboard Overview</h2>
              <p className="text-gray-500 text-lg">Monitor your restaurant operations in real-time</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <StatCard icon={ShoppingBag} label="Active Orders" value={orders.filter(o => o.status !== 'completed').length} trend trendValue="+8%" />
              <StatCard icon={Clock} label="Pending Confirmations" value={pendingOrders.length} />
              <StatCard icon={CheckCircle} label="Completed Today" value={completedOrders.length} trend trendValue="+12%" />
              <StatCard icon={DollarSign} label="Revenue Today" value={formatPrice(totalRevenue)} trend trendValue="+15%" />
            </div>

            {/* Main Grid: Live Orders (Left) + Right Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Left Column: Live Orders */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-brand-maroon font-serif">Live Orders</h3>
                  <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                    Real-time Updates
                  </span>
                </div>

                <div className="space-y-6">
                  {orders.filter(o => o.status !== 'completed').length > 0 ? (
                    orders.filter(o => o.status !== 'completed').slice(0, 5).map(order => (
                      <DashboardOrderCard key={order.id} order={order} onUpdateStatus={updateOrderStatus} />
                    ))
                  ) : (
                    <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                        <CheckCircle size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-400">All caught up!</h3>
                      <p className="text-gray-400 text-sm">No active orders at the moment.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Quick Actions & Activity */}
              <div className="space-y-8">

                {/* Quick Actions Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold text-brand-maroon font-serif mb-6">Quick Actions</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setActiveView('orders')}
                      className="p-4 rounded-2xl bg-brand-offWhite hover:bg-brand-cream transition-colors text-left group"
                    >
                      <div className="mb-3 text-brand-maroon">
                        <ClipboardList size={24} />
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-brand-maroon">Manage Orders</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">View and process all orders</p>
                    </button>

                    <button
                      onClick={() => setActiveView('products')}
                      className="p-4 rounded-2xl bg-brand-offWhite hover:bg-brand-cream transition-colors text-left group"
                    >
                      <div className="mb-3 text-brand-maroon">
                        <Package size={24} />
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-brand-maroon">Product Management</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">Update menu items and pricing</p>
                    </button>
                  </div>

                  <button className="w-full mt-4 p-4 rounded-2xl bg-brand-offWhite hover:bg-brand-cream transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="text-green-600">
                        <Download size={20} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold text-gray-900 text-sm group-hover:text-green-700">Export Data</h4>
                        <p className="text-xs text-gray-500">Download Google Sheets</p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Recent Activity Card */}
                {/* <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"> */}
                {/* <div className="flex justify-between items-center mb-6"> */}
                {/* <h3 className="text-xl font-bold text-brand-maroon font-serif">Recent Activity</h3>
                    <button className="text-xs font-bold text-brand-maroon hover:underline">View All</button>
                  </div> */}

                {/* <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100"> */}
                {/* Mock Activity Items */}
                {/* <div className="relative pl-10">
                      <div className="absolute left-0 top-0 w-10 h-10 flex items-center justify-center bg-white">
                        <ShoppingBag size={16} className="text-brand-maroon" />
                      </div>
                      <p className="text-sm text-gray-800 font-medium leading-snug">
                        New order <span className="font-bold">#ORD-2401-1547</span> received from Priya Sharma
                      </p>
                      <span className="text-xs text-gray-400 mt-1 block flex items-center gap-1">
                        <Clock size={10} /> 2 minutes ago
                      </span>
                    </div>

                    <div className="relative pl-10">
                      <div className="absolute left-0 top-0 w-10 h-10 flex items-center justify-center bg-white">
                        <CheckCircle size={16} className="text-brand-maroon" />
                      </div>
                      <p className="text-sm text-gray-800 font-medium leading-snug">
                        Order <span className="font-bold">#ORD-2401-1546</span> marked as completed
                      </p>
                      <span className="text-xs text-gray-400 mt-1 block flex items-center gap-1">
                        <Clock size={10} /> 8 minutes ago
                      </span>
                    </div>

                    <div className="relative pl-10">
                      <div className="absolute left-0 top-0 w-10 h-10 flex items-center justify-center bg-white">
                        <Edit2 size={16} className="text-gray-500" />
                      </div>
                      <p className="text-sm text-gray-800 font-medium leading-snug">
                        Menu item "Paneer Butter Masala" updated with new price
                      </p>
                      <span className="text-xs text-gray-400 mt-1 block flex items-center gap-1">
                        <Clock size={10} /> 15 minutes ago
                      </span>
                    </div>

                    <div className="relative pl-10">
                      <div className="absolute left-0 top-0 w-10 h-10 flex items-center justify-center bg-white">
                        <Database size={16} className="text-green-600" />
                      </div>
                      <p className="text-sm text-gray-800 font-medium leading-snug">
                        Daily backup completed successfully
                      </p>
                      <span className="text-xs text-gray-400 mt-1 block flex items-center gap-1">
                        <Clock size={10} /> 1 hour ago
                      </span>
                    </div>
                  </div> */}
                {/* </div> */}

              </div>
            </div>
          </div>
        )}

        {/* --- ORDERS VIEW (MATCHING SCREENSHOT) --- */}
        {activeView === 'orders' && (
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-brand-maroon font-serif mb-2">Order Management</h2>
              <p className="text-gray-500 text-lg">Process incoming orders, assign tables, and track preparation status</p>
            </div>

            {/* Status Filters */}
            <div className="mb-4">
              <p className="text-sm font-bold text-gray-700 mb-3 font-serif">Filter by Status</p>
              <div className="grid grid-cols-5 gap-4">
                <FilterCard
                  label="All Orders"
                  count={orders.length}
                  active={orderFilter === 'all'}
                  onClick={() => setOrderFilter('all')}
                  icon={ListFilter}
                />
                <FilterCard
                  label="Pending"
                  count={pendingOrders.length}
                  active={orderFilter === 'pending'}
                  onClick={() => setOrderFilter('pending')}
                  icon={Clock}
                />
                <FilterCard
                  label="Confirmed"
                  count={confirmedOrders.length}
                  active={orderFilter === 'confirmed'}
                  onClick={() => setOrderFilter('confirmed')}
                  icon={CheckCircle}
                />
                <FilterCard
                  label="In Kitchen"
                  count={confirmedOrders.length}
                  active={orderFilter === 'confirmed'}
                  onClick={() => setOrderFilter('confirmed')}
                  icon={Flame}
                />
                <FilterCard
                  label="Ready"
                  count={readyOrders.length}
                  active={orderFilter === 'ready'}
                  onClick={() => setOrderFilter('ready')}
                  icon={CheckCircle}
                />
                <FilterCard
                  label="Completed"
                  count={completedOrders.length}
                  active={orderFilter === 'completed'}
                  onClick={() => setOrderFilter('completed')}
                  icon={CheckCircle}
                />
              </div>
            </div>

            {/* Time Range Filter */}
            <div className="mb-8">
              <p className="text-sm font-bold text-gray-700 mb-3 font-serif">Time Range</p>
              <div className="flex gap-2">
                <button className="px-6 py-2 rounded-full bg-brand-maroon text-white text-sm font-bold shadow-md">Today</button>
              </div>
            </div>

            {/* Orders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                  <OrderManagementCard key={order.id} order={order} onUpdateStatus={updateOrderStatus} />
                ))
              ) : (
                <div className="col-span-2 text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <ClipboardList size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-600 mb-1">No orders found</h3>
                  <p className="text-gray-400">There are no orders with this status.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- PRODUCTS VIEW --- */}
        {activeView === 'products' && (
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-brand-maroon font-serif">Product Management</h2>
              <button
                onClick={() => setShowProductForm(true)}
                className="bg-brand-maroon text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-burgundy shadow-lg shadow-brand-maroon/20"
              >
                <Plus size={20} /> Add New Product
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {products.map(product => (
                <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-all">
                  <img src={product.imageUrl} className="w-20 h-20 rounded-lg object-cover bg-gray-100" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-xl text-gray-900 font-serif">{product.name}</h4>
                      <span className="font-bold text-brand-maroon text-lg">{formatPrice(product.price)}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{product.category}</p>
                    <div className="flex gap-2 mt-2">
                      {product.isVeg ? (
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">Veg</span>
                      ) : (
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">Non-Veg</span>
                      )}
                      {product.offerPrice && (
                        <span className="text-xs font-bold text-brand-maroon bg-brand-cream px-2 py-1 rounded border border-brand-maroon/20">Offer Active</span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => deleteProduct(product.id)} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* PRODUCT FORM MODAL (Unchanged) */}
      {showProductForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-brand-maroon font-serif">Add New Product</h3>
              <button onClick={() => setShowProductForm(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="p-6 space-y-5">
              {/* Image Upload UI */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Product Image</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-xl hover:bg-gray-50 transition-colors relative group">
                  <div className="space-y-1 text-center">
                    {imagePreview ? (
                      <div className="relative">
                        <img src={imagePreview} alt="Preview" className="mx-auto h-48 object-contain rounded-lg shadow-sm" />
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); setImagePreview(null); setNewProduct(p => ({ ...p, imageUrl: '' })) }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center rounded-full bg-gray-100 mb-3">
                          {isUploading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div> : <ImageIcon size={24} />}
                        </div>
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-bold text-brand-maroon hover:text-brand-burgundy">
                            <span>Click to upload</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Other Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text" required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-maroon/20 focus:border-brand-maroon outline-none transition-all"
                    value={newProduct.name}
                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number" required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-maroon/20 focus:border-brand-maroon outline-none transition-all"
                    value={newProduct.price || ''}
                    onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Offer Price</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-maroon/20 focus:border-brand-maroon outline-none transition-all"
                    value={newProduct.offerPrice || ''}
                    onChange={e => setNewProduct({ ...newProduct, offerPrice: Number(e.target.value) })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                  <select
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-maroon/20 focus:border-brand-maroon outline-none bg-white"
                    value={newProduct.category}
                    onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-span-2 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-brand-maroon rounded focus:ring-brand-maroon border-gray-300"
                      checked={newProduct.isVeg}
                      onChange={e => setNewProduct({ ...newProduct, isVeg: e.target.checked })}
                    />
                    <span className="text-sm font-medium text-gray-700">Is this item Vegetarian?</span>
                  </label>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-brand-maroon text-white font-bold py-3.5 rounded-xl hover:bg-brand-burgundy transition-all shadow-lg shadow-brand-maroon/20 active:scale-[0.98]"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper for Chevron Left
const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
);
