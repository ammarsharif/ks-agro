import React, { forwardRef } from 'react';
import { calculateSubTotal, formatCurrency, calculateLineAmount } from '../utils/calculations';

const InvoicePreview = forwardRef(({ invoiceData, id = "invoice-print-area" }, ref) => {
  const {
    billNo,
    printDate,
    customerName,
    items,
    preparedBy,
    approvedBy,
    receivedBy
  } = invoiceData;

  const subTotal = calculateSubTotal(items);

  return (
    <div 
      className="bg-white text-black w-full max-w-[800px] mx-auto box-border font-sans p-3 sm:p-8 text-[11px] sm:text-sm" 
      ref={ref} 
      id={id}
    >
      <div className="border-2 border-black">
        {/* Header section */}
        <div className="text-center py-3 sm:py-4 border-b-2 border-black">
          <h1 className="text-lg sm:text-2xl font-bold uppercase tracking-wide">KS AGRO CHEMICALS & FERTILIZERS</h1>
          <p className="text-[10px] sm:text-sm mt-1 font-medium">68/NP CHOWK SURELI RAHIM YAR KHAN</p>
        </div>

        {/* Info section */}
        <div className="flex border-b-2 border-black">
          <div className="w-1/2 p-2 space-y-1 sm:space-y-2 flex flex-col justify-center">
            <p className="font-bold uppercase">BILL NO-{billNo}</p>
          </div>
          <div className="w-1/2 p-2 space-y-1 sm:space-y-2 flex flex-col items-end">
            <p className="font-bold uppercase">PRINT DATE: {printDate}</p>
            <div className="flex">
              <span className="font-bold mr-2">ACCOUNTS:</span>
              <span className="uppercase">{customerName}</span>
            </div>
          </div>
        </div>

        {/* Table section */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="p-1 sm:p-2 border-r-2 border-black text-center w-[15%]">DATE</th>
              <th className="p-1 sm:p-2 border-r-2 border-black text-left">PRODUCTS</th>
              <th className="p-1 sm:p-2 border-r-2 border-black text-right w-[15%]">RATE</th>
              <th className="p-1 sm:p-2 border-r-2 border-black text-center w-[10%]">QTY</th>
              <th className="p-1 sm:p-2 border-r-2 border-black text-right w-[15%]">N.DISC</th>
              <th className="p-1 sm:p-2 text-right w-[18%]">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const amount = calculateLineAmount(item.rate, item.qty, item.discount);
              return (
                <tr key={index} className="border-b border-gray-300">
                  <td className="p-1 sm:p-2 border-r-2 border-black text-center">{item.date}</td>
                  <td className="p-1 sm:p-2 border-r-2 border-black font-medium uppercase truncate max-w-[80px] sm:max-w-none">{item.productName}</td>
                  <td className="p-1 sm:p-2 border-r-2 border-black text-right">{item.rate || 0}</td>
                  <td className="p-1 sm:p-2 border-r-2 border-black text-center">{item.qty || 0}</td>
                  <td className="p-1 sm:p-2 border-r-2 border-black text-right">{item.discount || 0}</td>
                  <td className="p-1 sm:p-2 text-right font-semibold">{formatCurrency(amount)}</td>
                </tr>
              );
            })}
            {/* Fill empty space if items are few */}
            {items.length < 10 && Array.from({ length: 10 - items.length }).map((_, i) => (
              <tr key={`empty-${i}`} className={i === 9 - items.length ? "" : "border-b border-gray-300"}>
                <td className="p-2 sm:p-4 border-r-2 border-black"></td>
                <td className="p-2 sm:p-4 border-r-2 border-black"></td>
                <td className="p-2 sm:p-4 border-r-2 border-black"></td>
                <td className="p-2 sm:p-4 border-r-2 border-black"></td>
                <td className="p-2 sm:p-4 border-r-2 border-black"></td>
                <td className="p-2 sm:p-4"></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer Totals */}
        <div className="border-t-2 border-black p-2 flex justify-end">
          <div className="text-right text-base sm:text-lg font-bold flex gap-4 items-center">
            <span>SAB TOTAL:</span>
            <span className="w-20 sm:w-32 inline-block text-right">{formatCurrency(subTotal)}</span>
          </div>
        </div>

        {/* Signatures */}
        <div className="border-t-2 border-black flex">
          <div className="w-1/3 p-2 border-r-2 border-black">
            <p className="font-bold mb-4">PREPARED BY</p>
            <p className="uppercase mt-4">{preparedBy}</p>
          </div>
          <div className="w-1/3 p-2 border-r-2 border-black">
            <p className="font-bold mb-4">APPROVED BY</p>
            <p className="uppercase mt-4">{approvedBy}</p>
          </div>
          <div className="w-1/3 p-2">
            <p className="font-bold mb-4">RECEIVED BY</p>
            <p className="uppercase mt-4">{receivedBy}</p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default InvoicePreview;
