/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import StoreFront from './pages/StoreFront';
import Cart from './pages/Cart';
import AdminPanel from './pages/AdminPanel';
import ProductDetails from './pages/ProductDetails';
import Account from './pages/Account';
import CurrencySwitcher from './components/CurrencySwitcher';
import { Mail, Instagram, Twitter, Youtube } from 'lucide-react';

export default function App() {
  return (
    <Router>
        <Routes>
          <Route path="/admin" element={
            <div className="font-sans min-h-screen bg-white text-black flex flex-col relative">
              <AdminPanel />
            </div>
          } />
          <Route path="*" element={
            <div className="font-sans min-h-screen bg-white text-black flex flex-col relative">
              <Navbar />
              <main className="flex-1 w-full flex flex-col">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/shop" element={<StoreFront />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/account" element={<Account />} />
                </Routes>
              </main>
              <footer className="border-t border-black px-4 py-3 flex flex-col sm:flex-row items-center justify-between shrink-0 bg-white text-[9px] gap-3 sm:gap-0 mt-auto">
                <div className="flex sm:w-1/3 justify-center sm:justify-start">
                </div>
                <div className="flex sm:w-1/3 items-center justify-center space-x-4 text-black">
                  <a href="mailto:studio-hello@gmail.com" className="hover:opacity-50 transition-opacity" title="Gmail"><Mail className="w-3.5 h-3.5 text-black" /></a>
                  <a href="#" className="hover:opacity-50 transition-opacity" title="Instagram"><Instagram className="w-3.5 h-3.5 text-black" /></a>
                  <a href="#" className="hover:opacity-50 transition-opacity" title="X (Twitter)"><Twitter className="w-3.5 h-3.5 text-black" /></a>
                  <a href="#" className="hover:opacity-50 transition-opacity" title="YouTube"><Youtube className="w-3.5 h-3.5 text-black" /></a>
                </div>
                <div className="flex sm:w-1/3 flex-col sm:flex-row items-center justify-center sm:justify-end gap-1 sm:gap-2">
                  <span className="font-serif italic text-[10px] text-black">Contact Us</span>
                  <a href="mailto:studio-hello@gmail.com" className="font-bold uppercase tracking-[0.2em] hover:opacity-50 transition-opacity text-black">
                    studio-hello@gmail.com
                  </a>
                </div>
              </footer>
              <CurrencySwitcher />
            </div>
          } />
        </Routes>
    </Router>
  );
}
