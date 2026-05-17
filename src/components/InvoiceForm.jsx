import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { 
  getProducts, 
  saveDraft, 
  getDraft, 
  clearDraft, 
  getNextBillNo, 
  incrementBillNo 
} from '../utils/storage';
import { calculateSubTotal, formatCurrency, calculateLineAmount } from '../utils/calculations';
import ProductManager from './ProductManager';
import InvoicePreview from './InvoicePreview';
import ConfirmModal from './ConfirmModal';

export default function InvoiceForm() {
  const [products, setProducts] = useState([]);
  const [showProductManager, setShowProductManager] = useState(false);
  const [showConfirmNew, setShowConfirmNew] = useState(false);
  const [showPreviewScreen, setShowPreviewScreen] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  
  const printRef = useRef();

  const getToday = () => new Date().toISOString().split('T')[0];

  const initialInvoiceState = {
    billNo: getNextBillNo().toString(),
    printDate: getToday(),
    customerName: '',
    preparedBy: '',
    approvedBy: '',
    receivedBy: '',
    items: [
      { id: Date.now(), date: getToday(), productId: '', productName: '', rate: '', qty: 1, discount: 0 }
    ]
  };

  const [invoiceData, setInvoiceData] = useState(() => {
    const draft = getDraft();
    return draft || initialInvoiceState;
  });

  useEffect(() => {
    setProducts(getProducts());
  }, []);

  // Auto-save draft
  useEffect(() => {
    saveDraft(invoiceData);
  }, [invoiceData]);

  // Handle mobile preview scaling
  useEffect(() => {
    if (!showPreviewScreen) return;
    
    const updateScale = () => {
      if (window.innerWidth < 850) {
        // 32px for padding (16px each side)
        setPreviewScale((window.innerWidth - 32) / 800);
      } else {
        setPreviewScale(1);
      }
    };
    
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [showPreviewScreen]);

  const handleNewInvoice = () => {
    setShowConfirmNew(true);
  };

  const executeNewInvoice = () => {
    clearDraft();
    incrementBillNo();
    setInvoiceData({
      ...initialInvoiceState,
      billNo: getNextBillNo().toString(),
      items: [{ id: Date.now(), date: getToday(), productId: '', productName: '', rate: '', qty: 1, discount: 0 }]
    });
    setShowConfirmNew(false);
  };

  const handleChange = (field, value) => {
    setInvoiceData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoiceData.items];
    const item = newItems[index];
    
    if (field === 'productId') {
      const selectedProduct = products.find(p => p.id.toString() === value.toString());
      item.productId = value;
      if (selectedProduct) {
        item.productName = selectedProduct.name;
        item.rate = selectedProduct.defaultRate;
      } else {
        item.productName = '';
        item.rate = 0;
      }
    } else {
      item[field] = value;
    }
    
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const addItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { id: Date.now(), date: getToday(), productId: '', productName: '', rate: '', qty: 1, discount: 0 }
      ]
    }));
  };

  const removeItem = (index) => {
    if (invoiceData.items.length === 1) return;
    const newItems = invoiceData.items.filter((_, i) => i !== index);
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const subTotal = calculateSubTotal(invoiceData.items);

  const handleDownloadImage = async () => {
    try {
      // Target the unscaled, hidden capture area instead of the scaled preview screen
      const element = document.getElementById('invoice-capture-area');
      if (!element) return;
      
      const canvas = await html2canvas(element, {
        scale: 3, // Ultra-high resolution (3x the 800px width = 2400px wide)
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `KS-Agro-Invoice-${invoiceData.billNo}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error saving image:', error);
      alert('Failed to save image.');
    }
  };

  if (showPreviewScreen) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Hidden unscaled instance specifically for ultra-crisp html2canvas capture */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', zIndex: -1 }}>
          <InvoicePreview invoiceData={invoiceData} id="invoice-capture-area" />
        </div>

        <div className="bg-white px-4 py-3 shadow-sm border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-lg font-semibold">Invoice Preview</h2>
          <div className="flex gap-2">
            <button 
              onClick={handleDownloadImage}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md font-medium text-sm transition-colors flex items-center gap-2 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Save Image
            </button>
            <button 
              onClick={() => setShowPreviewScreen(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md font-medium text-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 flex justify-center items-start bg-gray-100">
          <div 
            className="shadow-2xl bg-white origin-top-left"
            style={{ 
              transform: `scale(${previewScale})`,
              transformOrigin: 'top center',
              marginBottom: `calc(-100% * (1 - ${previewScale}))` 
            }}
          >
            <InvoicePreview invoiceData={invoiceData} id="invoice-preview-screen" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hidden print area for regular layout, handled by index.css #invoice-print-area */}
      <InvoicePreview ref={printRef} invoiceData={invoiceData} />
      
      <div className="min-h-screen bg-gray-50 pb-12 no-print">
        {/* Top Navbar */}
        <nav className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-2xl font-bold tracking-tight text-gray-900">
            KS AGRO <span className="text-accent font-medium text-lg">Invoice</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setShowProductManager(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 font-medium transition-colors text-sm"
            >
              Manage Products
            </button>
            <button 
              onClick={handleNewInvoice}
              className="px-4 py-2 border border-gray-300 text-red-600 bg-white rounded-md hover:bg-red-50 font-medium transition-colors text-sm"
            >
              New Invoice
            </button>
            <button 
              onClick={() => setShowPreviewScreen(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 font-medium transition-colors text-sm"
            >
              Preview
            </button>
            <button 
              onClick={() => window.print()}
              className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 font-medium transition-colors text-sm"
            >
              Print
            </button>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header Details */}
            <div className="p-6 border-b border-gray-200 bg-white">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded bg-blue-100 text-accent flex items-center justify-center text-sm">1</span>
                Invoice Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Bill No.</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">BILL NO-</span>
                    <input 
                      type="text" 
                      value={invoiceData.billNo}
                      onChange={e => handleChange('billNo', e.target.value)}
                      className="w-full pl-[76px] pr-3 py-2.5 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Print Date</label>
                  <input 
                    type="date" 
                    value={invoiceData.printDate}
                    onChange={e => handleChange('printDate', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Customer Name</label>
                  <input 
                    type="text" 
                    value={invoiceData.customerName}
                    onChange={e => handleChange('customerName', e.target.value)}
                    placeholder="Enter customer or account name"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm uppercase"
                  />
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <span className="w-8 h-8 rounded bg-blue-100 text-accent flex items-center justify-center text-sm">2</span>
                  Product Details
                </h2>
              </div>
              
              <div className="md:hidden space-y-4 mb-4">
                {invoiceData.items.map((item, index) => {
                  const amount = calculateLineAmount(item.rate, item.qty, item.discount);
                  return (
                    <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative">
                      <button 
                        onClick={() => removeItem(index)}
                        disabled={invoiceData.items.length === 1}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 disabled:opacity-30 p-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"></path><path d="M6 6l12 12"></path></svg>
                      </button>
                      
                      <div className="space-y-3 mt-2">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                            <input 
                              type="date" 
                              value={item.date}
                              onChange={e => handleItemChange(index, 'date', e.target.value)}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm outline-none focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Product</label>
                            {item.productId && !products.find(p => p.id.toString() === item.productId.toString()) ? (
                              <div className="flex items-center justify-between w-full px-2 py-1.5 border border-gray-300 rounded bg-white text-sm">
                                <span className="font-medium truncate">{item.productName}</span>
                                <button onClick={() => handleItemChange(index, 'productId', '')} className="text-xs text-blue-500">Change</button>
                              </div>
                            ) : (
                              <select 
                                value={item.productId}
                                onChange={e => handleItemChange(index, 'productId', e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm bg-white outline-none focus:border-blue-500"
                              >
                                {products.length === 0 ? <option value="" disabled>No products</option> : <option value="">Select...</option>}
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                              </select>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Rate</label>
                            <input type="number" min="0" value={item.rate} onChange={e => handleItemChange(index, 'rate', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" placeholder="0" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Qty</label>
                            <input type="number" min="1" value={item.qty} onChange={e => handleItemChange(index, 'qty', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">N.Disc</label>
                            <input type="number" min="0" value={item.discount} onChange={e => handleItemChange(index, 'discount', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" placeholder="0" />
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                          <span className="text-sm font-medium text-gray-500">Amount</span>
                          <span className="text-base font-bold text-gray-900">{formatCurrency(amount)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="hidden md:block overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0 pb-2">
                <table className="w-full min-w-[800px] text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="py-3 px-2 font-medium text-gray-600 w-36 text-sm">Date</th>
                      <th className="py-3 px-2 font-medium text-gray-600 text-sm">Product</th>
                      <th className="py-3 px-2 font-medium text-gray-600 w-28 text-sm">Rate</th>
                      <th className="py-3 px-2 font-medium text-gray-600 w-24 text-sm">Qty</th>
                      <th className="py-3 px-2 font-medium text-gray-600 w-28 text-sm">N.Disc</th>
                      <th className="py-3 px-2 font-medium text-gray-600 w-32 text-right text-sm">Amount</th>
                      <th className="py-3 px-2 font-medium text-gray-600 w-12 text-center text-sm"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoiceData.items.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-12 text-center text-gray-400">
                          Add a row to start your invoice &darr;
                        </td>
                      </tr>
                    ) : (
                      invoiceData.items.map((item, index) => {
                        const amount = calculateLineAmount(item.rate, item.qty, item.discount);
                        return (
                          <tr key={item.id} className="group hover:bg-[#F9FAFB] transition-colors">
                            <td className="py-3 px-2">
                              <input 
                                type="date" 
                                value={item.date}
                                onChange={e => handleItemChange(index, 'date', e.target.value)}
                                className="w-full px-2 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              />
                            </td>
                            <td className="py-3 px-2">
                              {item.productId && !products.find(p => p.id.toString() === item.productId.toString()) ? (
                                <div className="flex items-center justify-between w-full px-2 py-2 border border-gray-300 rounded-md bg-gray-50">
                                  <span className="text-sm font-medium uppercase text-gray-700">{item.productName}</span>
                                  <button onClick={() => handleItemChange(index, 'productId', '')} className="text-xs text-blue-500 hover:underline">Change</button>
                                </div>
                              ) : (
                                <select 
                                  value={item.productId}
                                  onChange={e => handleItemChange(index, 'productId', e.target.value)}
                                  className="w-full px-2 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                                >
                                  {products.length === 0 ? (
                                    <option value="" disabled>No products — click Manage Products</option>
                                  ) : (
                                    <option value="">Select a product...</option>
                                  )}
                                  {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                  ))}
                                </select>
                              )}
                            </td>
                            <td className="py-3 px-2">
                              <input 
                                type="number" 
                                min="0"
                                value={item.rate}
                                onChange={e => handleItemChange(index, 'rate', e.target.value)}
                                className="w-full px-2 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                placeholder="0"
                              />
                            </td>
                            <td className="py-3 px-2">
                              <input 
                                type="number" 
                                min="1"
                                value={item.qty}
                                onChange={e => handleItemChange(index, 'qty', e.target.value)}
                                className="w-full px-2 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              />
                            </td>
                            <td className="py-3 px-2">
                              <input 
                                type="number" 
                                min="0"
                                value={item.discount}
                                onChange={e => handleItemChange(index, 'discount', e.target.value)}
                                className="w-full px-2 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                placeholder="0"
                              />
                            </td>
                            <td className="py-3 px-2 text-right font-medium text-gray-900 bg-gray-50/50 rounded-md">
                              {formatCurrency(amount)}
                            </td>
                            <td className="py-3 px-2 text-center">
                              <button 
                                onClick={() => removeItem(index)}
                                disabled={invoiceData.items.length === 1}
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors focus:outline-none disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                                title="Remove item"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"></path><path d="M6 6l12 12"></path></svg>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 flex justify-between items-center border-t border-gray-200 pt-4">
                <button 
                  onClick={addItem}
                  className="flex items-center gap-2 text-accent font-medium hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-md transition-colors text-sm border border-transparent hover:border-blue-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Add Product
                </button>
                <div className="text-right flex items-center bg-gray-50 px-4 py-2 rounded-md border border-gray-200">
                  <span className="text-gray-500 font-medium mr-4 text-sm tracking-wider">SAB TOTAL</span>
                  <span className="text-xl font-bold text-gray-900">{formatCurrency(subTotal)}</span>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="p-6 border-t border-gray-200 bg-white">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded bg-blue-100 text-accent flex items-center justify-center text-sm">3</span>
                Signatures
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Prepared By</label>
                  <input 
                    type="text" 
                    value={invoiceData.preparedBy}
                    onChange={e => handleChange('preparedBy', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Approved By</label>
                  <input 
                    type="text" 
                    value={invoiceData.approvedBy}
                    onChange={e => handleChange('approvedBy', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Received By</label>
                  <input 
                    type="text" 
                    value={invoiceData.receivedBy}
                    onChange={e => handleChange('receivedBy', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {showProductManager && (
          <ProductManager 
            products={products} 
            setProducts={setProducts} 
            onClose={() => setShowProductManager(false)} 
          />
        )}
      </div>

      <ConfirmModal 
        isOpen={showConfirmNew}
        title="Start New Invoice"
        message="Are you sure you want to clear the current form and start a new invoice? Unsaved changes will be lost."
        confirmText="Yes, Start New"
        isDestructive={true}
        onConfirm={executeNewInvoice}
        onCancel={() => setShowConfirmNew(false)}
      />
    </div>
  );
}
