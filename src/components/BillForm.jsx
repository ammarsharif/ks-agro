import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import {
  getProducts,
  getDealers,
  upsertDealer,
  deleteDealer,
  getBillDraft,
  saveBillDraft,
  clearBillDraft
} from '../utils/storage';
import { calcNetRate, calcBillAmount, formatMoney } from '../utils/calculations';
import ProductManager from './ProductManager';
import BillPreview, { VARIANTS, isFilledRow } from './BillPreview';
import ConfirmModal from './ConfirmModal';

const getToday = () => new Date().toISOString().split('T')[0];
const randomBillNo = (prefix) => `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
let uid = Date.now();
const blankItem = () => ({
  id: ++uid,
  productName: '',
  batch: '',
  qty: '',
  grossRate: '',
  invDisc: '',
  furDisc: ''
});

const freshBill = (prefix) => ({
  billNo: randomBillNo(prefix),
  date: getToday(),
  dealerName: '',
  accountId: '',
  dcNo: '',
  remarks: '',
  previousBalance: '',
  items: [blankItem()]
});

const inputCls =
  'w-full px-3 py-2.5 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';
const smallLabelCls = 'block text-xs font-medium text-gray-500 mb-1';

/* Dealer name box that suggests previously saved dealers */
function DealerInput({ value, dealers, onChange, onPick, onRemove }) {
  const [open, setOpen] = useState(false);
  const q = value.trim().toUpperCase();
  const matches = dealers.filter((d) => d.name.includes(q));

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value.toUpperCase()); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        placeholder="Type dealer name or pick a saved one"
        autoComplete="off"
        className={`${inputCls} uppercase`}
      />
      {open && matches.length > 0 && (
        <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {matches.map((d) => (
            <li
              key={d.name}
              onMouseDown={(e) => { e.preventDefault(); onPick(d); setOpen(false); }}
              className="flex items-center justify-between px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
            >
              <span>
                <span className="font-medium">{d.name}</span>
                <span className="text-gray-400 ml-2 text-xs">ID {d.accountId || '-'} · DC {d.dcNo || '-'}</span>
              </span>
              <button
                type="button"
                title="Remove from saved dealers"
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(d); }}
                className="text-gray-300 hover:text-red-500 px-2 text-lg leading-none"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function BillForm({ variant }) {
  const cfg = VARIANTS[variant];
  const showPrices = cfg.prices;

  const [products, setProducts] = useState(() => getProducts());
  const [dealers, setDealers] = useState(() => getDealers());
  const [showProductManager, setShowProductManager] = useState(false);
  const [showConfirmNew, setShowConfirmNew] = useState(false);
  const [showPreviewScreen, setShowPreviewScreen] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);

  const [bill, setBill] = useState(() => {
    const draft = getBillDraft(variant);
    if (draft && Array.isArray(draft.items) && draft.items.length > 0) return { ...freshBill(cfg.prefix), ...draft };
    return freshBill(cfg.prefix);
  });

  useEffect(() => { saveBillDraft(variant, bill); }, [variant, bill]);

  useEffect(() => {
    if (!showPreviewScreen) return;
    const update = () => setPreviewScale(window.innerWidth < 830 ? (window.innerWidth - 32) / 794 : 1);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [showPreviewScreen]);

  const setField = (field, value) => setBill((prev) => ({ ...prev, [field]: value }));

  const setItem = (index, patch) =>
    setBill((prev) => ({
      ...prev,
      items: prev.items.map((it, i) => (i === index ? { ...it, ...patch } : it))
    }));

  const changeProduct = (index, name) => {
    const match = products.find((p) => p.name.toUpperCase() === name.trim().toUpperCase());
    const patch = { productName: name };
    if (match && showPrices) patch.grossRate = match.defaultRate;
    setItem(index, patch);
  };

  const addItem = () => setBill((prev) => ({ ...prev, items: [...prev.items, blankItem()] }));
  const removeItem = (index) =>
    setBill((prev) => (prev.items.length === 1 ? prev : { ...prev, items: prev.items.filter((_, i) => i !== index) }));

  const pickDealer = (d) => setBill((prev) => ({ ...prev, dealerName: d.name, accountId: d.accountId, dcNo: d.dcNo }));

  // Remember this dealer's Account ID + D.C. No for next time
  const rememberDealer = () => {
    if (bill.dealerName.trim()) {
      setDealers(upsertDealer({ name: bill.dealerName, accountId: bill.accountId, dcNo: bill.dcNo }));
    }
  };

  const executeNew = () => {
    rememberDealer();
    clearBillDraft(variant);
    setBill(freshBill(cfg.prefix));
    setShowConfirmNew(false);
  };

  const rows = bill.items.filter(isFilledRow);
  const subTotal = rows.reduce((s, i) => s + calcBillAmount(i), 0);
  const totalQty = rows.reduce((s, i) => s + (parseFloat(i.qty) || 0), 0);
  const totalBalance = subTotal + (parseFloat(bill.previousBalance) || 0);

  const handleShow = () => { rememberDealer(); setShowPreviewScreen(true); };
  const handlePrint = () => { rememberDealer(); window.print(); };

  const handleDownloadImage = async () => {
    try {
      rememberDealer();
      const element = document.getElementById('invoice-capture-area');
      if (!element) return;
      const canvas = await html2canvas(element, { scale: 3, useCORS: true, logging: false, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png', 1.0);
      link.download = `KS-Agro-${cfg.fileLabel}-${bill.billNo}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error saving image:', error);
      alert('Failed to save image.');
    }
  };

  /* ───────── Preview screen ───────── */
  if (showPreviewScreen) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', zIndex: -1 }}>
          <BillPreview data={bill} variant={variant} id="invoice-capture-area" />
        </div>
        <div className="bg-white px-4 py-3 shadow-sm border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-lg font-semibold">{cfg.title} Preview</h2>
          <div className="flex gap-2">
            <button onClick={handleDownloadImage} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md font-medium text-sm shadow-sm">
              Save Image
            </button>
            <button onClick={() => setShowPreviewScreen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md font-medium text-sm">
              Close
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 flex justify-center items-start">
          <div className="shadow-2xl bg-white" style={{ zoom: previewScale }}>
            <BillPreview data={bill} variant={variant} id="invoice-preview-screen" />
          </div>
        </div>
      </div>
    );
  }

  /* ───────── Form ───────── */
  return (
    <div>
      {/* Hidden print instance */}
      <BillPreview data={bill} variant={variant} />

      <div className="min-h-screen bg-gray-50 pb-12 no-print">
        <nav className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-2xl font-bold tracking-tight text-gray-900">
            KS AGRO <span className="text-accent font-medium text-lg">{cfg.title}</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setShowProductManager(true)} className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 font-medium text-sm">
              Manage Products
            </button>
            <button onClick={() => setShowConfirmNew(true)} className="px-4 py-2 border border-gray-300 text-red-600 bg-white rounded-md hover:bg-red-50 font-medium text-sm">
              New {variant === 'sale' ? 'Bill' : 'Challan'}
            </button>
            <button onClick={handleShow} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md font-medium text-sm shadow-sm">
              Show &amp; Save Image
            </button>
            <button onClick={handlePrint} className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 font-medium text-sm">
              Print
            </button>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">

            {/* 1 — Details */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded bg-blue-100 text-accent flex items-center justify-center text-sm">1</span>
                {cfg.title} Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                  <label className={labelCls}>Bill No.</label>
                  <input type="text" value={bill.billNo} onChange={(e) => setField('billNo', e.target.value)} className={`${inputCls} font-medium`} />
                </div>
                <div>
                  <label className={labelCls}>Date</label>
                  <input type="date" value={bill.date} onChange={(e) => setField('date', e.target.value)} className={inputCls} />
                </div>
                <div className="lg:col-span-2">
                  <label className={labelCls}>Dealer Name</label>
                  <DealerInput
                    value={bill.dealerName}
                    dealers={dealers}
                    onChange={(v) => setField('dealerName', v)}
                    onPick={pickDealer}
                    onRemove={(d) => setDealers(deleteDealer(d.name))}
                  />
                </div>
                <div>
                  <label className={labelCls}>Account ID</label>
                  <input type="text" inputMode="numeric" value={bill.accountId} onChange={(e) => setField('accountId', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>D.C. No</label>
                  <input type="text" inputMode="numeric" value={bill.dcNo} onChange={(e) => setField('dcNo', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Veh #</label>
                  <input type="text" value="DIRECT S" readOnly className={`${inputCls} bg-gray-100 text-gray-500`} />
                </div>
                <div>
                  <label className={labelCls}>Remarks</label>
                  <input type="text" value={bill.remarks} onChange={(e) => setField('remarks', e.target.value)} placeholder="Optional" className={inputCls} />
                </div>
              </div>
            </div>

            {/* 2 — Products */}
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded bg-blue-100 text-accent flex items-center justify-center text-sm">2</span>
                Products
              </h2>

              <datalist id={`products-${variant}`}>
                {products.map((p) => <option key={p.id} value={p.name} />)}
              </datalist>

              <div className="space-y-3">
                {bill.items.map((item, index) => {
                  const net = calcNetRate(item.grossRate, item.invDisc, item.furDisc);
                  const amount = calcBillAmount(item);
                  const numInput = (field, ph = '') => (
                    <input
                      type="number" inputMode="decimal" min="0" step="any"
                      value={item[field]} placeholder={ph}
                      onChange={(e) => setItem(index, { [field]: e.target.value })}
                      className={inputCls}
                    />
                  );
                  return (
                    <div key={item.id} className="border border-gray-200 bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-gray-500 tracking-wide">ITEM {index + 1}</span>
                        <button
                          onClick={() => removeItem(index)}
                          disabled={bill.items.length === 1}
                          className="text-gray-400 hover:text-red-500 disabled:opacity-30 px-2 text-xl leading-none"
                          title="Remove item"
                        >
                          ×
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-12 gap-3">
                        <div className={`col-span-2 ${showPrices ? 'md:col-span-5' : 'md:col-span-6'}`}>
                          <label className={smallLabelCls}>Product Name</label>
                          <input
                            type="text" list={`products-${variant}`} value={item.productName}
                            onChange={(e) => changeProduct(index, e.target.value)}
                            placeholder="Type or pick a product" autoComplete="off"
                            className={`${inputCls} uppercase`}
                          />
                        </div>
                        <div className={showPrices ? 'md:col-span-3' : 'md:col-span-3'}>
                          <label className={smallLabelCls}>Batch No</label>
                          <input type="text" value={item.batch} placeholder="0" onChange={(e) => setItem(index, { batch: e.target.value })} className={inputCls} />
                        </div>
                        <div className={showPrices ? 'md:col-span-4' : 'md:col-span-3'}>
                          <label className={smallLabelCls}>Qty</label>
                          {numInput('qty')}
                        </div>
                        {showPrices && (
                          <>
                            <div className="md:col-span-3">
                              <label className={smallLabelCls}>Gross Rate</label>
                              {numInput('grossRate')}
                            </div>
                            <div className="md:col-span-2">
                              <label className={smallLabelCls}>Inv Disc %</label>
                              {numInput('invDisc', '0')}
                            </div>
                            <div className="md:col-span-2">
                              <label className={smallLabelCls}>Fur Disc %</label>
                              {numInput('furDisc', '0')}
                            </div>
                            <div className="md:col-span-2">
                              <label className={smallLabelCls}>Net Rate</label>
                              <div className="px-3 py-2.5 text-sm rounded-md bg-gray-100 text-gray-700 font-medium">{formatMoney(net)}</div>
                            </div>
                            <div className="md:col-span-3">
                              <label className={smallLabelCls}>Amount</label>
                              <div className="px-3 py-2.5 text-sm rounded-md bg-blue-50 text-blue-900 font-bold">{formatMoney(amount)}</div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-wrap justify-between items-start gap-4 border-t border-gray-200 pt-4">
                <button onClick={addItem} className="text-accent font-medium hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-md text-sm">
                  + Add Product
                </button>

                <div className="flex flex-col gap-2 w-full sm:w-auto sm:min-w-[300px]">
                  <div className="flex justify-between gap-6 bg-gray-50 px-4 py-2 rounded-md border border-gray-200 text-sm">
                    <span className="text-gray-500 font-medium">Total Qty</span>
                    <span className="font-bold">{formatMoney(totalQty)}</span>
                  </div>
                  {showPrices && (
                    <>
                      <div className="flex justify-between gap-6 bg-gray-50 px-4 py-2 rounded-md border border-gray-200 text-sm">
                        <span className="text-gray-500 font-medium">Net Total</span>
                        <span className="font-bold">{formatMoney(subTotal)}</span>
                      </div>
                      <div className="flex justify-between items-center gap-6 px-4 py-1 rounded-md border border-gray-200 text-sm">
                        <span className="text-gray-500 font-medium">Previous Balance</span>
                        <input
                          type="number" inputMode="decimal" step="any" placeholder="0"
                          value={bill.previousBalance}
                          onChange={(e) => setField('previousBalance', e.target.value)}
                          className="w-32 text-right px-2 py-1.5 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex justify-between gap-6 bg-blue-50 px-4 py-2.5 rounded-md border border-blue-200">
                        <span className="text-blue-800 font-bold">Total Balance</span>
                        <span className="text-lg font-bold text-blue-900">{formatMoney(totalBalance)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {showProductManager && (
          <ProductManager products={products} setProducts={setProducts} onClose={() => setShowProductManager(false)} />
        )}
      </div>

      <ConfirmModal
        isOpen={showConfirmNew}
        title={`Start New ${cfg.title}`}
        message="This will clear the current form and give a new Bill No. The dealer will stay saved for next time."
        confirmText="Yes, Start New"
        isDestructive={true}
        onConfirm={executeNew}
        onCancel={() => setShowConfirmNew(false)}
      />
    </div>
  );
}
