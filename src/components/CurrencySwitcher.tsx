import { useState, useRef, useEffect } from 'react';
import { useStore, CURRENCIES, CurrencyCode } from '../store';

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={dropdownRef}>
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-32 bg-white border border-black shadow-2xl flex flex-col">
          {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
            const isSelected = currency.code === code;
            return (
              <button
                key={code}
                onClick={() => {
                  setCurrency(code);
                  setIsOpen(false);
                }}
                className={`text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                  isSelected ? 'bg-black text-white' : 'hover:bg-neutral-100 text-black'
                }`}
              >
                {CURRENCIES[code].symbol} {code}
              </button>
            );
          })}
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl border border-white/20 text-xs font-bold tracking-widest uppercase"
        title="Change Currency"
      >
        {currency.code}
      </button>
    </div>
  );
}
