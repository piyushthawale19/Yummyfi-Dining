import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Download, FileSpreadsheet, Settings, Check,
    Clock, TrendingUp, ShoppingBag, DollarSign,
    AlertCircle, ExternalLink, Copy, ChevronDown,
    ChevronUp, RefreshCw, Database, Calendar, Zap
} from 'lucide-react';
import { Order } from '../types';
import {
    getCycleSummary,
    downloadOrdersAsCSV,
    exportToGoogleSheets,
    saveGoogleSheetsConfig,
    getGoogleSheetsConfig,
    isGoogleSheetsConfigured,
    getDailyCycleDates,
    getOrdersForCurrentCycle
} from '../utils/googleSheets';
import { formatPrice, cn } from '../utils/helpers';

interface ExportDataModalProps {
    isOpen: boolean;
    onClose: () => void;
    orders: Order[];
}

const GOOGLE_APPS_SCRIPT_CODE = `// Google Apps Script Code - Deploy as Web App

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (data.action === 'writeOrders') {
      let sheet = ss.getSheetByName(data.sheetName);
      
      // Create sheet if doesn't exist
      if (!sheet) {
        sheet = ss.insertSheet(data.sheetName);
      }
      
      // Clear previous data if requested
      if (data.clearPrevious) {
        sheet.clear();
      }
      
      // Write data
      if (data.data && data.data.length > 0) {
        sheet.getRange(1, 1, data.data.length, data.data[0].length)
          .setValues(data.data);
        
        // Format header row
        sheet.getRange(1, 1, 1, data.data[0].length)
          .setBackground('#7f1d1d')
          .setFontColor('white')
          .setFontWeight('bold');
        
        // Auto-resize columns
        sheet.autoResizeColumns(1, data.data[0].length);
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Data written successfully'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === 'clearSheet') {
      let sheet = ss.getSheetByName(data.sheetName);
      if (sheet) {
        sheet.clear();
      }
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Sheet cleared'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Unknown action'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'OK',
    message: 'YummyFi Google Sheets Integration Ready'
  })).setMimeType(ContentService.MimeType.JSON);
}`;

