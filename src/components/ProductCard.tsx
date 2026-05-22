import { Product } from '../types';
import { useStore, formatPrice } from '../store';
import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
  key?: string | number;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useStore((state) => state.addToCart);
  const currency = useStore((state) => state.currency);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      to={`/product/${product.id}`}
      className="group relative flex flex-col bg-white border border-black cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 border-b border-black flex items-center justify-center">
        {product.stock <= 0 && (
          <div className="absolute top-4 left-4 z-10 bg-white border border-black px-3 py-1 text-[8px] font-bold uppercase tracking-widest text-red-600">Out of Stock</div>
        )}
        {product.stock > 0 && product.stock < 3 && (
          <div className="absolute top-4 left-4 z-10 bg-white border border-black px-3 py-1 text-[8px] font-bold uppercase tracking-widest text-red-600">Low Stock</div>
        )}
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-center opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700 grayscale mix-blend-multiply group-hover:grayscale-0"
        />
        {isHovered && (
          <div className="absolute inset-0 bg-black/10 flex items-end p-6">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
              className="flex w-full items-center justify-center space-x-2 bg-black py-4 text-[10px] uppercase font-bold tracking-[0.2em] text-white hover:bg-white hover:text-black hover:border-black border border-transparent transition-colors"
            >
              <ShoppingCart className="h-4 w-4 hidden sm:block" />
              <span>Add to Cart</span>
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-1 sm:gap-0">
        <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest line-clamp-2 sm:line-clamp-1">{product.name}</span>
        <span className="font-serif italic text-sm sm:text-lg">{formatPrice(product.price, currency)}</span>
      </div>
    </Link>
  );
}
