import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client';
import { Product } from '../types';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await client.get<Product>(`/products/${id}`);
        setProduct(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center text-red-600">{error || 'Product not found'}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          <div>
            {product.images && product.images.length > 0 ? (
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
            <p className="text-xl text-gray-600 mb-4">{product.brand}</p>
            <p className="text-4xl font-bold mb-6">${product.price}</p>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{product.description}</p>
            </div>
            <div className="mb-6">
              <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                {product.category}
              </span>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600">
                Seller: <span className="font-medium">{product.seller.name}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