export const ExportDataModal: React.FC<ExportDataModalProps> = ({ isOpen, onClose, orders }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'settings'>('overview');
    const [isExporting, setIsExporting] = useState(false);
    const [exportStatus, setExportStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
    const [webAppUrl, setWebAppUrl] = useState('');
    const [sheetUrl, setSheetUrl] = useState('');
    const [copied, setCopied] = useState(false);
    const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (isOpen) {
            const config = getGoogleSheetsConfig();
            setWebAppUrl(config.webAppUrl);
            setSheetUrl(config.sheetUrl);
        }
    }, [isOpen]);

    const summary = getCycleSummary(orders);
    const cycleOrders = getOrdersForCurrentCycle(orders);
    const { start: cycleStart, end: cycleEnd } = getDailyCycleDates();

    const formatCycleTime = (date: Date) => {
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const handleDownloadCSV = () => {
        downloadOrdersAsCSV(orders);
        setExportStatus({ type: 'success', message: 'CSV file downloaded successfully!' });
        setTimeout(() => setExportStatus({ type: null, message: '' }), 3000);
    };

    const handleExportToSheets = async () => {
        if (!isGoogleSheetsConfigured()) {
            setActiveTab('settings');
            return;
        }

        setIsExporting(true);
        setExportStatus({ type: null, message: '' });

        try {
            const result = await exportToGoogleSheets(orders);
            setExportStatus({
                type: result.success ? 'success' : 'error',
                message: result.message
            });
        } catch (error) {
            setExportStatus({
                type: 'error',
                message: 'Failed to export. Please check your configuration.'
            });
        }

        setIsExporting(false);
        setTimeout(() => setExportStatus({ type: null, message: '' }), 5000);
    };

    const handleSaveConfig = () => {
        saveGoogleSheetsConfig(webAppUrl, sheetUrl);
        setActiveTab('overview');
        setExportStatus({ type: 'success', message: 'Configuration saved successfully!' });
        setTimeout(() => setExportStatus({ type: null, message: '' }), 3000);
    };

    const copyScript = () => {
        navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const toggleOrderExpand = (orderId: string) => {
        setExpandedOrders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(orderId)) {
                newSet.delete(orderId);
            } else {
                newSet.add(orderId);
            }
            return newSet;
        });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-brand-maroon to-brand-burgundy p-6 text-white">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold font-serif mb-1">Export Data</h2>
                                <p className="text-white/80 text-sm">
                                    Daily cycle: {formatCycleTime(cycleStart)} - {formatCycleTime(cycleEnd)}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 mt-6">
                            {[
                                { id: 'overview', label: 'Overview', icon: TrendingUp },
                                { id: 'orders', label: 'Orders', icon: ShoppingBag },
                                { id: 'settings', label: 'Settings', icon: Settings }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as 'overview' | 'orders' | 'settings')}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all",
                                        activeTab === tab.id
                                            ? "bg-white text-brand-maroon"
                                            : "bg-white/20 text-white hover:bg-white/30"
                                    )}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                        {/* Status Message */}
                        <AnimatePresence>
                            {exportStatus.type && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className={cn(
                                        "mb-4 p-4 rounded-xl flex items-center gap-3",
                                        exportStatus.type === 'success'
                                            ? "bg-green-50 text-green-700 border border-green-200"
                                            : "bg-red-50 text-red-700 border border-red-200"
                                    )}
                                >
                                    {exportStatus.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                                    <span className="font-medium">{exportStatus.message}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-gradient-to-br from-brand-cream to-brand-offWhite p-5 rounded-2xl border border-brand-maroon/10">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-brand-maroon text-white rounded-lg">
                                                <ShoppingBag size={18} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-600">Total Orders</span>
                                        </div>
                                        <p className="text-3xl font-bold text-brand-maroon font-serif">{summary.totalOrders}</p>
                                    </div>

                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border border-green-200">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-green-600 text-white rounded-lg">
                                                <Check size={18} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-600">Completed</span>
                                        </div>
                                        <p className="text-3xl font-bold text-green-700 font-serif">{summary.completedOrders}</p>
                                    </div>

                                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-5 rounded-2xl border border-amber-200">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-amber-500 text-white rounded-lg">
                                                <Clock size={18} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-600">Active</span>
                                        </div>
                                        <p className="text-3xl font-bold text-amber-700 font-serif">
                                            {summary.pendingOrders + summary.confirmedOrders + summary.readyOrders}
                                        </p>
                                    </div>

                                    <div className="bg-gradient-to-br from-brand-cream to-brand-goldGlow p-5 rounded-2xl border border-brand-yellow">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-brand-yellow text-brand-maroon rounded-lg">
                                                <DollarSign size={18} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-600">Revenue</span>
                                        </div>
                                        <p className="text-2xl font-bold text-brand-maroon font-serif">{formatPrice(summary.totalRevenue)}</p>
                                    </div>
                                </div>

                                {/* Cycle Info */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Calendar size={20} className="text-blue-600" />
                                        <h3 className="font-bold text-blue-900">Daily Cycle Information</h3>
                                    </div>
                                    <p className="text-sm text-blue-700 mb-2">
                                        Data on Google Sheets is automatically organized by daily cycles. Each cycle runs from <strong>4:00 AM</strong> to <strong>4:00 AM</strong> the next day.
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-100 px-3 py-2 rounded-lg inline-flex">
                                        <Zap size={14} />
                                        After 4:01 AM, previous cycle data is archived and new cycle begins
                                    </div>
                                </div>

                                {/* Export Actions */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={handleDownloadCSV}
                                        className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/25 group"
                                    >
                                        <Download size={24} className="group-hover:animate-bounce" />
                                        <div className="text-left">
                                            <span className="block text-lg">Download CSV</span>
                                            <span className="text-sm text-white/80">Save to your computer</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={handleExportToSheets}
                                        disabled={isExporting}
                                        className={cn(
                                            "flex items-center justify-center gap-3 p-5 rounded-2xl text-white font-bold transition-all shadow-lg group",
                                            isExporting
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : "bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-blue-500/25"
                                        )}
                                    >
                                        {isExporting ? (
                                            <RefreshCw size={24} className="animate-spin" />
                                        ) : (
                                            <FileSpreadsheet size={24} className="group-hover:scale-110 transition-transform" />
                                        )}
                                        <div className="text-left">
                                            <span className="block text-lg">
                                                {isExporting ? 'Exporting...' : 'Export to Google Sheets'}
                                            </span>
                                            <span className="text-sm text-white/80">
                                                {isGoogleSheetsConfigured() ? 'Sync with your sheet' : 'Setup required'}
                                            </span>
                                        </div>
                                    </button>
                                </div>

                                {sheetUrl && (
                                    <a
                                        href={sheetUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 p-4 rounded-xl bg-brand-cream text-brand-maroon font-bold hover:bg-brand-goldGlow transition-colors"
                                    >
                                        <ExternalLink size={18} />
                                        Open Google Sheets
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Orders Tab */}
                        {activeTab === 'orders' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-800">
                                        Orders in Current Cycle ({cycleOrders.length})
                                    </h3>
                                    <span className="text-sm text-gray-500">
                                        {formatCycleTime(cycleStart)} - {formatCycleTime(cycleEnd)}
                                    </span>
                                </div>

                                {cycleOrders.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-2xl">
                                        <Database size={48} className="mx-auto text-gray-300 mb-4" />
                                        <h3 className="text-lg font-bold text-gray-500">No orders in current cycle</h3>
                                        <p className="text-gray-400 text-sm">Orders will appear here when customers place them</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {cycleOrders.map(order => (
                                            <div key={order.id} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                                                <button
                                                    onClick={() => toggleOrderExpand(order.id)}
                                                    className="w-full p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-left">
                                                            <span className="font-bold text-gray-900">#{order.id}</span>
                                                            <span className="text-gray-500 text-sm ml-2">Table {order.tableNumber}</span>
                                                        </div>
                                                        <span className={cn(
                                                            "px-2 py-1 rounded-full text-xs font-bold",
                                                            order.status === 'completed' && "bg-green-100 text-green-700",
                                                            order.status === 'ready' && "bg-blue-100 text-blue-700",
                                                            order.status === 'confirmed' && "bg-amber-100 text-amber-700",
                                                            order.status === 'pending' && "bg-gray-200 text-gray-600"
                                                        )}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="font-bold text-brand-maroon">{formatPrice(order.totalAmount)}</span>
                                                        {expandedOrders.has(order.id) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                    </div>
                                                </button>

                                                <AnimatePresence>
                                                    {expandedOrders.has(order.id) && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="border-t border-gray-200 bg-white"
                                                        >
                                                            <div className="p-4 space-y-3">
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-gray-500">Customer:</span>
                                                                    <span className="font-medium">{order.customerName || 'Guest'}</span>
                                                                </div>
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-gray-500">Order Time:</span>
                                                                    <span className="font-medium">{new Date(order.createdAt).toLocaleString('en-IN')}</span>
                                                                </div>
                                                                <div className="border-t border-gray-100 pt-3">
                                                                    <span className="text-sm font-bold text-gray-700 mb-2 block">Items:</span>
                                                                    {order.items.map((item, idx) => (
                                                                        <div key={idx} className="flex justify-between text-sm py-1">
                                                                            <span>{item.name} × {item.quantity}</span>
                                                                            <span className="font-medium">{formatPrice((item.offerPrice || item.price) * item.quantity)}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Settings Tab */}
                        {activeTab === 'settings' && (
                            <div className="space-y-6">
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                    <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                                        <AlertCircle size={18} />
                                        Google Sheets Setup Instructions
                                    </h3>
                                    <ol className="text-sm text-amber-700 space-y-2 list-decimal list-inside">
                                        <li>Create a new Google Spreadsheet</li>
                                        <li>Go to Extensions → Apps Script</li>
                                        <li>Delete any existing code and paste the script below</li>
                                        <li>Click Deploy → New Deployment → Web App</li>
                                        <li>Set "Execute as" to "Me" and "Who has access" to "Anyone"</li>
                                        <li>Copy the Web App URL and paste it below</li>
                                    </ol>
                                </div>

                                {/* Script Code */}
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-bold text-gray-700">Google Apps Script Code</label>
                                        <button
                                            onClick={copyScript}
                                            className="flex items-center gap-1 text-sm text-brand-maroon hover:text-brand-burgundy transition-colors"
                                        >
                                            {copied ? <Check size={14} /> : <Copy size={14} />}
                                            {copied ? 'Copied!' : 'Copy Code'}
                                        </button>
                                    </div>
                                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl text-xs overflow-x-auto max-h-48 overflow-y-auto">
                                        {GOOGLE_APPS_SCRIPT_CODE}
                                    </pre>
                                </div>

                                {/* Configuration Form */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Web App URL
                                        </label>
                                        <input
                                            type="url"
                                            value={webAppUrl}
                                            onChange={e => setWebAppUrl(e.target.value)}
                                            placeholder="https://script.google.com/macros/s/xxxxx/exec"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-maroon/20 focus:border-brand-maroon outline-none transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Google Sheet URL (Optional - for quick access)
                                        </label>
                                        <input
                                            type="url"
                                            value={sheetUrl}
                                            onChange={e => setSheetUrl(e.target.value)}
                                            placeholder="https://docs.google.com/spreadsheets/d/xxxxx"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-maroon/20 focus:border-brand-maroon outline-none transition-all"
                                        />
                                    </div>

                                    <button
                                        onClick={handleSaveConfig}
                                        disabled={!webAppUrl}
                                        className={cn(
                                            "w-full py-4 rounded-xl font-bold text-white transition-all",
                                            webAppUrl
                                                ? "bg-gradient-to-r from-brand-maroon to-brand-burgundy hover:from-brand-burgundy hover:to-brand-maroon shadow-lg shadow-brand-maroon/25"
                                                : "bg-gray-300 cursor-not-allowed"
                                        )}
                                    >
                                        Save Configuration
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ExportDataModal;
