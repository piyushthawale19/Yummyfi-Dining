import { useState, useRef } from 'react';
import { Order } from '../types';
import { formatPrice } from '../utils/helpers';
import { X, Printer, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type PaymentMethod = 'UPI' | 'Cash' | 'Card';

interface BillReceiptProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export const BillReceipt = ({ order, isOpen, onClose }: BillReceiptProps) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Bill - ${order.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Courier Prime', 'Courier New', monospace;
              background: #fff;
              padding: 0;
              margin: 0;
              width: 80mm;
              font-size: 12px;
            }
            .receipt {
              width: 80mm;
              padding: 10mm 5mm;
              background: white;
            }
            .header {
              text-align: center;
              margin-bottom: 10px;
            }
            .logo {
              width: 50px;
              height: 50px;
              border-radius: 50%;
              margin: 0 auto 8px;
            }
            .brand-name {
              font-size: 20px;
              font-weight: bold;
              letter-spacing: 2px;
            }
            .tagline {
              font-size: 10px;
              color: #666;
              margin-top: 4px;
            }
            .bill-type {
              font-size: 14px;
              font-weight: bold;
              margin-top: 8px;
              border-top: 1px dashed #000;
              border-bottom: 1px dashed #000;
              padding: 6px 0;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 4px 0;
              border-bottom: 1px dotted #ccc;
            }
            .info-label {
              font-weight: bold;
            }
            .divider {
              border-top: 1px dashed #000;
              margin: 10px 0;
            }
            .items-header {
              display: flex;
              font-weight: bold;
              padding: 6px 0;
              border-bottom: 2px solid #000;
              font-size: 11px;
            }
            .items-header span:nth-child(1) { flex: 2; }
            .items-header span:nth-child(2) { flex: 0.5; text-align: center; }
            .items-header span:nth-child(3) { flex: 1; text-align: right; }
            .items-header span:nth-child(4) { flex: 1; text-align: right; }
            .item-row {
              display: flex;
              padding: 5px 0;
              border-bottom: 1px dotted #ddd;
              font-size: 11px;
            }
            .item-row span:nth-child(1) { flex: 2; }
            .item-row span:nth-child(2) { flex: 0.5; text-align: center; }
            .item-row span:nth-child(3) { flex: 1; text-align: right; }
            .item-row span:nth-child(4) { flex: 1; text-align: right; }
            .subtotal-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 12px;
            }
            .grand-total {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              font-size: 16px;
              font-weight: bold;
              border-top: 2px solid #000;
              border-bottom: 2px solid #000;
            }
            .payment-section {
              margin-top: 10px;
              padding-top: 8px;
              text-align: center;
            }
            .payment-title {
              font-weight: bold;
              font-size: 12px;
              border-bottom: 1px solid #000;
              padding-bottom: 4px;
              margin-bottom: 8px;
            }
            .payment-row {
              display: flex;
              justify-content: space-between;
              padding: 4px 0;
            }
            .footer {
              margin-top: 15px;
              text-align: center;
              font-size: 11px;
            }
            .thank-you {
              font-weight: bold;
              font-size: 12px;
              margin-bottom: 4px;
            }
            .powered-by {
              margin-top: 10px;
              font-size: 9px;
              color: #888;
            }
            @media print {
              body { width: 80mm; }
              .receipt { width: 80mm; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const billNumber = `ORD-${order.id.slice(-6).toUpperCase()}`;
  const billDate = new Date(order.createdAt).toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-brand-maroon text-white p-4 flex justify-between items-center">
              <h2 className="text-lg font-bold font-serif">Print Bill Receipt</h2>
              <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Payment Method Selection */}
            <div className="p-4 bg-gray-50 border-b">
              <p className="text-sm font-bold text-gray-700 mb-3">Select Payment Method:</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setPaymentMethod('UPI')}
                  className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${paymentMethod === 'UPI'
                    ? 'border-brand-maroon bg-brand-cream text-brand-maroon'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                >
                  <Smartphone size={24} />
                  <span className="font-bold text-sm">UPI</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('Cash')}
                  className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${paymentMethod === 'Cash'
                    ? 'border-brand-maroon bg-brand-cream text-brand-maroon'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                >
                  <Banknote size={24} />
                  <span className="font-bold text-sm">Cash</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('Card')}
                  className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${paymentMethod === 'Card'
                    ? 'border-brand-maroon bg-brand-cream text-brand-maroon'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                >
                  <CreditCard size={24} />
                  <span className="font-bold text-sm">Card</span>
                </button>
              </div>
            </div>

            {/* Bill Preview */}
            <div className="p-4 overflow-y-auto max-h-[50vh] bg-gray-100">
              <div ref={printRef} className="receipt bg-white p-6 rounded-lg shadow-sm font-mono text-sm">
                {/* Header */}
                <div className="header text-center mb-4">
                  <img
                    src="/542169443-ff628a00-4675-44b8-9fb4-6c3b6630590b.png"
                    alt="Logo"
                    className="logo w-14 h-14 rounded-full mx-auto mb-2 border border-gray-200"
                  />
                  <div className="brand-name text-xl font-bold tracking-wide">YUMMY FI</div>
                  <div className="tagline text-xs text-gray-500 mt-1">FOOD LIKE HOME STYLE</div>
                  <div className="bill-type text-sm font-bold mt-3 border-t border-b border-dashed border-gray-400 py-2">
                    DINE-IN BILL
                  </div>
                </div>

                {/* Bill Info */}
                <div className="space-y-1 mb-4">
                  <div className="info-row flex justify-between py-1 border-b border-dotted border-gray-300">
                    <span className="info-label font-bold">BILL NO:</span>
                    <span>{billNumber}</span>
                  </div>
                  <div className="info-row flex justify-between py-1 border-b border-dotted border-gray-300">
                    <span className="info-label font-bold">TABLE:</span>
                    <span>T{order.tableNumber}</span>
                  </div>
                  <div className="info-row flex justify-between py-1 border-b border-dotted border-gray-300">
                    <span className="info-label font-bold">DATE:</span>
                    <span>{billDate}</span>
                  </div>
                  <div className="info-row flex justify-between py-1 border-b border-dotted border-gray-300">
                    <span className="info-label font-bold">CUSTOMER:</span>
                    <span>{order.customerName || '-'}</span>
                  </div>
                  <div className="info-row flex justify-between items-center py-1 border-b border-dotted border-gray-300">
                    <span className="info-label font-bold">PHONE:</span>
                    {isEditingPhone ? (
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        onBlur={() => setIsEditingPhone(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setIsEditingPhone(false)}
                        placeholder="Enter phone..."
                        autoFocus
                        className="w-32 text-right text-sm border border-brand-maroon/30 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-brand-maroon"
                      />
                    ) : (
                      <span
                        onClick={() => setIsEditingPhone(true)}
                        className="cursor-pointer hover:text-brand-maroon hover:underline transition-colors"
                        title="Click to add phone number"
                      >
                        {phoneNumber || '- (click to add)'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="divider border-t border-dashed border-gray-400 my-3"></div>

                {/* Items Header */}
                <div className="items-header flex font-bold text-xs py-2 border-b-2 border-gray-800">
                  <span style={{ flex: 2 }}>ITEM</span>
                  <span style={{ flex: 0.5, textAlign: 'center' }}>QTY</span>
                  <span style={{ flex: 1, textAlign: 'right' }}>RATE</span>
                  <span style={{ flex: 1, textAlign: 'right' }}>AMOUNT</span>
                </div>

                {/* Items */}
                <div className="mb-3">
                  {order.items.map((item, idx) => {
                    const itemPrice = item.offerPrice || item.price;
                    const itemTotal = itemPrice * item.quantity;
                    return (
                      <div key={idx} className="item-row flex text-xs py-2 border-b border-dotted border-gray-300">
                        <span style={{ flex: 2 }}>
                          {item.name} {item.isVeg === false ? '[N]' : ''}
                        </span>
                        <span style={{ flex: 0.5, textAlign: 'center' }}>{item.quantity}</span>
                        <span style={{ flex: 1, textAlign: 'right' }}>{formatPrice(itemPrice)}</span>
                        <span style={{ flex: 1, textAlign: 'right' }}>{formatPrice(itemTotal)}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Subtotal */}
                <div className="subtotal-row flex justify-between py-2 text-sm">
                  <span className="font-bold">SUBTOTAL:</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>

                {/* Grand Total */}
                <div className="grand-total flex justify-between py-3 text-lg font-bold border-t-2 border-b-2 border-gray-800">
                  <span>GRAND TOTAL:</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>

                {/* Payment Section */}
                <div className="payment-section mt-4 pt-3 text-center">
                  <div className="payment-title font-bold text-xs border-b border-gray-800 pb-2 mb-3">
                    PAYMENT DETAILS
                  </div>
                  <div className="payment-row flex justify-between py-1 text-sm">
                    <span className="font-bold">METHOD:</span>
                    <span>{paymentMethod}</span>
                  </div>
                  <div className="payment-row flex justify-between py-1 text-sm">
                    <span className="font-bold">PAID:</span>
                    <span>{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="footer mt-6 text-center">
                  <div className="thank-you font-bold text-sm">
                    ★ THANK YOU FOR DINING WITH US! ★
                  </div>
                  <div className="text-xs text-gray-600 mt-1">PLEASE VISIT AGAIN</div>
                  <div className="powered-by text-[10px] text-gray-400 mt-4">
                    Powered by YummyFi POS System
                  </div>
                </div>
              </div>
            </div>

            {/* Print Button */}
            <div className="p-4 bg-white border-t">
              <button
                onClick={handlePrint}
                className="w-full bg-brand-maroon text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-burgundy transition-colors shadow-lg"
              >
                <Printer size={20} />
                Print Receipt
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
