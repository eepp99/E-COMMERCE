import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col relative bg-white overflow-hidden border-t border-black">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=2000" 
          alt="Fashion Hero" 
          className="w-full h-full object-cover grayscale opacity-[0.15]"
        />
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif italic tracking-tighter text-black mb-6 leading-none mix-blend-multiply">
            Online Store.
          </h1>
          <p className="text-xs md:text-sm font-sans uppercase tracking-[0.3em] font-bold text-black/60 mb-12 mix-blend-multiply">
            Online store for buying and selling of goods
          </p>
          
          <Link 
            to="/shop" 
            className="inline-flex items-center space-x-4 px-8 py-4 bg-black text-white hover:bg-white hover:text-black border border-black transition-colors group"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Shop Now</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-12 left-6 md:left-12 z-10 hidden md:block">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] transform rotate-180" style={{ writingMode: 'vertical-rl' }}>
          Collection NØ. 01
        </div>
      </div>
      
      <div className="absolute bottom-12 right-6 md:right-12 z-10 hidden md:block">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-right">
          Est. <br/> 2026
        </div>
      </div>
    </div>
  );
}
