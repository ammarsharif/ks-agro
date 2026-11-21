const DEFAULT_PRODUCTS = [
  { id: 1, name: "LAMBDA 100ML", defaultRate: 1680 },
  { id: 2, name: "PRESTIGE 15ML", defaultRate: 1500 },
  { id: 3, name: "BLACK DIAMOND", defaultRate: 44000 },
  { id: 4, name: "PERESSO 8 KG", defaultRate: 1280 },
  { id: 5, name: "BOP 50 KG", defaultRate: 4800 }
];

export const getProducts = () => {
  const stored = localStorage.getItem("ks_products");
  if (stored) {
    return JSON.parse(stored);
  }
  // Seed defaults if not present
  localStorage.setItem("ks_products", JSON.stringify(DEFAULT_PRODUCTS));
  return DEFAULT_PRODUCTS;
};

export const saveProducts = (products) => {
  localStorage.setItem("ks_products", JSON.stringify(products));
};

export const addProduct = (product) => {
  const products = getProducts();
  const newProduct = { ...product, id: Date.now() };
  products.push(newProduct);
  saveProducts(products);
  return products;
};

export const updateProduct = (updatedProduct) => {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === updatedProduct.id);
  if (index !== -1) {
    products[index] = updatedProduct;
    saveProducts(products);
  }
  return products;
};

export const deleteProduct = (id) => {
  let products = getProducts();
  products = products.filter((p) => p.id !== id);
  saveProducts(products);
  return products;
};

export const getNextBillNo = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

export const incrementBillNo = () => {
  return getNextBillNo();
};

export const saveDraft = (invoiceData) => {
  localStorage.setItem("ks_draft_invoice", JSON.stringify(invoiceData));
};

export const getDraft = () => {
  const draft = localStorage.getItem("ks_draft_invoice");
  if (draft) {
    return JSON.parse(draft);
  }
  return null;
};

export const clearDraft = () => {
  localStorage.removeItem("ks_draft_invoice");
};

/* ───────── Dealers (used by Sale Bill / Delivery Challan) ───────── */

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const normName = (s) => String(s || '').trim().toUpperCase();

export const getDealers = () => readJSON("ks_dealers", []);

// Saves the dealer (or updates its Account ID / D.C. No if the name already exists)
export const upsertDealer = ({ name, accountId, dcNo }) => {
  const key = normName(name);
  const dealers = getDealers();
  if (!key) return dealers;
  const entry = { name: key, accountId: String(accountId || '').trim(), dcNo: String(dcNo || '').trim() };
  const idx = dealers.findIndex((d) => normName(d.name) === key);
  if (idx !== -1) dealers[idx] = { ...dealers[idx], ...entry };
  else dealers.push({ id: Date.now(), ...entry });
  localStorage.setItem("ks_dealers", JSON.stringify(dealers));
  return dealers;
};

export const deleteDealer = (name) => {
  const dealers = getDealers().filter((d) => normName(d.name) !== normName(name));
  localStorage.setItem("ks_dealers", JSON.stringify(dealers));
  return dealers;
};

/* ───────── Per-document drafts (variant = 'sale' | 'challan') ───────── */

export const getBillDraft = (variant) => readJSON(`ks_draft_${variant}`, null);
export const saveBillDraft = (variant, data) =>
  localStorage.setItem(`ks_draft_${variant}`, JSON.stringify(data));
export const clearBillDraft = (variant) => localStorage.removeItem(`ks_draft_${variant}`);

export const getActiveTab = () => localStorage.getItem("ks_active_tab");
export const saveActiveTab = (tab) => localStorage.setItem("ks_active_tab", tab);
