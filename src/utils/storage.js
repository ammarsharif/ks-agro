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
