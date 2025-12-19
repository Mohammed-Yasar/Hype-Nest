import React, { useState } from 'react';
import { Product } from '../types';
import client from '../api/client';

const InlineCard: React.FC<{ product: Product; onEdit: (p: Product) => void; onDelete: (id: string) => void }> = ({ product, onEdit, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(product.title);
  const [price, setPrice] = useState(product.price.toString());
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await client.patch(`/products/${product._id}`, { title, price });
      setEditing(false);
    } catch (err) {
      alert('Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className={`flex gap-4 p-4 items-start ${editing ? 'flex-col' : ''}`}>
        <div className={`${editing ? 'w-full h-48' : 'w-32 h-32'} bg-gray-100 rounded overflow-hidden flex items-center justify-center flex-shrink-0`}>
          {product.images?.[0] ? <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover"/> : <span className="text-gray-400">No Image</span>}
        </div>
        <div className={editing ? 'w-full' : 'flex-1 min-w-0'}>
          <div className={editing ? 'space-y-4' : ''}>
            {editing ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Title</label>
                  <input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Price</label>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">$</span>
                    <input 
                      value={price} 
                      onChange={(e) => setPrice(e.target.value)} 
                      type="number"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black" 
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="font-semibold text-base line-clamp-2">{product.title}</div>
                <div className="text-sm text-gray-600">{product.brand} · {product.category}</div>
              </>
            )}
          </div>
        </div>
        <div className={editing ? 'w-full' : 'text-right flex-shrink-0'}>
          {editing ? (
            <div className="flex flex-col gap-3">
              <div className="text-lg font-bold text-gray-900">Price Preview: ${price}</div>
              <div className="flex gap-3">
                <button 
                  onClick={save} 
                  disabled={loading} 
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-semibold text-sm hover:bg-gray-900 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button 
                  onClick={() => setEditing(false)} 
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-900 rounded-lg font-semibold text-sm hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Price</div>
                <div className="text-2xl font-bold text-gray-900">${product.price}</div>
              </div>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => { setPrice(product.price.toString()); setTitle(product.title); setEditing(true); }} 
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700"
                >
                  Edit
                </button>
                <button 
                  onClick={() => onDelete(product._id)} 
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InlineCard;
