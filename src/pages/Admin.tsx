import React, { useState, useEffect, useCallback } from 'react';
import { useContent } from '../context/ContentContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  Save, RefreshCw, AlertCircle, CheckCircle, Layout, Coffee, Info,
  Image, Phone, LogOut, ChevronRight, Plus, Trash2, Edit2, Eye,
  EyeOff, Package, Clock, XCircle, ShoppingBag, Tag, DollarSign,
  Link as LinkIcon, AlignLeft, LayoutDashboard
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { productService, Product } from '../services/productService';
import { orderService, Order } from '../services/orderService';
import { galleryService, GalleryImage } from '../services/galleryService';

type Section = 'brand' | 'navigation' | 'home' | 'menu' | 'about' | 'gallery' |
  'contact' | 'footer' | 'raw' | 'products' | 'orders';

const CATEGORIES = ['Coffee', 'Tea', 'Snacks', 'Desserts', 'Specials', 'Food'];

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  preparing: 'bg-blue-100 text-blue-700',
  ready: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
};


export default function Admin() {
  const { content, updateContent, loading: contentLoading } = useContent();
  const [localContent, setLocalContent] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingGallery, setEditingGallery] = useState<Partial<GalleryImage> | null>(null);
  const [addingByUrl, setAddingByUrl] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [productSaving, setProductSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeSection, setActiveSection] = useState<Section>('orders');
  const navigate = useNavigate();

  // ── sync content into local state ──────────────────────────────────────────
  useEffect(() => { if (content) setLocalContent(content); }, [content]);

  // ── section-specific data fetching ────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    const data = await productService.getProducts();
    setProducts(data);
  }, []);

  const fetchOrders = useCallback(async () => {
    const data = await orderService.getOrders();
    setOrders(data);
  }, []);

  const fetchGallery = useCallback(async () => {
    const data = await galleryService.getImages();
    setGalleryImages(data);
  }, []);

  useEffect(() => {
    if (activeSection === 'products') { fetchProducts(); }
    else if (activeSection === 'gallery') { fetchGallery(); }
    else if (activeSection === 'orders') {
      fetchOrders();
      const sub = supabase
        .channel('orders-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
        .subscribe();
      return () => { sub.unsubscribe(); };
    }
  }, [activeSection, fetchProducts, fetchGallery, fetchOrders]);


  // ── helpers ───────────────────────────────────────────────────────────────
  const showStatus = (type: 'success' | 'error', message: string) => {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 4000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleSaveContent = async () => {
    setSaving(true);
    const ok = await updateContent(localContent);
    setSaving(false);
    showStatus(ok ? 'success' : 'error', ok ? 'Content saved!' : 'Failed to save. Check connection.');
  };

  const updateNestedContent = (path: string, value: any) => {
    const next = JSON.parse(JSON.stringify(localContent));
    const keys = path.split('.');
    let cur = next;
    for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
    cur[keys[keys.length - 1]] = value;
    setLocalContent(next);
  };

  // ── product save ──────────────────────────────────────────────────────────
  const handleProductSave = async () => {
    if (!editingProduct) return;
    if (!editingProduct.name?.trim()) { showStatus('error', 'Product name is required.'); return; }
    if (!editingProduct.price || editingProduct.price <= 0) { showStatus('error', 'Price must be greater than 0.'); return; }

    setProductSaving(true);
    let ok = false;
    if (editingProduct.id) {
      ok = await productService.updateProduct(editingProduct.id, editingProduct);
    } else {
      const result = await productService.addProduct(editingProduct as Omit<Product, 'id' | 'created_at'>);
      ok = result !== null;
    }
    setProductSaving(false);

    if (ok) {
      setEditingProduct(null);
      await fetchProducts();
      showStatus('success', editingProduct.id ? 'Product updated!' : 'Product added!');
    } else {
      showStatus('error', 'Failed to save product. Check console for details.');
    }
  };

  // ── gallery add by URL ────────────────────────────────────────────────────
  const handleAddImageByUrl = async () => {
    if (!newImageUrl.trim()) return;
    setSaving(true);
    const result = await galleryService.addImage({ url: newImageUrl.trim(), caption: '', category: 'General' });
    setSaving(false);
    if (result) {
      setNewImageUrl('');
      setAddingByUrl(false);
      await fetchGallery();
      showStatus('success', 'Image added!');
    } else {
      showStatus('error', 'Failed to add image. Check the URL.');
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    const url = await galleryService.uploadImage(file);
    if (url) {
      await galleryService.addImage({ url, caption: '', category: 'General' });
      await fetchGallery();
      showStatus('success', 'Image uploaded!');
    } else {
      showStatus('error', 'Upload failed. Check Supabase storage bucket.');
    }
    setSaving(false);
    e.target.value = '';
  };


  // ── loading guard ─────────────────────────────────────────────────────────
  if (contentLoading || !localContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-coffee-50">
        <RefreshCw className="animate-spin text-accent" size={48} />
      </div>
    );
  }

  const sidebarItems = [
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'brand', label: 'Brand & Identity', icon: Coffee },
    { id: 'home', label: 'Home Page', icon: LayoutDashboard },
    { id: 'menu', label: 'Menu Config', icon: Layout },
    { id: 'about', label: 'About Us', icon: Info },
    { id: 'contact', label: 'Contact Info', icon: Phone },
    { id: 'footer', label: 'Footer', icon: Layout },
    { id: 'navigation', label: 'Navigation', icon: Layout },
    { id: 'raw', label: 'Raw JSON', icon: AlertCircle },
  ] as const;

  const isDataSection = ['orders', 'products', 'gallery'].includes(activeSection);

  return (
    <div className="min-h-screen bg-coffee-50 flex">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="w-64 bg-white border-r border-coffee-100 hidden md:flex flex-col fixed h-screen">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-coffee-100">
          <span className="text-xl font-bold text-accent">HAHA</span>
          <span className="text-xl font-bold text-coffee-900"> CMS</span>
          <p className="text-xs text-coffee-400 mt-0.5">Admin Dashboard</p>
        </div>
        {/* Nav */}
        <nav className="flex-grow overflow-y-auto p-4 space-y-1">
          {sidebarItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id as Section)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeSection === id
                ? 'bg-accent text-white shadow-md shadow-accent/20'
                : 'text-coffee-600 hover:bg-coffee-50'
                }`}
            >
              <Icon size={16} />
              {label}
              {activeSection === id && <ChevronRight size={13} className="ml-auto" />}
            </button>
          ))}
        </nav>
        {/* Sign out */}
        <div className="p-4 border-t border-coffee-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>


      {/* ── Main area ───────────────────────────────────────── */}
      <main className="flex-grow md:ml-64 flex flex-col">
        {/* Top bar */}
        <header className="bg-white border-b border-coffee-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-coffee-950">
              {sidebarItems.find(i => i.id === activeSection)?.label}
            </h1>
            <p className="text-xs text-coffee-400">HAHA Coffee Admin</p>
          </div>
          {!isDataSection && (
            <button
              onClick={handleSaveContent}
              disabled={saving}
              className="bg-coffee-950 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all disabled:opacity-50 text-sm"
            >
              {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          )}
        </header>

        {/* Status toast */}
        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`mx-8 mt-6 p-4 rounded-2xl flex items-center gap-3 border text-sm font-bold ${status.type === 'success'
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-red-50 text-red-700 border-red-200'
                }`}
            >
              {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              {status.message}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-8 flex-grow">


          {/* ══════════════════════════════════════════════════
              PRODUCTS SECTION
          ══════════════════════════════════════════════════ */}
          {activeSection === 'products' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-coffee-500 text-sm">{products.length} products in catalog</p>
                <button
                  onClick={() => setEditingProduct({ name: '', description: '', price: 0, category: 'Coffee', image_url: '', is_available: true })}
                  className="bg-accent text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-600 transition-all text-sm"
                >
                  <Plus size={16} /> Add Product
                </button>
              </div>

              {/* Product form */}
              <AnimatePresence>
                {editingProduct && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white rounded-2xl border border-coffee-200 p-6 shadow-sm space-y-5"
                  >
                    <h3 className="font-bold text-coffee-950">{editingProduct.id ? 'Edit Product' : 'New Product'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-coffee-600 mb-1.5"><Tag size={12} className="inline mr-1" />Name *</label>
                        <input
                          type="text"
                          value={editingProduct.name || ''}
                          onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          placeholder="e.g. Signature Latte"
                          className="w-full px-4 py-2.5 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-coffee-600 mb-1.5"><Tag size={12} className="inline mr-1" />Category</label>
                        <select
                          value={editingProduct.category || 'Coffee'}
                          onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                          className="w-full px-4 py-2.5 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent text-sm"
                        >
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-coffee-600 mb-1.5"><DollarSign size={12} className="inline mr-1" />Price ($) *</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editingProduct.price || ''}
                          onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                          className="w-full px-4 py-2.5 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-coffee-600 mb-1.5"><LinkIcon size={12} className="inline mr-1" />Image URL</label>
                        <input
                          type="url"
                          value={editingProduct.image_url || ''}
                          onChange={e => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                          placeholder="https://..."
                          className="w-full px-4 py-2.5 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-coffee-600 mb-1.5"><AlignLeft size={12} className="inline mr-1" />Description</label>
                      <textarea
                        value={editingProduct.description || ''}
                        onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        rows={2}
                        placeholder="Short description of the product"
                        className="w-full px-4 py-2.5 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent text-sm resize-none"
                      />
                    </div>
                    {editingProduct.image_url && (
                      <div className="flex gap-3 items-center">
                        <img src={editingProduct.image_url} alt="preview" className="w-16 h-16 rounded-xl object-cover border border-coffee-200" />
                        <span className="text-xs text-coffee-400">Image preview</span>
                      </div>
                    )}
                    <div className="flex justify-end gap-3 pt-2">
                      <button onClick={() => setEditingProduct(null)} className="px-5 py-2.5 text-sm font-bold text-coffee-600 hover:bg-coffee-50 rounded-xl transition-all">Cancel</button>
                      <button
                        onClick={handleProductSave}
                        disabled={productSaving}
                        className="px-6 py-2.5 bg-coffee-950 text-white text-sm font-bold rounded-xl hover:bg-accent transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {productSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                        {editingProduct.id ? 'Update' : 'Create'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>


              {/* Products table */}
              {products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-coffee-100">
                  <ShoppingBag size={40} className="text-coffee-200 mx-auto mb-3" />
                  <p className="text-coffee-500 font-bold">No products yet</p>
                  <p className="text-coffee-400 text-sm">Click "Add Product" to get started.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-coffee-100 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-coffee-50 border-b border-coffee-100">
                      <tr>
                        <th className="text-left px-6 py-4 text-xs font-bold text-coffee-500 uppercase tracking-wider">Product</th>
                        <th className="text-left px-4 py-4 text-xs font-bold text-coffee-500 uppercase tracking-wider">Category</th>
                        <th className="text-left px-4 py-4 text-xs font-bold text-coffee-500 uppercase tracking-wider">Price</th>
                        <th className="text-left px-4 py-4 text-xs font-bold text-coffee-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-coffee-50">
                      {products.map(product => (
                        <tr key={product.id} className="group hover:bg-coffee-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded-lg object-cover border border-coffee-100" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-coffee-100 flex items-center justify-center"><Coffee size={16} className="text-coffee-400" /></div>
                              )}
                              <div>
                                <p className="font-bold text-coffee-900 text-sm">{product.name}</p>
                                <p className="text-xs text-coffee-400 line-clamp-1 max-w-[200px]">{product.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="px-2.5 py-1 bg-coffee-100 text-coffee-700 rounded-lg text-xs font-bold">{product.category}</span>
                          </td>
                          <td className="px-4 py-4 font-bold text-coffee-900 text-sm">${product.price.toFixed(2)}</td>
                          <td className="px-4 py-4">
                            <button
                              onClick={async () => { await productService.updateProduct(product.id, { is_available: !product.is_available }); fetchProducts(); }}
                              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${product.is_available ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                            >
                              {product.is_available ? <Eye size={12} /> : <EyeOff size={12} />}
                              {product.is_available ? 'Available' : 'Hidden'}
                            </button>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                              <button onClick={() => setEditingProduct(product)} className="p-2 text-coffee-400 hover:text-accent hover:bg-coffee-50 rounded-lg transition-all"><Edit2 size={15} /></button>
                              <button
                                onClick={async () => {
                                  if (!confirm(`Delete "${product.name}"?`)) return;
                                  await productService.deleteProduct(product.id);
                                  fetchProducts();
                                  showStatus('success', 'Product deleted.');
                                }}
                                className="p-2 text-coffee-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              ><Trash2 size={15} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}


          {/* ══════════════════════════════════════════════════
              ORDERS SECTION
          ══════════════════════════════════════════════════ */}
          {activeSection === 'orders' && (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <p className="text-coffee-500 text-sm">{orders.length} orders total</p>
                <button onClick={fetchOrders} className="p-2 text-coffee-500 hover:text-accent transition-all rounded-lg hover:bg-coffee-100"><RefreshCw size={16} /></button>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-coffee-100">
                  <Package size={40} className="text-coffee-200 mx-auto mb-3" />
                  <p className="text-coffee-500 font-bold">No orders yet</p>
                  <p className="text-coffee-400 text-sm">Orders placed on the website will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map(order => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="bg-white rounded-2xl border border-coffee-100 p-5 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600'}`}>
                            <Package size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-coffee-950 text-sm">{order.customer_name}</p>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-xs text-coffee-400 flex items-center gap-1"><Clock size={11} />{new Date(order.created_at!).toLocaleString()}</span>
                              <span className="text-xs px-2 py-0.5 bg-coffee-100 rounded-full text-coffee-600 font-bold uppercase">{order.order_type}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-bold text-accent">${order.total_amount.toFixed(2)}</span>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${STATUS_STYLES[order.status] || ''}`}>{order.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Order detail modal */}
              <AnimatePresence>
                {selectedOrder && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                      <div className="px-7 py-5 border-b border-coffee-100 flex justify-between items-center">
                        <h3 className="font-bold text-coffee-950">Order Details</h3>
                        <button onClick={() => setSelectedOrder(null)} className="text-coffee-400 hover:text-coffee-700"><XCircle size={22} /></button>
                      </div>
                      <div className="p-7 overflow-y-auto space-y-6">
                        <div className="grid grid-cols-2 gap-5">
                          <div>
                            <p className="text-xs font-bold text-coffee-400 uppercase tracking-wider mb-2">Customer</p>
                            <p className="font-bold text-coffee-900 text-sm">{selectedOrder.customer_name}</p>
                            <p className="text-sm text-coffee-500">{selectedOrder.customer_email}</p>
                            <p className="text-sm text-coffee-500">{selectedOrder.customer_phone}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-coffee-400 uppercase tracking-wider mb-2">Order Info</p>
                            <p className="font-bold text-coffee-900 text-sm uppercase">{selectedOrder.order_type}</p>
                            <p className="text-xs text-coffee-400 mt-1 font-mono">#{selectedOrder.id.slice(0, 8)}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-coffee-400 uppercase tracking-wider mb-3">Items</p>
                          <div className="space-y-2">
                            {selectedOrder.items.map((item, i) => (
                              <div key={i} className="flex justify-between text-sm py-2 border-b border-coffee-50 last:border-0">
                                <span className="flex items-center gap-2">
                                  <span className="w-6 h-6 bg-coffee-100 rounded text-xs font-bold text-coffee-600 flex items-center justify-center">{item.quantity}</span>
                                  <span className="font-bold text-coffee-900">{item.name}</span>
                                </span>
                                <span className="text-coffee-600">${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-coffee-50 rounded-xl p-4 flex justify-between items-center">
                          <span className="font-bold text-coffee-900">Total</span>
                          <span className="text-xl font-bold text-accent">${selectedOrder.total_amount.toFixed(2)}</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-coffee-400 uppercase tracking-wider mb-3">Update Status</p>
                          <div className="flex flex-wrap gap-2">
                            {(['pending', 'preparing', 'ready', 'completed', 'cancelled'] as const).map(s => (
                              <button
                                key={s}
                                onClick={async () => {
                                  await orderService.updateOrderStatus(selectedOrder.id, s);
                                  setSelectedOrder({ ...selectedOrder, status: s });
                                  fetchOrders();
                                }}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedOrder.status === s ? 'bg-accent text-white shadow-md' : 'bg-coffee-50 text-coffee-600 hover:bg-coffee-100'
                                  }`}
                              >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="px-7 py-4 border-t border-coffee-100 bg-coffee-50/50 flex justify-end">
                        <button
                          onClick={async () => {
                            if (!confirm('Delete this order?')) return;
                            await orderService.deleteOrder(selectedOrder.id);
                            setSelectedOrder(null);
                            fetchOrders();
                          }}
                          className="text-sm font-bold text-red-500 flex items-center gap-2 hover:underline"
                        >
                          <Trash2 size={14} /> Delete Order
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}


          {/* ══════════════════════════════════════════════════
              GALLERY SECTION
          ══════════════════════════════════════════════════ */}
          {activeSection === 'gallery' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-coffee-500 text-sm">{galleryImages.length} images</p>
                <div className="flex gap-3">
                  <button onClick={fetchGallery} className="p-2 text-coffee-500 hover:text-accent rounded-lg hover:bg-coffee-100 transition-all"><RefreshCw size={16} /></button>
                  <button
                    onClick={() => setAddingByUrl(v => !v)}
                    className="px-4 py-2 text-sm font-bold border border-coffee-200 text-coffee-700 rounded-xl hover:bg-coffee-50 transition-all flex items-center gap-2"
                  >
                    <LinkIcon size={14} /> Add by URL
                  </button>
                  <label className="px-4 py-2 text-sm font-bold bg-accent text-white rounded-xl hover:bg-orange-600 transition-all flex items-center gap-2 cursor-pointer">
                    <Plus size={14} /> Upload
                    <input type="file" accept="image/*" className="hidden" onChange={handleGalleryUpload} />
                  </label>
                </div>
              </div>

              {/* Add by URL form */}
              <AnimatePresence>
                {addingByUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="bg-white rounded-2xl border border-coffee-200 p-5 flex gap-3"
                  >
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={e => setNewImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-grow px-4 py-2.5 bg-coffee-50 border border-coffee-200 rounded-xl text-sm focus:outline-none focus:border-accent"
                    />
                    <button onClick={handleAddImageByUrl} disabled={saving} className="px-5 py-2.5 bg-accent text-white text-sm font-bold rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-all">
                      {saving ? <RefreshCw size={14} className="animate-spin" /> : 'Add'}
                    </button>
                    <button onClick={() => { setAddingByUrl(false); setNewImageUrl(''); }} className="px-4 py-2.5 text-sm font-bold text-coffee-600 hover:bg-coffee-50 rounded-xl transition-all">Cancel</button>
                  </motion.div>
                )}
              </AnimatePresence>

              {galleryImages.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-coffee-100">
                  <Image size={40} className="text-coffee-200 mx-auto mb-3" />
                  <p className="text-coffee-500 font-bold">No images yet</p>
                  <p className="text-coffee-400 text-sm">Upload an image or add one by URL.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleryImages.map(img => (
                    <div key={img.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-coffee-100">
                      <img src={img.url} alt={img.caption} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-coffee-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-3">
                        <p className="text-white text-xs font-bold text-center line-clamp-2">{img.caption || img.category}</p>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingGallery(img)} className="p-2 bg-white/20 hover:bg-white/40 rounded-lg text-white transition-all"><Edit2 size={14} /></button>
                          <button
                            onClick={async () => {
                              if (!confirm('Delete this image?')) return;
                              await galleryService.deleteImage(img.id);
                              fetchGallery();
                              showStatus('success', 'Image deleted.');
                            }}
                            className="p-2 bg-red-500/30 hover:bg-red-500/50 rounded-lg text-red-100 transition-all"
                          ><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Edit gallery image modal */}
              <AnimatePresence>
                {editingGallery && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-7 space-y-5"
                    >
                      <h3 className="font-bold text-coffee-950">Edit Image</h3>
                      {editingGallery.url && <img src={editingGallery.url} alt="" className="w-full aspect-video rounded-xl object-cover" />}
                      <div>
                        <label className="block text-xs font-bold text-coffee-600 mb-1.5">Caption</label>
                        <input
                          type="text"
                          value={editingGallery.caption || ''}
                          onChange={e => setEditingGallery({ ...editingGallery, caption: e.target.value })}
                          className="w-full px-4 py-2.5 bg-coffee-50 border border-coffee-200 rounded-xl text-sm focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-coffee-600 mb-1.5">Category</label>
                        <input
                          type="text"
                          value={editingGallery.category || ''}
                          onChange={e => setEditingGallery({ ...editingGallery, category: e.target.value })}
                          placeholder="e.g. Interior, Coffee, Events"
                          className="w-full px-4 py-2.5 bg-coffee-50 border border-coffee-200 rounded-xl text-sm focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div className="flex gap-3 pt-1">
                        <button onClick={() => setEditingGallery(null)} className="flex-1 px-4 py-2.5 text-sm font-bold text-coffee-600 bg-coffee-50 rounded-xl hover:bg-coffee-100 transition-all">Cancel</button>
                        <button
                          onClick={async () => {
                            if (!editingGallery.id) return;
                            await galleryService.updateImage(editingGallery.id, { caption: editingGallery.caption, category: editingGallery.category });
                            setEditingGallery(null);
                            fetchGallery();
                            showStatus('success', 'Image updated!');
                          }}
                          className="flex-1 px-4 py-2.5 text-sm font-bold bg-accent text-white rounded-xl hover:bg-orange-600 transition-all"
                        >Save</button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}


          {/* ══════════════════════════════════════════════════
              CONTENT SECTIONS (Brand, Home, Menu, About, Contact, Footer, Navigation, Raw)
          ══════════════════════════════════════════════════ */}
          {activeSection === 'brand' && (
            <div className="bg-white rounded-2xl border border-coffee-100 p-7 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-coffee-700 mb-2">Brand Name</label>
                  <input type="text" value={localContent.brand.name} onChange={e => updateNestedContent('brand.name', e.target.value)}
                    className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-coffee-700 mb-2">Brand Suffix</label>
                  <input type="text" value={localContent.brand.suffix} onChange={e => updateNestedContent('brand.suffix', e.target.value)}
                    className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-coffee-700 mb-2">Tagline</label>
                <input type="text" value={localContent.brand.tagline} onChange={e => updateNestedContent('brand.tagline', e.target.value)}
                  className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-sm font-bold text-coffee-700 mb-2">Description</label>
                <textarea value={localContent.brand.description} onChange={e => updateNestedContent('brand.description', e.target.value)} rows={3}
                  className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent resize-none" />
              </div>
            </div>
          )}

          {activeSection === 'home' && (
            <div className="bg-white rounded-2xl border border-coffee-100 p-7 space-y-6">
              <div>
                <h3 className="font-bold text-coffee-950 mb-4 pb-3 border-b border-coffee-100">Hero Section</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-coffee-700 mb-2">Headline (HTML allowed)</label>
                    <input type="text" value={localContent.home.hero.headline} onChange={e => updateNestedContent('home.hero.headline', e.target.value)}
                      className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-coffee-700 mb-2">Subheadline</label>
                    <textarea value={localContent.home.hero.subheadline} onChange={e => updateNestedContent('home.hero.subheadline', e.target.value)} rows={2}
                      className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-coffee-700 mb-2">Background Image URL</label>
                    <input type="url" value={localContent.home.hero.backgroundImage} onChange={e => updateNestedContent('home.hero.backgroundImage', e.target.value)}
                      className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-coffee-700 mb-2">Primary CTA Button</label>
                      <input type="text" value={localContent.home.hero.primaryCTA} onChange={e => updateNestedContent('home.hero.primaryCTA', e.target.value)}
                        className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-coffee-700 mb-2">Secondary CTA Button</label>
                      <input type="text" value={localContent.home.hero.secondaryCTA} onChange={e => updateNestedContent('home.hero.secondaryCTA', e.target.value)}
                        className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent" />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-coffee-950 mb-4 pb-3 border-b border-coffee-100">Final CTA Section</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-coffee-700 mb-2">Headline</label>
                    <input type="text" value={localContent.home.finalCTA.headline} onChange={e => updateNestedContent('home.finalCTA.headline', e.target.value)}
                      className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-coffee-700 mb-2">Subheadline</label>
                    <input type="text" value={localContent.home.finalCTA.subheadline} onChange={e => updateNestedContent('home.finalCTA.subheadline', e.target.value)}
                      className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'menu' && (
            <div className="bg-white rounded-2xl border border-coffee-100 p-7 space-y-5">
              <div>
                <label className="block text-sm font-bold text-coffee-700 mb-2">Menu Page Headline</label>
                <input type="text" value={localContent.menu.headline} onChange={e => updateNestedContent('menu.headline', e.target.value)}
                  className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-sm font-bold text-coffee-700 mb-2">Description</label>
                <textarea value={localContent.menu.description} onChange={e => updateNestedContent('menu.description', e.target.value)} rows={3}
                  className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent resize-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-coffee-700 mb-2">Search Placeholder</label>
                <input type="text" value={localContent.menu.searchPlaceholder} onChange={e => updateNestedContent('menu.searchPlaceholder', e.target.value)}
                  className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-sm font-bold text-coffee-700 mb-2">Categories (comma separated)</label>
                <input type="text" value={localContent.menu.categories?.join(', ')} onChange={e => updateNestedContent('menu.categories', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
                  className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent" />
              </div>
            </div>
          )}

          {activeSection === 'contact' && (
            <div className="bg-white rounded-2xl border border-coffee-100 p-7 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-coffee-700 mb-2">Page Headline</label>
                  <input type="text" value={localContent.contact.headline} onChange={e => updateNestedContent('contact.headline', e.target.value)}
                    className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-coffee-700 mb-2">Phone</label>
                  <input type="text" value={localContent.contact.phone} onChange={e => updateNestedContent('contact.phone', e.target.value)}
                    className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-coffee-700 mb-2">Email</label>
                  <input type="email" value={localContent.contact.email} onChange={e => updateNestedContent('contact.email', e.target.value)}
                    className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-coffee-700 mb-2">Address</label>
                  <input type="text" value={localContent.contact.address} onChange={e => updateNestedContent('contact.address', e.target.value)}
                    className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-coffee-700 mb-2">Opening Hours</label>
                <textarea value={localContent.contact.hours} onChange={e => updateNestedContent('contact.hours', e.target.value)} rows={3}
                  className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent resize-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-coffee-700 mb-2">Google Maps Embed URL</label>
                <input type="url" value={localContent.contact.mapUrl} onChange={e => updateNestedContent('contact.mapUrl', e.target.value)}
                  className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent" />
              </div>
            </div>
          )}

          {activeSection === 'about' && (
            <div className="bg-white rounded-2xl border border-coffee-100 p-7 space-y-5">
              <div>
                <label className="block text-sm font-bold text-coffee-700 mb-2">Hero Headline (HTML allowed)</label>
                <input type="text" value={localContent.about.hero.headline} onChange={e => updateNestedContent('about.hero.headline', e.target.value)}
                  className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-sm font-bold text-coffee-700 mb-2">Description</label>
                <textarea value={localContent.about.hero.description} onChange={e => updateNestedContent('about.hero.description', e.target.value)} rows={4}
                  className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent resize-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-coffee-700 mb-2">Hero Image URL</label>
                <input type="url" value={localContent.about.hero.image} onChange={e => updateNestedContent('about.hero.image', e.target.value)}
                  className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-sm font-bold text-coffee-700 mb-2">Team Section Description</label>
                <textarea value={localContent.about.team.description} onChange={e => updateNestedContent('about.team.description', e.target.value)} rows={3}
                  className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent resize-none" />
              </div>
            </div>
          )}

          {activeSection === 'footer' && (
            <div className="bg-white rounded-2xl border border-coffee-100 p-7 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-bold text-coffee-700 mb-2">Instagram URL</label>
                  <input type="text" value={localContent.footer.social.instagram} onChange={e => updateNestedContent('footer.social.instagram', e.target.value)}
                    className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-coffee-700 mb-2">Facebook URL</label>
                  <input type="text" value={localContent.footer.social.facebook} onChange={e => updateNestedContent('footer.social.facebook', e.target.value)}
                    className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-coffee-700 mb-2">Twitter URL</label>
                  <input type="text" value={localContent.footer.social.twitter} onChange={e => updateNestedContent('footer.social.twitter', e.target.value)}
                    className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-coffee-700 mb-2">Newsletter Headline</label>
                <input type="text" value={localContent.footer.newsletter.headline} onChange={e => updateNestedContent('footer.newsletter.headline', e.target.value)}
                  className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-sm font-bold text-coffee-700 mb-2">Newsletter Description</label>
                <input type="text" value={localContent.footer.newsletter.description} onChange={e => updateNestedContent('footer.newsletter.description', e.target.value)}
                  className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent" />
              </div>
            </div>
          )}

          {activeSection === 'navigation' && (
            <div className="bg-white rounded-2xl border border-coffee-100 p-7 space-y-4">
              <p className="text-sm text-coffee-500">Edit navigation link names. Paths should not be changed unless pages are renamed.</p>
              {localContent.navigation.map((link: any, idx: number) => (
                <div key={idx} className="flex gap-4 items-center">
                  <input
                    type="text"
                    value={link.name}
                    onChange={e => {
                      const nav = [...localContent.navigation];
                      nav[idx] = { ...nav[idx], name: e.target.value };
                      updateNestedContent('navigation', nav);
                    }}
                    className="flex-1 px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-xl focus:outline-none focus:border-accent"
                  />
                  <span className="text-coffee-400 text-sm font-mono bg-coffee-50 px-3 py-3 rounded-xl border border-coffee-200">{link.path}</span>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'raw' && (
            <div className="bg-white rounded-2xl border border-coffee-100 p-7">
              <p className="text-sm text-coffee-500 mb-4">Edit the full site content JSON directly. Changes are saved when you click "Save Changes".</p>
              <textarea
                value={JSON.stringify(localContent, null, 2)}
                onChange={e => { try { setLocalContent(JSON.parse(e.target.value)); } catch { } }}
                rows={30}
                className="w-full px-4 py-4 bg-coffee-950 text-green-400 font-mono text-xs rounded-xl focus:outline-none border border-coffee-800 resize-y"
              />
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
