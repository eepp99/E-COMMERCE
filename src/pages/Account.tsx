import { useState, useEffect } from 'react';
import { useStore, formatPrice } from '../store';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchUserOrders } from '../firebase';
import { LogIn, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Account() {
  const { user, login, logout, currency, authInitialized } = useStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setOrdersLoading(true);
      fetchUserOrders()
      .then(fetchedOrders => {
         if (fetchedOrders) {
           // Sort by date descending assuming createdAt is Firestore timestamp
           const sorted = (fetchedOrders as any[]).sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
           setOrders(sorted);
         }
      })
      .catch(err => console.error(err))
      .finally(() => setOrdersLoading(false));
    }
  }, [user]);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    
    try {
      await login();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (!authInitialized) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 mt-12 bg-white">
        <div className="w-full max-w-sm border border-black p-8 text-center">
          <h2 className="text-3xl font-serif italic text-black mb-6">
            Welcome Back
          </h2>
          
          {error && (
            <div className="mb-4 text-[10px] font-bold text-red-600 uppercase tracking-widest">
              {error}
            </div>
          )}
          
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex justify-center items-center gap-4 bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black border border-black transition-colors disabled:opacity-50"
          >
            {loading ? <LoadingSpinner /> : (
              <>
                 <LogIn className="w-4 h-4" />
                 Continue with Google
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 md:py-24">
      <div className="flex justify-between items-end border-b border-black pb-8 mb-12">
        <div>
          <h1 className="text-4xl lg:text-5xl font-serif italic tracking-tighter text-black">
            My Account
          </h1>
          <p className="text-[10px] uppercase font-bold tracking-[0.2em] mt-4 opacity-50">
            {user.email}
          </p>
        </div>
        <div className="flex gap-4 sm:gap-8 items-center">
          <Link
            to="/shop"
            className="text-[10px] font-bold uppercase tracking-[0.2em] border-b border-black pb-1 hover:text-black/50 transition-colors"
          >
            Shop
          </Link>
          <button
            onClick={logout}
            className="text-[10px] font-bold uppercase tracking-[0.2em] border-b border-black pb-1 hover:text-black/50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-sm font-sans uppercase font-bold tracking-widest mb-6">Order History</h2>
          
          {ordersLoading ? (
            <div className="py-12 flex justify-center border border-dashed border-black">
              <LoadingSpinner />
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center border border-dashed border-black">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-6">No previous orders found</span>
              <Link to="/shop" className="text-[10px] font-bold uppercase tracking-widest text-black flex items-center space-x-2 border border-black px-6 py-3 hover:bg-black hover:text-white transition-colors">
                <Store className="w-4 h-4" />
                <span>Explore Store</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order: any) => (
                <div key={order.id} className="border border-black p-6">
                  <div className="flex flex-col sm:flex-row justify-between border-b border-black/20 pb-4 mb-4 gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest break-all">Ref: {order.reference}</span>
                    <span className="text-sm font-serif italic">{new Date(order.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <div className="space-y-2 mb-4">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span>{formatPrice(item.price * item.quantity, currency)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest pt-4 border-t border-black/20">
                    <span>Total</span>
                    <span>{formatPrice(order.amount, currency)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
