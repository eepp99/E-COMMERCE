import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Store, ShoppingCart, User } from 'lucide-react';
import { useStore } from '../store';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const cart = useStore((state) => state.cart);
  const location = useLocation();

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-black">
      <div className="w-full px-6 md:px-12">
        <div className="flex justify-between items-center h-12 md:h-14">
          <div className="flex items-center">
            <Link to="/" className="text-xl md:text-2xl font-serif italic tracking-tight font-black text-black">
              Online Store.
            </Link>
          </div>
          
          <div className="flex items-center" ref={menuRef}>
            <div className="relative">
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:opacity-50 transition-opacity z-50 text-black flex items-center justify-center relative cursor-pointer"
                aria-label="Menu"
              >
                {isOpen ? <X className="w-6 h-6 md:w-7 md:h-7" /> : <Menu className="w-6 h-6 md:w-7 md:h-7" />}
                {cartItemsCount > 0 && !isOpen && (
                  <span className="absolute top-1 right-1 md:top-0 md:right-0 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-black text-[9px] md:text-[10px] font-bold text-white tracking-normal font-sans not-italic border border-white">
                    {cartItemsCount}
                  </span>
                )}
              </button>
              
              {isOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-black flex flex-col w-40">
                  <Link 
                    to="/shop" 
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center px-4 py-3 border-b border-black transition-colors ${location.pathname === '/shop' ? 'bg-black text-white' : 'hover:bg-neutral-100 text-black'}`}
                    title="Shop"
                  >
                    <Store className="w-5 h-5 mr-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest font-sans">Shop</span>
                  </Link>
                  <Link 
                    to="/cart" 
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center px-4 py-3 border-b border-black transition-colors relative ${location.pathname === '/cart' ? 'bg-black text-white' : 'hover:bg-neutral-100 text-black'}`}
                    title="Cart"
                  >
                    <ShoppingCart className="w-5 h-5 mr-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest font-sans">Cart</span>
                    {cartItemsCount > 0 && (
                      <span className={`ml-auto flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold tracking-normal font-sans not-italic border ${location.pathname === '/cart' ? 'bg-white text-black border-white' : 'bg-black text-white border-white'}`}>
                        {cartItemsCount}
                      </span>
                    )}
                  </Link>
                  <Link 
                    to="/account" 
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center px-4 py-3 transition-colors ${location.pathname === '/account' ? 'bg-black text-white' : 'hover:bg-neutral-100 text-black'}`}
                    title="Account"
                  >
                    <User className="w-5 h-5 mr-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest font-sans">Account</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
