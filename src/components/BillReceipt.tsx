import { useState, useRef } from "react";
import { Order } from "../types";
import { X, Printer, CreditCard, Banknote, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type PaymentMethod = "UPI" | "Cash" | "Card";

interface BillReceiptProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

// Format price with Rs. prefix for thermal printer compatibility
const formatPrintPrice = (price: number): string => {
  return `Rs.${price.toFixed(2)}`;
};

// Format price for display with ₹ symbol
const formatDisplayPrice = (price: number): string => {
  return `₹${price.toFixed(0)}`;
};

export const BillReceipt = ({ order, isOpen, onClose }: BillReceiptProps) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const billNumber = `ORD-${order.id.slice(-6).toUpperCase()}`;

  const billDate = new Date(order.createdAt).toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const handlePrint = () => {
    // Thermal printer safe width
    const lineWidth = 38;
    const dividerLine = "-".repeat(lineWidth);
    const doubleLine = "=".repeat(lineWidth);

    // Column Widths (Total = 38 chars)
    const colWidths = {
      item: 14,
      qty: 3,
      rate: 9,
      amount: 10,
    };

    const centerText = (text: string, width: number = lineWidth): string => {
      const padding = Math.max(0, Math.floor((width - text.length) / 2));
      return " ".repeat(padding) + text;
    };

    const leftRightText = (
      left: string,
      right: string,
      width: number = lineWidth
    ): string => {
      const spaces = Math.max(1, width - left.length - right.length);
      return left + " ".repeat(spaces) + right;
    };

    const wrapText = (text: string, maxLength: number): string[] => {
      const words = text.split(" ");
      const lines: string[] = [];
      let currentLine = "";

      for (const word of words) {
        const next = (currentLine + " " + word).trim();
        if (next.length <= maxLength) {
          currentLine = next;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      }

      if (currentLine) lines.push(currentLine);

      return lines.length ? lines : [text.slice(0, maxLength)];
    };

    const formatRow = (col1: string, col2: string, col3: string, col4: string) => {
      const c1 = col1.padEnd(colWidths.item);
      const c2 = col2.padStart(colWidths.qty);
      const c3 = col3.padStart(colWidths.rate);
      const c4 = col4.padStart(colWidths.amount);
      return `${c1}${c2} ${c3} ${c4}`;
    };

    const receiptLines: string[] = [];

    // HEADER
    receiptLines.push(centerText("YUMMY-FI PVT.LMT"));
    receiptLines.push(centerText("FOOD LIKE HOME STYLE"));
    receiptLines.push(dividerLine);
    receiptLines.push(centerText("DINE-IN BILL"));
    receiptLines.push(dividerLine);

    // INFO
    receiptLines.push(leftRightText("BILL NO:", billNumber));
    receiptLines.push(leftRightText("TABLE:", `T${order.tableNumber}`));
    receiptLines.push(leftRightText("DATE:", billDate));
    receiptLines.push(leftRightText("CUSTOMER:", order.customerName || "-"));
    receiptLines.push(leftRightText("PHONE:", phoneNumber || "-"));
    receiptLines.push(dividerLine);

    // ITEMS
    receiptLines.push(formatRow("ITEM", "QTY", "RATE", "AMOUNT"));
    receiptLines.push(dividerLine);

    order.items.forEach((item) => {
      const itemPrice = item.price;
      const itemTotal = itemPrice * item.quantity;

      const itemName = item.name + (item.isVeg === false ? " [N]" : "");
      const qtyStr = String(item.quantity);
      const rateStr = formatPrintPrice(itemPrice);
      const amountStr = formatPrintPrice(itemTotal);

      const nameLines = wrapText(itemName, colWidths.item);

      receiptLines.push(formatRow(nameLines[0], qtyStr, rateStr, amountStr));

      for (let i = 1; i < nameLines.length; i++) {
        receiptLines.push(nameLines[i]);
      }
    });

    receiptLines.push(dividerLine);

    // TOTALS
    receiptLines.push(leftRightText("SUBTOTAL:", formatPrintPrice(order.totalAmount)));
    receiptLines.push(doubleLine);
    receiptLines.push(leftRightText("GRAND TOTAL:", formatPrintPrice(order.totalAmount)));
    receiptLines.push(doubleLine);

    // PAYMENT
    receiptLines.push(centerText("PAYMENT DETAILS"));
    receiptLines.push(dividerLine);
    receiptLines.push(leftRightText("METHOD:", paymentMethod));
    receiptLines.push(leftRightText("PAID:", formatPrintPrice(order.totalAmount)));
    receiptLines.push(dividerLine);

    // FOOTER
    receiptLines.push(centerText("* THANK YOU FOR DINING WITH US! *"));
    receiptLines.push(centerText("PLEASE VISIT AGAIN"));

    // 🔥 IMPORTANT: Extra feed lines (prevents half print + feed button)
    for (let i = 0; i < 14; i++) receiptLines.push(" ");

    const receiptText = receiptLines.join("\n");

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Bill - ${billNumber}</title>
  <style>
    /* ✅ THERMAL SAFE */
    @page {
      margin: 0;
    }

    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
    }

    body {
      margin: 0;
      padding: 0;
    }

    /* ✅ FIXED WIDTH + CENTER */
    .receipt {
      width: 72mm;
      margin: 0 auto;

      /* ⭐ RECORD PRINTER HARDWARE OFFSET FIX */
      position: relative;
      left: -2mm;   /* change to -3mm / -4mm if needed */
    }

    pre {
      margin: 0;
      font-family: monospace;
      font-size: 12px;
      font-weight: 600;
      line-height: 1.25;

      /* 🔥 MOST IMPORTANT */
      white-space: pre;
      word-break: normal;
      overflow: visible;
    }
  </style>
</head>
<body>
  <div class="receipt">
    <pre>${receiptText}</pre>
  </div>

  <script>
    window.onload = function () {
      window.focus();
      window.print();

      // ✅ Delay close so print job fully sends
      setTimeout(function () {
        window.close();
      }, 1200);
    };
  </script>
</body>
</html>
    `);

    printWindow.document.close();
  };

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
            {/* Header */}
            <div className="bg-brand-maroon text-white p-4 flex justify-between items-center">
              <h2 className="text-lg font-bold font-serif">Print Bill Receipt</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Payment Selection */}
            <div className="p-4 bg-gray-50 border-b">
              <p className="text-sm font-bold text-gray-700 mb-3">
                Select Payment Method:
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setPaymentMethod("UPI")}
                  className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${paymentMethod === "UPI"
                    ? "border-brand-maroon bg-brand-cream text-brand-maroon"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                >
                  <Smartphone size={24} />
                  <span className="font-bold text-sm">UPI</span>
                </button>

                <button
                  onClick={() => setPaymentMethod("Cash")}
                  className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${paymentMethod === "Cash"
                    ? "border-brand-maroon bg-brand-cream text-brand-maroon"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                >
                  <Banknote size={24} />
                  <span className="font-bold text-sm">Cash</span>
                </button>

                <button
                  onClick={() => setPaymentMethod("Card")}
                  className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${paymentMethod === "Card"
                    ? "border-brand-maroon bg-brand-cream text-brand-maroon"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                >
                  <CreditCard size={24} />
                  <span className="font-bold text-sm">Card</span>
                </button>
              </div>
            </div>

            {/* Bill Preview */}
            <div className="p-4 overflow-y-auto max-h-[50vh] bg-gray-100">
              <div
                ref={printRef}
                className="receipt bg-white p-6 rounded-lg shadow-sm font-mono text-sm"
              >
                <div className="header text-center mb-4">
                  <div className="text-2xl font-bold tracking-wider mb-1">
                    YUMMY FI
                  </div>
                  <div className="tagline text-xs text-gray-500">
                    FOOD LIKE HOME STYLE
                  </div>
                  <div className="bill-type text-sm font-bold mt-3 border-t border-b border-dashed border-gray-400 py-2">
                    DINE-IN BILL
                  </div>
                </div>

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
                    <span>{order.customerName || "-"}</span>
                  </div>

                  <div className="info-row flex justify-between items-center py-1 border-b border-dotted border-gray-300">
                    <span className="info-label font-bold">PHONE:</span>

                    {isEditingPhone ? (
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        onBlur={() => setIsEditingPhone(false)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && setIsEditingPhone(false)
                        }
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
                        {phoneNumber || "- (click to add)"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Items Header */}
                <div className="items-header flex font-bold text-xs py-2 border-b-2 border-gray-800">
                  <span style={{ width: "40%" }}>ITEM</span>
                  <span style={{ width: "15%", textAlign: "center" }}>QTY</span>
                  <span style={{ width: "20%", textAlign: "right" }}>RATE</span>
                  <span style={{ width: "25%", textAlign: "right" }}>AMOUNT</span>
                </div>

                {/* Items */}
                <div className="mb-3">
                  {order.items.map((item, idx) => {
                    const itemPrice = item.price;
                    const itemTotal = itemPrice * item.quantity;

                    return (
                      <div
                        key={idx}
                        className="item-row flex text-xs py-2 border-b border-dotted border-gray-300"
                      >
                        <span style={{ width: "40%" }}>
                          {item.name} {item.isVeg === false ? "[N]" : ""}
                        </span>
                        <span style={{ width: "15%", textAlign: "center" }}>
                          {item.quantity}
                        </span>
                        <span style={{ width: "20%", textAlign: "right" }}>
                          {formatDisplayPrice(itemPrice)}
                        </span>
                        <span style={{ width: "25%", textAlign: "right" }}>
                          {formatDisplayPrice(itemTotal)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div className="subtotal-row flex justify-between py-2 text-sm">
                  <span className="font-bold">SUBTOTAL:</span>
                  <span>{formatDisplayPrice(order.totalAmount)}</span>
                </div>

                <div className="grand-total flex justify-between py-3 text-lg font-bold border-t-2 border-b-2 border-gray-800">
                  <span>GRAND TOTAL:</span>
                  <span>{formatDisplayPrice(order.totalAmount)}</span>
                </div>

                {/* Payment */}
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
                    <span>{formatDisplayPrice(order.totalAmount)}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="footer mt-6 text-center">
                  <div className="thank-you font-bold text-sm">
                    ★ THANK YOU FOR DINING WITH US! ★
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    PLEASE VISIT AGAIN
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