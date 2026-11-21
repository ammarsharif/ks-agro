import React, { forwardRef } from 'react';
import {
  calcNetRate,
  calcBillAmount,
  formatMoney,
  formatBillDate,
  formatDcNo
} from '../utils/calculations';
import { numberToWords } from '../utils/numberToWords';

/*
 * One layout, two variants:
 *   sale    → S.No | Product | Batch | Qty | Gross | Inv% | Fur% | Net Rate | Amount (+ totals / balance)
 *   challan → S.No | Product | Batch | Qty (no prices)
 * To add another variant, add an entry to VARIANTS below.
 */
export const VARIANTS = {
  sale: {
    title: 'Sale Bill',
    prefix: 'S-',
    fileLabel: 'Sale-Bill',
    prices: true,
    columns: [
      { key: 'sno', label: 'S.No', w: 4.7, align: 'left' },
      { key: 'product', label: 'Product Name', w: 27.2, align: 'left' },
      { key: 'batch', label: 'Batch No', w: 13, align: 'center' },
      { key: 'qty', label: 'Qty', w: 8.2, align: 'right' },
      { key: 'gross', label: 'Gross Rat', w: 9.9, align: 'right' },
      { key: 'inv', label: ['Inv Disc', '%'], w: 8, align: 'center' },
      { key: 'fur', label: ['Fur Disc', '%'], w: 7.9, align: 'center' },
      { key: 'net', label: 'Net Rate', w: 8.8, align: 'right' },
      { key: 'amount', label: 'Amount', w: 12.3, align: 'right' }
    ]
  },
  challan: {
    title: 'Delivery Challan',
    prefix: 'D-',
    fileLabel: 'Delivery-Challan',
    prices: false,
    columns: [
      { key: 'sno', label: 'S.No', w: 6, align: 'left' },
      { key: 'product', label: 'Product Name', w: 54, align: 'left' },
      { key: 'batch', label: 'Batch No', w: 22, align: 'center' },
      { key: 'qty', label: 'Qty', w: 18, align: 'right' }
    ]
  }
};

export const isFilledRow = (i) => String(i.productName || '').trim() !== '' || String(i.qty ?? '') !== '';

const SERIF = '"Times New Roman", Times, serif';
const SANS = 'Arial, Helvetica, sans-serif';
const LINE = '1.5px solid #000';
const THIN = '1px solid #000';
const sumQty = (rows) => rows.reduce((s, i) => s + (parseFloat(i.qty) || 0), 0);

