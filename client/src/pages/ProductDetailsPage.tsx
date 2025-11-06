import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Heart, 
  Share2,
  Package,
  Truck,
  Shield
} from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

interface Product {
  _id: string;
  name: string;
  SKU: string;
  category: string;
  description: string;
  basePrice: {
    amount: number;
    currency: string;
  };
  images: string[];
  status: string;
  specifications?: {
    dimensions?: { length: number; width: number; thickness: number; unit: string };
    material?: string;
    finish?: string;
    color?: string;
    weight?: { value: number; unit: string };
  };
  features?: string[];
}

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/products/${id}`);
      setProduct(response.data.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestQuote = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/products/' + id);
      return;
    }
    navigate(`/quotes/new?product=${id}&quantity=${quantity}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <button onClick={() => navigate('/products')} className="btn-primary">
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        <nav className="text-sm text-gray-600 mb-8">
          <a href="/" className="hover:text-sky-600">Home</a>
          <span className="mx-2">/</span>
          <a href="/products" className="hover:text-sky-600">Products</a>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-soft mb-4">
              <img
                src={product.images[selectedImage] || 'https://via.placeholder.com/600'}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`bg-white rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index ? 'border-sky-500' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-20 object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="inline-block px-3 py-1 bg-sky-100 text-sky-700 text-sm font-medium rounded-full mb-4">
              {product.category}
            </span>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <p className="text-lg text-gray-600 mb-6">{product.description}</p>

            <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-6 mb-6">
              <div className="flex items-baseline space-x-2 mb-2">
                <span className="text-4xl font-bold text-gray-900">
                  ${product.basePrice.amount.toFixed(2)}
                </span>
                <span className="text-gray-600">
                  /{product.specifications?.dimensions?.unit || 'unit'}
                </span>
              </div>
              <p className="text-sm text-gray-600">*Exclusive B2B pricing available</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-soft mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center space-x-4 mb-6">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center border border-gray-300 rounded-lg py-2"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
                >
                  +
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleRequestQuote}
                  className="w-full btn-primary btn-lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Request Quote
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button className="btn-secondary">
                    <Heart className="w-5 h-5 mr-2" />
                    Save
                  </button>
                  <button className="btn-secondary">
                    <Share2 className="w-5 h-5 mr-2" />
                    Share
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow-soft">
                <Package className="w-6 h-6 mx-auto mb-2 text-sky-600" />
                <p className="text-xs text-gray-600">Bulk Orders</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-soft">
                <Truck className="w-6 h-6 mx-auto mb-2 text-sky-600" />
                <p className="text-xs text-gray-600">Fast Shipping</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-soft">
                <Shield className="w-6 h-6 mx-auto mb-2 text-sky-600" />
                <p className="text-xs text-gray-600">Quality Guaranteed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
