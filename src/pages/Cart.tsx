import { useState, useEffect } from 'react';
import { useStore, formatPrice } from '../store';
import { Trash2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { usePaystackPayment } from 'react-paystack';

export default function Cart() {
  const { cart, removeFromCart, cartTotal, clearCart, currency } = useStore();
  const [email, setEmail] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => setPublicKey(data.paystackPublicKey))
      .catch(err => console.error(err));
  }, []);

  const totalNgn = cartTotal();
  const displayTotal = formatPrice(totalNgn, currency);

  // Paystack expects NGN equivalent amount in kobo, or potentially you can pass the currency code
  // Let's pass the amount in kobo (NGN).
  // Some gateways support processing in the multi-currency. 
  // But we always fallback to NGN for simplicity if paystack is NGN-based account.
  // Actually Paystack supports GHS, ZAR, KES, USD processing if configured.
  // We'll pass the correct amount in sub-units.
  // Paystack generally accepts `currency` code if you want to charge in it.
  const amount = Math.round(totalNgn * currency.rate * 100); 

  const config = {
    reference: (new Date()).getTime().toString(),
    email: email || 'customer@example.com', // fallback
    amount,
    currency: currency.code,
    publicKey,
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = async (reference: any) => {
    setIsProcessing(true);
    try {
      const resp = await fetch('/api/paystack/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: reference.reference,
          items: cart,
          email: email || 'customer@example.com',
          amount: totalNgn
        })
      });
      const data = await resp.json();
      if (data.success) {
        // Create order in Firestore
        if (useStore.getState().user) {
          try {
            const { createOrder } = await import('../firebase');
            await createOrder(totalNgn, currency.code, cart, email || 'customer@example.com', reference.reference);
          } catch(err) {
            console.error("Failed to save order to Firebase", err);
          }
        }
        
        clearCart();
        alert('Payment successful! Your order has been placed.');
        navigate('/shop');
      } else {
        setErrorMsg('Payment verification failed. Please contact support.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('An error occurred while verifying your payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  const onClose = () => {
    console.log('Payment modal closed');
  };

  const handleCheckout = () => {
    if (!cart.length) return;
    if (!publicKey) {
      setErrorMsg('Payment gateway is not currently configured. Please check back later.');
      return;
    }
    setErrorMsg('');
    initializePayment({
      onSuccess,
      onClose
    } as any);
  };

  if (cart.length === 0) {
    return (
      <div className="bg-white flex-1 flex flex-col items-center justify-center p-6 md:p-12 border-t border-black">
        <h2 className="text-4xl lg:text-5xl font-serif italic tracking-tighter text-black mb-8">Cart is Empty</h2>
        <Link to="/shop" className="text-[10px] font-bold uppercase tracking-widest text-black flex items-center space-x-2 border border-black px-6 py-4 hover:bg-black hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white flex-1 flex flex-col lg:flex-row border-t border-black relative">
      <div className="w-full lg:flex-1 p-6 md:p-12 border-b lg:border-b-0 lg:border-r border-black">
        <div className="flex justify-between items-end mb-8 border-b border-black pb-8">
          <h1 className="text-4xl lg:text-5xl font-serif italic tracking-tighter text-black">
            Cart
          </h1>
          <div className="text-[10px] uppercase font-bold tracking-[0.2em]">{cart.length} Items</div>
        </div>
        
        {errorMsg && (
          <div className="bg-neutral-100 text-black p-4 mb-6 text-xs font-mono border border-black flex items-center space-x-2">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="divide-y divide-black border-b border-black">
          {cart.map((item) => (
            <div key={item.id} className="flex py-6 group">
              <div className="h-32 w-24 flex-shrink-0 overflow-hidden border border-black bg-neutral-100 hidden sm:block">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover grayscale mix-blend-multiply opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                />
              </div>

              <div className="ml-0 sm:ml-6 flex flex-1 flex-col">
                <div>
                  <div className="flex justify-between">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em]">{item.name}</h3>
                    <p className="font-serif italic text-lg">{formatPrice(item.price * item.quantity, currency)}</p>
                  </div>
                </div>
                <div className="flex flex-1 items-end justify-between text-[10px] uppercase font-bold tracking-widest mt-4">
                  <p className="opacity-50">Qty {item.quantity}</p>

                  <div className="flex">
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="opacity-50 hover:opacity-100 hover:line-through transition-all flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4 hidden sm:block" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-[340px] xl:w-[400px] flex-shrink-0 flex flex-col bg-neutral-50 h-full lg:h-screen lg:sticky lg:top-0">
        <div className="p-6 md:p-8 flex-1">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Summary</h3>
             <span className="flex items-center gap-1.5 text-[9px] font-bold text-green-600 tracking-[0.1em]">
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span> SECURE
             </span>
          </div>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-black pb-4">
              <div>
                <div className="text-[9px] font-bold uppercase opacity-40 tracking-widest">Total Amount</div>
                <div className="text-2xl font-serif tracking-tighter text-black mt-1">{displayTotal}</div>
              </div>
            </div>

            <div className="py-2">
              <label htmlFor="email" className="block text-[9px] font-bold uppercase tracking-[0.2em] text-black mb-2">Email Address (for receipt)</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-black bg-transparent px-3 py-2.5 text-xs font-mono focus:bg-white focus:outline-none transition-colors"
                placeholder="customer@domain.com"
              />
            </div>
            
            <div className="pt-2">
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full py-3 bg-black text-white text-[9px] uppercase font-bold tracking-[0.2em] border border-black hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Pay with Paystack'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