const BillPreview = forwardRef(({ data, variant = 'sale', id = 'invoice-print-area' }, ref) => {
  const cfg = VARIANTS[variant];
  const cols = cfg.columns;
  const { billNo, date, dealerName, accountId, dcNo, remarks, previousBalance, items } = data;

  const rows = items.filter(isFilledRow);
  const totalQty = sumQty(rows);
  const subTotal = rows.reduce((s, i) => s + calcBillAmount(i), 0);
  const prevBal = parseFloat(previousBalance) || 0;
  const totalBalance = subTotal + prevBal;

  const cell = (key, item, index) => {
    switch (key) {
      case 'sno': return index + 1;
      case 'product': return item.productName;
      case 'batch': return item.batch === '' || item.batch == null ? '0' : item.batch;
      case 'qty': return formatMoney(item.qty);
      case 'gross': return formatMoney(item.grossRate);
      case 'inv': return `${formatMoney(item.invDisc)}%`;
      case 'fur': return `${formatMoney(item.furDisc)}%`;
      case 'net': return formatMoney(calcNetRate(item.grossRate, item.invDisc, item.furDisc));
      case 'amount': return formatMoney(calcBillAmount(item));
      default: return '';
    }
  };

  // Vertical lines between columns (drawn once, run the full height of the table area)
  let acc = 0;
  const lineOffsets = cols.slice(0, -1).map((c) => (acc += c.w));

  const Cols = () => (
    <colgroup>{cols.map((c) => <col key={c.key} style={{ width: `${c.w}%` }} />)}</colgroup>
  );
  const tableStyle = { width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' };
  const tdBase = { padding: '3px 6px', fontSize: 11, fontFamily: SERIF, height: 22, lineHeight: 1.2, wordBreak: 'break-word' };

  // The amount column's share of the width (used by the totals boxes at the bottom)
  const lastW = cols[cols.length - 1].w;

  const infoRow = { display: 'flex', alignItems: 'center', fontFamily: SERIF, fontSize: 11.5, height: 24 };
  const label = { fontWeight: 700 };

  return (
    <div
      ref={ref}
      id={id}
      className="bill-sheet"
      style={{
        width: 794,
        minHeight: 1100,
        boxSizing: 'border-box',
        padding: '34px 30px 30px',
        background: '#fff',
        color: '#000',
        display: 'flex',
        flexDirection: 'column',
        margin: '0 auto'
      }}
    >
      {/* Heading */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 21, letterSpacing: 0.3 }}>
          KS AGRO CHEMICALS &amp; FERTILIZERS
        </div>
        <div style={{ fontFamily: SANS, fontSize: 11, marginTop: 4 }}>68/NP CHOWK SURAILI RAHIM YAR KHAN</div>
        <div style={{ fontFamily: SANS, fontSize: 11, marginTop: 14, letterSpacing: 1.2, color: '#222' }}>{cfg.title}</div>
      </div>

      {/* Info box */}
      <div style={{ width: '81.5%', border: LINE, marginTop: 14 }}>
        <div style={{ ...infoRow, borderBottom: THIN }}>
          <div style={{ width: '14%', textAlign: 'center', ...label }}>Bill No</div>
          <div style={{ width: '12%' }}>{billNo}</div>
          <div style={{ width: '10%', ...label }}>Date:</div>
          <div>{formatBillDate(date)}</div>
        </div>
        <div style={{ ...infoRow, borderBottom: THIN }}>
          <div style={{ width: '14%', textAlign: 'center', ...label }}>AccountID</div>
          <div style={{ width: '12%' }}>{accountId}</div>
          <div style={{ textTransform: 'uppercase' }}>{dealerName}</div>
        </div>
        <div style={infoRow}>
          <div style={{ width: '14%', textAlign: 'center', ...label }}>Veh #</div>
          <div style={{ width: '12%', fontSize: 10.5 }}>DIRECT S</div>
          <div style={{ width: '10%', ...label }}>D.C. No:</div>
          <div>{formatDcNo(dcNo)}</div>
        </div>
      </div>

      {/* Table area */}
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', border: LINE, marginTop: 12, minHeight: 640 }}>
        {lineOffsets.map((left, i) => (
          <div key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: `${left}%`, borderLeft: LINE }} />
        ))}

        <table style={{ ...tableStyle, borderBottom: LINE, position: 'relative' }}>
          <Cols />
          <thead>
            <tr>
              {cols.map((c) => (
                <th
                  key={c.key}
                  style={{ ...tdBase, fontWeight: 700, textAlign: 'center', fontSize: 11, lineHeight: 1.05, height: 30, padding: '3px 2px', verticalAlign: 'middle' }}
                >
                  {Array.isArray(c.label)
                    ? c.label.map((l, i) => <div key={i} style={i ? { fontSize: 10 } : null}>{l}</div>)
                    : c.label}
                </th>
              ))}
            </tr>
          </thead>
        </table>

        <div style={{ flex: 1, position: 'relative' }}>
          <table style={tableStyle}>
            <Cols />
            <tbody>
              {rows.map((item, index) => (
                <tr key={item.id ?? index}>
                  {cols.map((c) => (
                    <td key={c.key} style={{ ...tdBase, textAlign: c.align }}>{cell(c.key, item, index)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sub total row */}
        <table style={{ ...tableStyle, borderTop: LINE, position: 'relative' }}>
          <Cols />
          <tbody>
            <tr>
              {cols.map((c, ci) => {
                let content = '';
                if (c.key === 'product') content = <span style={{ fontFamily: SANS, fontSize: 12, float: 'right', paddingRight: 8 }}>Sub Total:</span>;
                if (c.key === 'qty') content = formatMoney(totalQty);
                if (c.key === 'amount') content = formatMoney(subTotal);
                if (ci === 0 && cols.length > 4) content = '';
                return <td key={c.key} style={{ ...tdBase, textAlign: c.align }}>{content}</td>;
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Remarks */}
      <div style={{ display: 'flex', border: LINE, borderTop: 'none', minHeight: 50 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontSize: 11.5, padding: '4px 10px', textAlign: 'center' }}>
          <span><b>Remarks : </b>{remarks}</span>
        </div>
        {cfg.prices && <div style={{ width: `${lastW}%`, borderLeft: LINE }} />}
      </div>

      {/* Totals (sale bill only) */}
      {cfg.prices && (
        <div style={{ display: 'flex', border: LINE, borderTop: 'none' }}>
          <div style={{ flex: 1, fontFamily: SERIF, fontSize: 9.5, padding: '4px 8px', textTransform: 'uppercase' }}>
            {numberToWords(subTotal)}
          </div>
          <div style={{ width: '31%', fontFamily: SERIF, fontSize: 11 }}>
            {[
              ['Net Total :', subTotal],
              ['Previous Balance :', prevBal],
              ['Total Balance :', totalBalance]
            ].map(([text, value], i) => (
              <div key={text} style={{ display: 'flex', height: 25, borderTop: i ? LINE : 'none', borderLeft: LINE }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{text}</div>
                <div style={{ width: `${(lastW / 31) * 100}%`, borderLeft: LINE, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 6px' }}>
                  {formatMoney(value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Signatures */}
      <div style={{ border: LINE, marginTop: 40, fontFamily: SANS }}>
        <div style={{ borderBottom: THIN, minHeight: 20 }} />
        <div style={{ display: 'flex', borderBottom: THIN, fontStyle: 'italic', fontWeight: 700, fontSize: 11 }}>
          <div style={{ width: '31%', textAlign: 'center', padding: '3px 0', borderRight: LINE }}>Prepared by</div>
          <div style={{ width: '40.7%', textAlign: 'center', padding: '3px 0', borderRight: LINE }}>Approved by</div>
          <div style={{ flex: 1, textAlign: 'center', padding: '3px 0' }}>Received by</div>
        </div>
        <div style={{ display: 'flex', height: 70 }}>
          <div style={{ width: '31%', borderRight: LINE }} />
          <div style={{ width: '40.7%', borderRight: LINE }} />
          <div style={{ flex: 1 }} />
        </div>
      </div>
    </div>
  );
});

export default BillPreview;
