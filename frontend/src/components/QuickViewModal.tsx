import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import FavoriteButton from './FavoriteButton';

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const [mainIndex, setMainIndex] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setMainIndex((i) => Math.min(i + 1, (product.images || []).length - 1));
      if (e.key === 'ArrowLeft') setMainIndex((i) => Math.max(i - 1, 0));
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, product.images]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [onClose]);

  const images = product.images && product.images.length ? product.images : [''];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
      <div ref={ref} className="bg-white rounded-md w-[900px] max-w-[95%] max-h-[90vh] overflow-auto p-4 shadow-lg transform transition-all scale-100">
        <div className="flex gap-4">
          <div className="w-1/2">
            <div className="w-full h-[420px] bg-gray-100 rounded overflow-hidden flex items-center justify-center">
              <img src={images[mainIndex]} alt={product.title} className="w-full h-full object-contain" />
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setMainIndex(i)}
                  className={`w-16 h-16 rounded overflow-hidden border ${i === mainIndex ? 'border-black' : 'border-transparent'}`}
                >
                  <img src={src} alt={`${product.title}-${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="w-1/2 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">{product.title}</h2>
                  <div className="text-sm text-gray-600">{product.brand} · {product.category}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">${product.price}</div>
                  <div className="text-xs text-gray-500">{new Date(product.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              <p className="mt-3 text-sm text-gray-700 line-clamp-4">{product.description}</p>
              <div className="mt-3 flex items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">👁 <span>{product.views || 0}</span></div>
                <div className="flex items-center gap-2">🏷️ <span>{(product.badges || []).join(', ') || '—'}</span></div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FavoriteButton productId={product._id} size="md" />
                <button onClick={() => onClose()} className="px-3 py-2 rounded border hover:bg-gray-100">Close</button>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/products/${product._id}`} onClick={onClose} className="px-4 py-2 bg-black text-white rounded">View full product</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
