import { Order } from '../types';

// Daily cycle: 4 AM to 4 AM next day
const CYCLE_START_HOUR = 4; // 4 AM

/**
 * Get the current daily cycle start and end times
 * Cycle runs from 4 AM today to 4 AM tomorrow
 */
export const getDailyCycleDates = (): { start: Date; end: Date } => {
    const now = new Date();
    const currentHour = now.getHours();

    // If before 4 AM, the cycle started yesterday at 4 AM
    const cycleStart = new Date(now);
    if (currentHour < CYCLE_START_HOUR) {
        cycleStart.setDate(cycleStart.getDate() - 1);
    }
    cycleStart.setHours(CYCLE_START_HOUR, 0, 0, 0);

    // Cycle ends at 4 AM the next day
    const cycleEnd = new Date(cycleStart);
    cycleEnd.setDate(cycleEnd.getDate() + 1);

    return { start: cycleStart, end: cycleEnd };
};

/**
 * Filter orders for the current daily cycle (4 AM - 4 AM)
 */
export const getOrdersForCurrentCycle = (orders: Order[]): Order[] => {
    const { start, end } = getDailyCycleDates();

    return orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= start && orderDate < end;
    });
};

/**
 * Check if it's time to clear old data (after 4:01 AM)
 */
export const shouldClearData = (lastClearTimestamp: string | null): boolean => {
    if (!lastClearTimestamp) return false;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    // If it's past 4:00 AM
    if (currentHour === CYCLE_START_HOUR && currentMinutes >= 1) {
        const lastClear = new Date(lastClearTimestamp);
        const { start } = getDailyCycleDates();

        // If the last clear was before the current cycle start
        return lastClear < start;
    }

    return false;
};

/**
 * Format orders for Google Sheets export
 */
export const formatOrdersForSheet = (orders: Order[]): string[][] => {
    // Header row
    const headers = [
        'Order ID',
        'Customer Name',
        'Table Number',
        'Items',
        'Item Details',
        'Total Amount (₹)',
        'Status',
        'Order Time',
        'Confirmed Time',
        'Ready Time'
    ];

    const rows: string[][] = [headers];

    orders.forEach(order => {
        const itemNames = order.items.map(item => `${item.name} (x${item.quantity})`).join(', ');
        const itemDetails = order.items.map(item =>
            `${item.name}: ₹${item.offerPrice || item.price} x ${item.quantity} = ₹${(item.offerPrice || item.price) * item.quantity}`
        ).join(' | ');

        const formatDateTime = (dateStr: string | undefined) => {
            if (!dateStr) return '-';
            const date = new Date(dateStr);
            return date.toLocaleString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        };

        rows.push([
            order.id,
            order.customerName || 'Guest',
            order.tableNumber,
            itemNames,
            itemDetails,
            order.totalAmount.toFixed(2),
            order.status.charAt(0).toUpperCase() + order.status.slice(1),
            formatDateTime(order.createdAt),
            formatDateTime(order.confirmedAt),
            formatDateTime(order.readyAt)
        ]);
    });

    return rows;
};

/**
 * Generate CSV content from orders
 */
export const generateCSV = (orders: Order[]): string => {
    const rows = formatOrdersForSheet(orders);

    return rows.map(row =>
        row.map(cell => {
            // Escape quotes and wrap in quotes if contains comma or newline
            const escaped = cell.replace(/"/g, '""');
            return /[,\n"]/.test(cell) ? `"${escaped}"` : escaped;
        }).join(',')
    ).join('\n');
};

/**
 * Download orders as CSV file
 */
export const downloadOrdersAsCSV = (orders: Order[]): void => {
    const cycleOrders = getOrdersForCurrentCycle(orders);
    const csv = generateCSV(cycleOrders);

    const { start } = getDailyCycleDates();
    const dateStr = start.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `YummyFi_Orders_${dateStr}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
};

/**
 * Generate summary statistics for the current cycle
 */
export const getCycleSummary = (orders: Order[]) => {
    const cycleOrders = getOrdersForCurrentCycle(orders);

    const totalOrders = cycleOrders.length;
    const pendingOrders = cycleOrders.filter(o => o.status === 'pending').length;
    const confirmedOrders = cycleOrders.filter(o => o.status === 'confirmed').length;
    const readyOrders = cycleOrders.filter(o => o.status === 'ready').length;
    const completedOrders = cycleOrders.filter(o => o.status === 'completed').length;
    const totalRevenue = cycleOrders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + o.totalAmount, 0);

    const { start, end } = getDailyCycleDates();

    return {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        readyOrders,
        completedOrders,
        totalRevenue,
        cycleStart: start,
        cycleEnd: end,
        orders: cycleOrders
    };
};

/**
 * Export to Google Sheets via Web App
 * This requires setting up a Google Apps Script project (instructions in modal)
 */
export const exportToGoogleSheets = async (orders: Order[]): Promise<{ success: boolean; message: string; sheetUrl?: string }> => {
    const webAppUrl = localStorage.getItem('googleSheetWebAppUrl');

    if (!webAppUrl) {
        return {
            success: false,
            message: 'Google Sheets Web App URL not configured. Please set it up first.'
        };
    }

    try {
        const cycleOrders = getOrdersForCurrentCycle(orders);
        const formattedData = formatOrdersForSheet(cycleOrders);
        const { start } = getDailyCycleDates();
        const sheetName = `Orders_${start.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}`;

        await fetch(webAppUrl, {
            method: 'POST',
            mode: 'no-cors', // Google Apps Script requires this
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'writeOrders',
                sheetName,
                data: formattedData,
                clearPrevious: true
            })
        });

        // Due to no-cors mode, we can't read the response
        // So we assume success if no error was thrown
        return {
            success: true,
            message: 'Data sent to Google Sheets successfully! Check your sheet for updates.',
            sheetUrl: localStorage.getItem('googleSheetUrl') || undefined
        };
    } catch (error) {
        console.error('Error exporting to Google Sheets:', error);
        return {
            success: false,
            message: `Failed to export: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
};

/**
 * Save Google Sheets configuration
 */
export const saveGoogleSheetsConfig = (webAppUrl: string, sheetUrl: string): void => {
    localStorage.setItem('googleSheetWebAppUrl', webAppUrl);
    localStorage.setItem('googleSheetUrl', sheetUrl);
};

/**
 * Get saved Google Sheets configuration
 */
export const getGoogleSheetsConfig = (): { webAppUrl: string; sheetUrl: string } => {
    return {
        webAppUrl: localStorage.getItem('googleSheetWebAppUrl') || '',
        sheetUrl: localStorage.getItem('googleSheetUrl') || ''
    };
};

/**
 * Check if Google Sheets is configured
 */
export const isGoogleSheetsConfigured = (): boolean => {
    return !!localStorage.getItem('googleSheetWebAppUrl');
};
