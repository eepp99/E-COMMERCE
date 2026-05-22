import React, { useState, useEffect, useRef } from 'react';
import { Order, Product } from '../types';
import { Package, ListOrdered, Edit2, Check, X, Upload, Lock, Menu as MenuIcon } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Check auth state on mount
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsAdminAuthenticated(true);
    }
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const ordersRes = await fetch('/api/admin/orders', { headers });
      if (ordersRes.status === 401) {
        handleLogout();
        return;
      }
      if (ordersRes.ok) setOrders(await ordersRes.json());
      
      const productsRes = await fetch('/api/admin/products', { headers });
      if (productsRes.ok) setProducts(await productsRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchData();
    }
  }, [isAdminAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('admin_token', data.token);
        setIsAdminAuthenticated(true);
      } else {
        setLoginError('Invalid password');
      }
    } catch (err) {
      setLoginError('Network Error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAdminAuthenticated(false);
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setEditForm(product);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async (id: string) => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const isNew = id === 'new';
      const url = isNew ? `/api/admin/products` : `/api/admin/products/${id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (res.ok) {
        const updated = await res.json();
        if (isNew) {
          setProducts([...products, updated]);
        } else {
          setProducts(products.map(p => p.id === id ? updated : p));
        }
        setEditingId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!authChecked) {
    return <div className="flex-1 flex items-center justify-center bg-white"><LoadingSpinner /></div>;
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="flex-1 bg-neutral-50 flex items-center justify-center p-6 border-t border-black">
        <div className="bg-white border border-black p-8 md:p-12 w-full max-w-md shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-black flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-serif italic text-black text-center mb-2">Admin Portal</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-center opacity-50 mb-8">Restricted Access</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-black mb-2">
                Security Key
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-black bg-transparent px-4 py-3 text-sm focus:outline-none focus:bg-neutral-50 font-mono text-center tracking-widest"
                placeholder="••••••••"
                required
              />
            </div>
            
            {loginError && (
              <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest text-center block">
                {loginError}
              </p>
            )}
            
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.2em] border border-black hover:bg-white hover:text-black transition-colors disabled:opacity-50"
            >
              {isLoggingIn ? <LoadingSpinner /> : 'Authenticate'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white flex-1 flex flex-col border-t border-black">
      <div className="border-b border-black p-6 md:p-12 flex flex-row items-center justify-between">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif italic tracking-tighter text-black">
          Dashboard <span className="text-[10px] font-sans not-italic uppercase font-bold tracking-[0.2em] ml-2 md:ml-4">v.2.04</span>
        </h1>
        
        {/* Mobile Menu Toggle */}
        <div className="md:hidden relative" ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 border border-black hover:bg-black hover:text-white transition-colors"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
          
          {isMenuOpen && (
            <div className="absolute top-full right-0 mt-2 bg-white border border-black flex flex-col w-48 shadow-lg z-50">
              {activeTab === 'products' && (
                <button
                  onClick={() => {
                    setEditingId('new');
                    setEditForm({ name: '', price: 0, stock: 0, image: '', description: '' });
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-black hover:bg-neutral-100 transition-colors"
                >
                  Add New Product
                </button>
              )}
              <button
                onClick={() => {
                  setActiveTab('orders');
                  setIsMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-black transition-colors ${activeTab === 'orders' ? 'bg-black text-white' : 'hover:bg-neutral-100 text-black'}`}
              >
                Orders ({orders.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('products');
                  setIsMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-black transition-colors ${activeTab === 'products' ? 'bg-black text-white' : 'hover:bg-neutral-100 text-black'}`}
              >
                Products ({products.length})
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-100 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex flex-wrap gap-2 md:gap-4 items-center">
          {activeTab === 'products' && (
            <button
              onClick={() => {
                setEditingId('new');
                setEditForm({ name: '', price: 0, stock: 0, image: '', description: '' });
              }}
              className="flex items-center space-x-2 px-4 md:px-6 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors bg-white text-black border border-black hover:bg-black hover:text-white"
            >
              <span>Add New Product</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center space-x-2 px-4 md:px-6 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors border border-black ${activeTab === 'orders' ? 'bg-black text-white' : 'bg-transparent text-black hover:bg-black hover:text-white'}`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Orders ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center space-x-2 px-4 md:px-6 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors border border-black ${activeTab === 'products' ? 'bg-black text-white' : 'bg-transparent text-black hover:bg-black hover:text-white'}`}
          >
            <Package className="w-4 h-4" />
            <span>Products ({products.length})</span>
          </button>
          <div className="w-px h-6 bg-black opacity-20 mx-2"></div>
          <button
            onClick={handleLogout}
            className="text-[10px] uppercase font-bold tracking-widest hover:text-black/50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col bg-neutral-50 p-4 md:p-12">
        <div className="bg-white border border-black flex-1 flex flex-col overflow-hidden">
          {activeTab === 'orders' ? (
            <div className="overflow-x-hidden overflow-y-auto flex-1">
              <table className="w-full text-left flex flex-col sm:table border-collapse">
                <thead className="bg-black text-white sticky top-0 z-10 hidden sm:table-header-group">
                  <tr className="sm:table-row">
                    <th scope="col" className="px-6 py-4 text-[10px] whitespace-nowrap font-bold uppercase tracking-[0.2em]">Order ID</th>
                    <th scope="col" className="px-6 py-4 text-[10px] whitespace-nowrap font-bold uppercase tracking-[0.2em]">Date</th>
                    <th scope="col" className="px-6 py-4 text-[10px] whitespace-nowrap font-bold uppercase tracking-[0.2em]">Customer</th>
                    <th scope="col" className="px-6 py-4 text-[10px] whitespace-nowrap font-bold uppercase tracking-[0.2em]">Amount</th>
                    <th scope="col" className="px-6 py-4 text-[10px] whitespace-nowrap font-bold uppercase tracking-[0.2em]">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-black text-sm font-mono flex flex-col sm:table-row-group">
                  {orders.length === 0 ? (
                    <tr className="flex flex-col sm:table-row">
                      <td colSpan={5} className="px-6 py-8 text-center text-xs opacity-50 uppercase tracking-widest font-sans sm:table-cell block">No orders found.</td>
                    </tr>
                  ) : (
                    orders.map(order => (
                      <tr key={order.id} className="hover:bg-neutral-50 transition-colors flex flex-col sm:table-row border-b border-black sm:border-b-0 p-4 sm:p-0">
                        <td className="sm:px-6 sm:py-4 py-1 flex justify-between sm:table-cell font-bold text-xs items-center">
                          <span className="sm:hidden font-sans text-[9px] uppercase tracking-widest opacity-50">Order ID</span>
                          <span>{order.id}</span>
                        </td>
                        <td className="sm:px-6 sm:py-4 py-1 flex justify-between sm:table-cell text-xs items-center">
                          <span className="sm:hidden font-sans text-[9px] uppercase tracking-widest opacity-50">Date</span>
                          <span>{new Date(order.date).toLocaleDateString()}</span>
                        </td>
                        <td className="sm:px-6 sm:py-4 py-1 flex justify-between sm:table-cell text-xs items-center">
                          <span className="sm:hidden font-sans text-[9px] uppercase tracking-widest opacity-50">Customer</span>
                          <span className="truncate max-w-[200px] sm:max-w-none text-right sm:text-left">{order.email}</span>
                        </td>
                        <td className="sm:px-6 sm:py-4 py-1 flex justify-between sm:table-cell font-serif italic text-lg items-center">
                          <span className="sm:hidden font-sans text-[9px] not-italic uppercase tracking-widest opacity-50">Amount</span>
                          <span>₦{order.amount.toLocaleString()}</span>
                        </td>
                        <td className="sm:px-6 sm:py-4 mt-2 sm:mt-0 flex justify-end sm:justify-start sm:table-cell pt-3 sm:pt-4 border-t border-black/10 sm:border-0 items-center">
                          <span className="inline-flex items-center space-x-2 text-[10px] uppercase font-bold font-sans tracking-widest text-green-600">
                            <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span> <span>{order.status}</span>
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-hidden overflow-y-auto flex-1">
               <table className="w-full text-left flex flex-col sm:table border-collapse">
                <thead className="bg-black text-white sticky top-0 z-20 hidden sm:table-header-group">
                  <tr className="sm:table-row">
                    <th scope="col" className="px-6 py-4 text-[10px] whitespace-nowrap font-bold uppercase tracking-[0.2em]">Product</th>
                    <th scope="col" className="px-6 py-4 text-[10px] whitespace-nowrap font-bold uppercase tracking-[0.2em]">ID</th>
                    <th scope="col" className="px-6 py-4 text-[10px] whitespace-nowrap font-bold uppercase tracking-[0.2em]">Price (₦)</th>
                    <th scope="col" className="px-6 py-4 text-[10px] whitespace-nowrap font-bold uppercase tracking-[0.2em]">Stock</th>
                    <th scope="col" className="px-6 py-4 text-[10px] whitespace-nowrap font-bold uppercase tracking-[0.2em]">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-black text-sm font-mono flex flex-col sm:table-row-group">
                  {((editingId === 'new' ? [{ id: 'new', name: '', description: '', price: 0, stock: 0, image: '' } as Product, ...products] : products)).map(product => {
                    const isEditing = editingId === product.id;
                    return (
                    <tr key={product.id} className="hover:bg-neutral-50 transition-colors flex flex-col sm:table-row border-b border-black sm:border-b-0 p-4 sm:p-0">
                      <td className="sm:px-6 sm:py-4 pb-4 sm:pb-4 block sm:table-cell">
                        <div className="flex items-start">
                          <div className="h-20 w-16 sm:h-12 sm:w-10 flex-shrink-0 bg-neutral-100 border border-black relative group">
                            {isEditing ? (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer">
                                <Upload className="w-4 h-4 text-white" />
                                <input 
                                  type="text" 
                                  className="absolute inset-0 opacity-0 cursor-pointer" 
                                  title="Enter Image URL"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const url = prompt("Enter new image URL:", editForm.image || "");
                                    if (url !== null) setEditForm({...editForm, image: url});
                                  }}
                                />
                              </div>
                            ) : null}
                            <img className="h-full w-full object-cover grayscale mix-blend-multiply opacity-80" src={isEditing ? editForm.image : product.image} alt="" />
                          </div>
                          <div className="ml-4 font-bold text-[10px] uppercase font-sans tracking-widest flex flex-col w-full min-w-0">
                            {isEditing ? (
                              <>
                                <input 
                                  type="text"
                                  value={editForm.name || ""}
                                  placeholder="Product Name"
                                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                  className="w-full border-b border-black bg-transparent focus:outline-none mb-2 font-bold"
                                />
                                <textarea 
                                  value={editForm.description || ""}
                                  placeholder="Product Description"
                                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                  className="w-full border border-black bg-transparent focus:outline-none p-1 font-normal normal-case tracking-normal h-16 resize-y"
                                />
                              </>
                            ) : (
                              <>
                                <span>{product.name}</span>
                                {product.description && <span className="opacity-50 mt-1 font-normal normal-case tracking-normal line-clamp-2 sm:line-clamp-1">{product.description}</span>}
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="sm:px-6 sm:py-4 py-1 flex justify-between sm:table-cell text-xs items-center">
                        <span className="sm:hidden font-sans text-[9px] uppercase tracking-widest opacity-50">ID</span>
                        <span className="truncate max-w-[150px] sm:max-w-none text-right sm:text-left">{product.id === 'new' ? 'NEW' : product.id}</span>
                      </td>
                      <td className="sm:px-6 sm:py-4 py-1 flex justify-between sm:table-cell font-serif italic text-lg items-center">
                        <span className="sm:hidden font-sans text-[9px] not-italic uppercase tracking-widest opacity-50">Price</span>
                        {isEditing ? (
                          <div className="flex items-center justify-end sm:justify-start">
                            <span className="mr-1">₦</span>
                            <input 
                              type="number"
                              value={editForm.price || 0}
                              onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value)})}
                              className="w-24 border-b border-black bg-transparent focus:outline-none font-serif italic text-lg text-right sm:text-left"
                            />
                          </div>
                        ) : (
                          <span>₦{product.price.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="sm:px-6 sm:py-4 py-1 flex justify-between sm:table-cell text-xs items-center">
                        <span className="sm:hidden font-sans text-[9px] uppercase tracking-widest opacity-50">Stock</span>
                        {isEditing ? (
                          <div className="flex items-center justify-end sm:justify-start">
                            <input 
                              type="number"
                              value={editForm.stock || 0}
                              onChange={(e) => setEditForm({...editForm, stock: parseInt(e.target.value, 10)})}
                              className="w-16 border-b border-black bg-transparent focus:outline-none text-xs text-right sm:text-left"
                            />
                            <span className="ml-2">Units</span>
                          </div>
                        ) : (
                          <span>{product.stock} Units</span>
                        )}
                      </td>
                      <td className="sm:px-6 sm:py-4 mt-2 sm:mt-0 pt-3 sm:pt-4 border-t border-black/10 sm:border-0 flex justify-end sm:justify-start sm:table-cell items-center">
                        {isEditing ? (
                          <div className="flex items-center space-x-4 w-full sm:w-auto">
                            <button onClick={() => handleSave(product.id)} className="text-green-600 hover:text-green-800 transition-colors flex flex-1 sm:flex-initial items-center justify-center space-x-2 border border-green-600 p-2 sm:border-0 sm:p-0" title="Save">
                              <Check className="w-4 h-4" /> <span className="sm:hidden font-sans text-[10px] font-bold uppercase tracking-widest">Save</span>
                            </button>
                            <button onClick={handleCancel} className="text-red-600 hover:text-red-800 transition-colors flex flex-1 sm:flex-initial items-center justify-center space-x-2 border border-red-600 p-2 sm:border-0 sm:p-0" title="Cancel">
                              <X className="w-4 h-4" /> <span className="sm:hidden font-sans text-[10px] font-bold uppercase tracking-widest">Cancel</span>
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => handleEdit(product)} className="text-black hover:opacity-50 transition-colors flex items-center justify-center space-x-2 border border-black p-2 sm:border-0 sm:p-0 w-full sm:w-auto mt-2 sm:mt-0" title="Edit">
                            <Edit2 className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest font-sans sm:hidden xl:inline">Edit Product</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
