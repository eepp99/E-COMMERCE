import { useEffect, useState } from 'react';
import { useStore } from '../store';
import ProductCard from '../components/ProductCard';
import { Search } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import NewsletterModal from '../components/NewsletterModal';

export default function StoreFront() {
  const { products, setProducts } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(products.length === 0);

  useEffect(() => {
    if (products.length > 0) {
      setLoading(false);
      return;
    }
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [setProducts, products.length]);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white pb-24 flex-1">
      <div className="py-16 px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between md:items-end mb-16 border-b border-black pb-8 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif italic tracking-tighter text-black">
              Essentials
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] mt-2 opacity-50 font-bold">
              Online store for buying and selling of goods
            </p>
          </div>
          <div className="relative w-full md:w-auto md:min-w-[300px]">
             <input
                type="text"
                placeholder="SEARCH CATALOG..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-black bg-transparent px-4 py-3 pl-10 text-[10px] font-bold uppercase tracking-[0.2em] focus:bg-neutral-50 focus:outline-none transition-colors"
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4 xl:gap-8">
          {loading ? (
             <div className="col-span-full py-24 flex items-center justify-center">
               <LoadingSpinner />
             </div>
          ) : (
            <>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
              {filteredProducts.length === 0 && (
                 <div className="col-span-full py-12 text-center text-[10px] font-bold uppercase tracking-widest opacity-50 border border-dashed border-black">
                   No products found matching "{searchQuery}"
                 </div>
              )}
            </>
          )}
        </div>
      </div>
      <NewsletterModal />
    </div>
  );
}
