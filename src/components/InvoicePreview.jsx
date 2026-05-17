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
  const totalQty = items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);

  return (
    <div 
      className="bg-white text-black w-[800px] mx-auto box-border font-sans p-4" 
      ref={ref} 
      id={id}
    >
      <div className="border-[3px] border-black flex flex-col">
        {/* Header section */}
        <div className="text-center py-2 border-b-[3px] border-black">
          <h1 className="text-[22px] font-bold uppercase tracking-wider">KS AGRO CHEMICALS & FERTILIZERS</h1>
        </div>
        <div className="text-center py-1 border-b-[3px] border-black">
          <p className="text-[13px] font-bold uppercase tracking-wide">68/NP CHOWK SURELI RAHIM YAR KHAN</p>
        </div>

        {/* Info section */}
        <div className="flex border-b-[3px] border-black text-[13px] font-bold uppercase">
          <div className="w-1/2 px-2 py-1 border-r-[3px] border-black">
            BILL NO-{billNo}
          </div>
          <div className="w-1/2 px-2 py-1 text-right">
            PRINT DATE: {printDate}
          </div>
        </div>
        <div className="flex border-b-[3px] border-black text-[13px] font-bold uppercase">
          <div className="px-2 py-1 border-r-[3px] border-black whitespace-nowrap">
            ACCOUNTS:
          </div>
          <div className="flex-1 px-2 py-1 text-center">
            {customerName}
          </div>
        </div>

        {/* Table section */}
        <table className="w-full border-collapse text-[12px] font-bold uppercase">
          <thead>
            <tr className="border-b-[3px] border-black">
              <th className="py-2 px-1 border-r-[3px] border-black text-center w-[14%]">DATE</th>
              <th className="py-2 px-1 border-r-[3px] border-black text-center w-[30%]">PRODUCTS</th>
              <th className="py-2 px-1 border-r-[3px] border-black text-center w-[14%]">RATE</th>
              <th className="py-2 px-1 border-r-[3px] border-black text-center w-[10%]">QTY</th>
              <th className="py-2 px-1 border-r-[3px] border-black text-center w-[14%]">INV DISC</th>
              <th className="py-2 px-1 text-center w-[18%]">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const amount = calculateLineAmount(item.rate, item.qty, item.discount);
              return (
                <tr key={index} className="border-b-2 border-black leading-none">
                  <td className="py-2 px-1 border-r-[3px] border-black text-center h-[30px]">{item.date}</td>
                  <td className="py-2 px-1 border-r-[3px] border-black text-center">{item.productName}</td>
                  <td className="py-2 px-1 border-r-[3px] border-black text-center">{item.rate || 0}</td>
                  <td className="py-2 px-1 border-r-[3px] border-black text-center">{item.qty || 0}</td>
                  <td className="py-2 px-1 border-r-[3px] border-black text-center">{item.discount || ''}</td>
                  <td className="py-2 px-1 text-center">{amount > 0 ? formatCurrency(amount) : 0}</td>
                </tr>
              );
            })}
            {/* Fill empty space if items are few */}
            {items.length < 12 && Array.from({ length: 12 - items.length }).map((_, i) => (
              <tr key={`empty-${i}`} className="border-b-2 border-black leading-none">
                <td className="py-2 px-1 border-r-[3px] border-black h-[30px]"></td>
                <td className="py-2 px-1 border-r-[3px] border-black"></td>
                <td className="py-2 px-1 border-r-[3px] border-black"></td>
                <td className="py-2 px-1 border-r-[3px] border-black"></td>
                <td className="py-2 px-1 border-r-[3px] border-black"></td>
                <td className="py-2 px-1"></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer Totals */}
        <div className="flex border-b-[3px] border-black text-[13px] font-bold uppercase">
          <div className="w-[44%] py-2 border-r-[3px] border-black text-center">
            SAB TOTAL
          </div>
          <div className="w-[14%] border-r-[3px] border-black"></div>
          <div className="w-[10%] py-2 border-r-[3px] border-black text-center">
            {totalQty}
          </div>
          <div className="w-[14%] border-r-[3px] border-black"></div>
          <div className="w-[18%] py-2 text-center">
            {formatCurrency(subTotal)}
          </div>
        </div>

        {/* Signatures */}
        <div className="flex border-b-[3px] border-black text-[12px] font-bold uppercase min-h-[60px]">
          <div className="w-[33.33%] border-r-[3px] border-black flex justify-center pt-2">
            PREPARED BY
          </div>
          <div className="w-[33.33%] border-r-[3px] border-black flex justify-center pt-2">
            APPROVED BY
          </div>
          <div className="w-[33.33%] flex justify-center pt-2">
            RECEIVED BY
          </div>
        </div>

        {/* Bottom Empty Box */}
        <div className="h-[30px]"></div>
      </div>
    </div>
  );
});

export default InvoicePreview;
