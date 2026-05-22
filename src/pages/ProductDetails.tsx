import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product } from '../types';
import { useStore, formatPrice } from '../store';
import { ArrowLeft, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [shippingOpen, setShippingOpen] = useState(false);
  const addToCart = useStore((state) => state.addToCart);
  const currency = useStore((state) => state.currency);
  const storeProducts = useStore((state) => state.products);

  useEffect(() => {
    const cached = storeProducts.find(p => p.id === id);
    if (cached) {
      setProduct(cached);
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, storeProducts]);

  if (loading) {
    return (
      <div className="bg-white flex-1 flex items-center justify-center border-t border-black p-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-white flex-1 flex flex-col items-center justify-center border-t border-black p-12">
        <h1 className="text-4xl font-serif italic mb-4">Product Not Found</h1>
        <Link to="/shop" className="text-[10px] font-bold uppercase tracking-[0.2em] border border-black px-6 py-3 hover:bg-black hover:text-white transition-colors">
          Go back to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white flex-1 flex flex-col lg:flex-row border-t border-black relative">
      <div className="relative w-full lg:w-1/2 min-h-[50vh] lg:min-h-0 border-b lg:border-b-0 lg:border-r border-black bg-neutral-50 flex items-center justify-center p-12">
        <Link to="/shop" className="absolute top-6 left-6 z-10 flex items-center space-x-2 text-[10px] uppercase font-bold tracking-[0.2em] hover:opacity-50 transition-opacity bg-white border border-black px-4 py-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full max-h-[70vh] lg:max-h-[90vh] object-contain grayscale mix-blend-multiply hover:grayscale-0 transition-all duration-700 p-4 md:p-8" 
        />
      </div>

      <div className="w-full lg:w-1/2 flex flex-col pt-12">
        <div className="flex-1 px-6 md:px-12">
          <div className="mb-4">
            <h1 className="text-4xl md:text-6xl font-serif italic tracking-tighter text-black mb-2 leading-none">
              {product.name}
            </h1>
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Item #{product.id}</div>
          </div>
          
          <div className="text-3xl font-serif mb-8">
            {formatPrice(product.price, currency)}
          </div>

          <div className="prose prose-sm font-sans text-base leading-relaxed mb-12 max-w-none text-black/80">
            {product.description ? (
              <p>{product.description}</p>
            ) : (
              <p className="italic opacity-50">No description available for this item.</p>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4 text-[10px] font-bold uppercase tracking-[0.2em]">
               <span className="opacity-50">Stock Level</span>
               <span className="border-b border-black">{product.stock} Units Available</span>
               {product.stock > 0 && product.stock < 3 && <span className="text-red-600">Low Stock</span>}
            </div>
            {product.stock <= 0 && <div className="text-red-600 text-xs font-bold uppercase mt-2">Out of Stock</div>}
            
            {product.stock > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-6 mt-6 border-t border-black/10">
                <div className="flex items-center space-x-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">Quantity</span>
                  <div className="flex items-center border border-black">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 hover:bg-neutral-100 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 text-xs font-mono border-x border-black min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button 
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-4 py-2 hover:bg-neutral-100 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => {
                     addToCart(product, quantity);
                     setQuantity(1); // Reset after adding
                  }}
                  disabled={product.stock <= 0}
                  className="flex-1 w-full sm:w-auto flex items-center justify-center space-x-4 border border-black bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <span>Add - {formatPrice(product.price * quantity, currency)}</span>
                  <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            )}
            
            <div className="mt-12 mb-12 border-t border-black">
              <button 
                onClick={() => setShippingOpen(!shippingOpen)}
                className="w-full flex items-center justify-between py-6 group"
              >
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">Shipping & Returns</h3>
                <span className="opacity-50 group-hover:opacity-100 transition-opacity flex items-center justify-center w-6 h-6 border border-black rounded-full text-black">
                  {shippingOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </span>
              </button>
              {shippingOpen && (
                <div className="pb-8">
                  <ul className="text-sm font-sans space-y-3 text-black/70">
                    <li className="flex items-center space-x-2">
                       <span className="w-1 h-1 bg-black rounded-full" />
                       <span>Complementary shipping worldwide.</span>
                    </li>
                    <li className="flex items-center space-x-2">
                       <span className="w-1 h-1 bg-black rounded-full" />
                       <span>Returns accepted within 14 days of delivery.</span>
                    </li>
                    <li className="flex items-center space-x-2">
                       <span className="w-1 h-1 bg-black rounded-full" />
                       <span>Signature packaging included with all orders.</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
