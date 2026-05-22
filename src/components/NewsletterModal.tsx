import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { subscribeNewsletter } from '../firebase';
import LoadingSpinner from './LoadingSpinner';

export default function NewsletterModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Check if the user has already seen this or subscribed
    const hasSeen = localStorage.getItem('newsletter_seen');
    if (!hasSeen) {
      // Delay showing it so they can see the shop first
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem('newsletter_seen', 'true');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setErrorMsg('');
    
    try {
      await subscribeNewsletter(email);
      setSubscribed(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-6">
      <div className="bg-white border-2 border-black p-8 md:p-12 max-w-md w-full relative shadow-2xl">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-black hover:opacity-50 transition-opacity"
        >
          <X className="w-6 h-6" />
        </button>
        
        {subscribed ? (
          <div className="text-center py-8">
            <h2 className="text-3xl font-serif italic mb-4">Thank You</h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">
              You're on the list.
            </p>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-3xl font-serif italic mb-2 text-black">
              Join the Society
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50 mb-8">
              Sign up to receive news about our latest drops, exclusive events, and more.
            </p>
            
            <form onSubmit={handleSubscribe} className="space-y-4">
              <input 
                type="email" 
                required
                placeholder="EMAIL ADDRESS" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b border-black py-3 px-2 bg-transparent focus:outline-none focus:border-black placeholder:text-[10px] placeholder:font-bold placeholder:uppercase placeholder:tracking-[0.2em] placeholder:opacity-30"
              />
              
              {errorMsg && (
                <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest text-left mt-2">{errorMsg}</p>
              )}
              
              <button 
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] py-4 border border-black hover:bg-white hover:text-black transition-colors disabled:opacity-50"
              >
                {loading ? <LoadingSpinner /> : 'Subscribe'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
