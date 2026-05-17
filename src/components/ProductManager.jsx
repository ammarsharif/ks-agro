import React, { useState } from 'react';
import { addProduct, updateProduct, deleteProduct } from '../utils/storage';
import ConfirmModal from './ConfirmModal';

export default function ProductManager({ products, setProducts, onClose }) {
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [defaultRate, setDefaultRate] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    
    let updatedProducts;
    if (editingId) {
      updatedProducts = updateProduct({ id: editingId, name, defaultRate: parseFloat(defaultRate) || 0 });
    } else {
      updatedProducts = addProduct({ name, defaultRate: parseFloat(defaultRate) || 0 });
    }
    
    setProducts(updatedProducts);
    resetForm();
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setName(p.name);
    setDefaultRate(p.defaultRate);
  };

  const [deleteId, setDeleteId] = useState(null);

  const confirmDelete = (id) => {
    setDeleteId(id);
  };

  const executeDelete = () => {
    if (deleteId) {
      const updatedProducts = deleteProduct(deleteId);
      setProducts(updatedProducts);
      setDeleteId(null);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDefaultRate('');
  };

  const [showForm, setShowForm] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Manage Products</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{products.length} products saved</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                setShowForm(!showForm);
                if(showForm) resetForm();
              }}
              className="text-sm bg-blue-50 text-accent px-3 py-1.5 rounded-md hover:bg-blue-100 font-medium transition-colors"
            >
              {showForm || editingId ? 'Cancel' : 'Add New Product'}
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
        
        {(showForm || editingId) && (
          <div className="p-4 bg-gray-50 border-b flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter product name"
            />
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Rate</label>
            <input 
              type="number" 
              value={defaultRate} 
              onChange={e => setDefaultRate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Rate"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                handleSave();
                setShowForm(false);
              }}
              className="bg-accent text-white px-5 py-2 rounded hover:bg-blue-600 transition-colors font-medium shadow-sm"
            >
              {editingId ? 'Update' : 'Save'}
            </button>
            {editingId && (
              <button 
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
        )}

        <div className="p-4 overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="py-2 font-medium text-gray-600">Product Name</th>
                <th className="py-2 font-medium text-gray-600 w-32">Default Rate</th>
                <th className="py-2 font-medium text-gray-600 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{p.name}</td>
                  <td className="py-2">{p.defaultRate}</td>
                  <td className="py-2 text-right">
                    <button onClick={() => { handleEdit(p); setShowForm(true); }} className="text-gray-500 hover:text-accent mr-3 p-1 rounded hover:bg-blue-50 transition-colors inline-block" title="Edit">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    </button>
                    <button onClick={() => confirmDelete(p.id)} className="text-gray-500 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors inline-block" title="Delete">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="3" className="py-4 text-center text-gray-500">No products found. Add one above.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <ConfirmModal 
        isOpen={!!deleteId}
        title="Delete Product"
        message="Are you sure you want to delete this product? It will still show as plain text in existing invoices."
        confirmText="Delete"
        isDestructive={true}
        onConfirm={executeDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
