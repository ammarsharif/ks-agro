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
      className="bg-white text-black w-[210mm] min-h-[297mm] mx-auto box-border font-sans p-8" 
      ref={ref} 
      id={id}
    >
      <div className="border-2 border-black">
        {/* Header section */}
        <div className="text-center py-4 border-b-2 border-black">
          <h1 className="text-2xl font-bold uppercase tracking-wide">KS AGRO CHEMICALS & FERTILIZERS</h1>
          <p className="text-sm mt-1 font-medium">68/NP CHOWK SURELI RAHIM YAR KHAN</p>
        </div>

        {/* Info section */}
        <div className="flex border-b-2 border-black">
          <div className="w-1/2 p-2 space-y-2 flex flex-col justify-center">
            <p className="font-bold text-sm uppercase">BILL NO-{billNo}</p>
          </div>
          <div className="w-1/2 p-2 space-y-2 flex flex-col items-end">
            <p className="font-bold text-sm uppercase">PRINT DATE: {printDate}</p>
            <div className="flex text-sm">
              <span className="font-bold mr-2">ACCOUNTS:</span>
              <span className="uppercase">{customerName}</span>
            </div>
          </div>
        </div>

        {/* Table section */}
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="p-2 border-r-2 border-black text-center w-24">DATE</th>
              <th className="p-2 border-r-2 border-black text-left">PRODUCTS</th>
              <th className="p-2 border-r-2 border-black text-right w-24">RATE</th>
              <th className="p-2 border-r-2 border-black text-center w-16">QTY</th>
              <th className="p-2 border-r-2 border-black text-right w-24">N.DISC</th>
              <th className="p-2 text-right w-32">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const amount = calculateLineAmount(item.rate, item.qty, item.discount);
              return (
                <tr key={index} className="border-b border-gray-300">
                  <td className="p-2 border-r-2 border-black text-center">{item.date}</td>
                  <td className="p-2 border-r-2 border-black font-medium uppercase">{item.productName}</td>
                  <td className="p-2 border-r-2 border-black text-right">{item.rate || 0}</td>
                  <td className="p-2 border-r-2 border-black text-center">{item.qty || 0}</td>
                  <td className="p-2 border-r-2 border-black text-right">{item.discount || 0}</td>
                  <td className="p-2 text-right font-semibold">{formatCurrency(amount)}</td>
                </tr>
              );
            })}
            {/* Fill empty space if items are few */}
            {items.length < 10 && Array.from({ length: 10 - items.length }).map((_, i) => (
              <tr key={`empty-${i}`} className={i === 9 - items.length ? "" : "border-b border-gray-300"}>
                <td className="p-4 border-r-2 border-black"></td>
                <td className="p-4 border-r-2 border-black"></td>
                <td className="p-4 border-r-2 border-black"></td>
                <td className="p-4 border-r-2 border-black"></td>
                <td className="p-4 border-r-2 border-black"></td>
                <td className="p-4"></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer Totals */}
        <div className="border-t-2 border-black p-2 flex justify-end">
          <div className="text-right text-lg font-bold flex gap-4 items-center">
            <span>SAB TOTAL:</span>
            <span className="w-32 inline-block text-right">{formatCurrency(subTotal)}</span>
          </div>
        </div>

        {/* Signatures */}
        <div className="border-t-2 border-black flex">
          <div className="w-1/3 p-2 border-r-2 border-black">
            <p className="font-bold text-sm mb-4">PREPARED BY</p>
            <p className="uppercase text-sm mt-4">{preparedBy}</p>
          </div>
          <div className="w-1/3 p-2 border-r-2 border-black">
            <p className="font-bold text-sm mb-4">APPROVED BY</p>
            <p className="uppercase text-sm mt-4">{approvedBy}</p>
          </div>
          <div className="w-1/3 p-2">
            <p className="font-bold text-sm mb-4">RECEIVED BY</p>
            <p className="uppercase text-sm mt-4">{receivedBy}</p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default InvoicePreview;
