import React, { useState, useEffect } from 'react';
import { useContent } from '../context/ContentContext';
import { motion, AnimatePresence } from 'motion/react';
import { Save, RefreshCw, AlertCircle, CheckCircle, Layout, Coffee, Info, Image, Phone, LogOut, ChevronRight, Plus, Trash2, Edit2, Eye, EyeOff, Package, Clock, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { productService, Product } from '../services/productService';
import { orderService, Order } from '../services/orderService';
import { galleryService, GalleryImage } from '../services/galleryService';

type Section = 'brand' | 'navigation' | 'home' | 'menu' | 'about' | 'gallery' | 'contact' | 'footer' | 'raw' | 'products' | 'orders';

export default function Admin() {
  const { content, updateContent, loading: contentLoading } = useContent();
  const [localContent, setLocalContent] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingGalleryImage, setEditingGalleryImage] = useState<Partial<GalleryImage> | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeSection, setActiveSection] = useState<Section>('brand');
  const navigate = useNavigate();

  useEffect(() => {
    if (content) {
      setLocalContent(content);
    }
  }, [content]);

  useEffect(() => {
    if (activeSection === 'products') {
      fetchProducts();
    } else if (activeSection === 'orders') {
      fetchOrders();

      const subscription = supabase
        .channel('orders-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
          fetchOrders();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } else if (activeSection === 'gallery') {
      fetchGalleryImages();
    }
  }, [activeSection]);

  const fetchProducts = async () => {
    const data = await productService.getProducts();
    setProducts(data);
  };

  const fetchOrders = async () => {
    const data = await orderService.getOrders();
    setOrders(data);
  };

  const fetchGalleryImages = async () => {
    const data = await galleryService.getImages();
    setGalleryImages(data);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    const url = await galleryService.uploadImage(file);
    if (url) {
      await galleryService.addImage({
        url,
        caption: '',
        category: 'General'
      });
      fetchGalleryImages();
      setStatus({ type: 'success', message: 'Image uploaded successfully!' });
    } else {
      setStatus({ type: 'error', message: 'Failed to upload image.' });
    }
    setSaving(false);
    setTimeout(() => setStatus(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      await updateContent(localContent);
      setStatus({ type: 'success', message: 'Content updated successfully!' });
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to update content. Please check your connection.' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const updateNestedContent = (path: string, value: any) => {
    const newContent = JSON.parse(JSON.stringify(localContent));
    const keys = path.split('.');
    let current = newContent;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setLocalContent(newContent);
  };

  if (contentLoading || !localContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-coffee-50">
        <div className="text-center">
          <RefreshCw className="animate-spin text-accent mx-auto mb-4" size={48} />
          <p className="text-coffee-600 font-bold">Loading CMS...</p>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { id: 'brand', label: 'Brand & Identity', icon: Coffee },
    { id: 'orders', label: 'Customer Orders', icon: Package },
    { id: 'products', label: 'Product Catalog', icon: Coffee },
    { id: 'navigation', label: 'Navigation', icon: Layout },
    { id: 'home', label: 'Home Page', icon: Layout },
    { id: 'menu', label: 'Menu Config', icon: Layout },
    { id: 'about', label: 'About Us', icon: Info },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'contact', label: 'Contact Info', icon: Phone },
    { id: 'footer', label: 'Footer', icon: Layout },
    { id: 'raw', label: 'Advanced (JSON)', icon: AlertCircle },
  ];

  return (
    <div className="pt-16 min-h-screen bg-coffee-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-coffee-100 hidden md:flex flex-col fixed h-[calc(100vh-64px)]">
        <div className="p-6 flex-grow overflow-y-auto">
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as Section)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeSection === item.id
                      ? 'bg-accent text-white shadow-lg shadow-accent/20'
                      : 'text-coffee-600 hover:bg-coffee-50'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                  {activeSection === item.id && <ChevronRight size={14} className="ml-auto" />}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="p-6 border-t border-coffee-50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow md:ml-64 p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold text-coffee-950">
                {sidebarItems.find(i => i.id === activeSection)?.label}
              </h1>
              <p className="text-coffee-500">Manage your website content in real-time.</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-coffee-950 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-accent transition-all disabled:opacity-50 shadow-lg shadow-coffee-950/10"
            >
              {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? 'Saving Changes...' : 'Save All Changes'}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {status && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-2xl mb-8 flex items-center gap-3 border ${
                  status.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                }`}
              >
                {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <span className="font-bold">{status.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-white rounded-3xl shadow-sm border border-coffee-100 p-8">
            {activeSection === 'orders' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-coffee-950">Customer Orders</h3>
                  <button
                    onClick={fetchOrders}
                    className="p-2 text-coffee-600 hover:text-accent transition-all"
                  >
                    <RefreshCw size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-coffee-50 rounded-2xl border border-coffee-100 p-6 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                            order.status === 'preparing' ? 'bg-blue-100 text-blue-600' :
                            order.status === 'ready' ? 'bg-green-100 text-green-600' :
                            order.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            <Package size={24} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-coffee-950">{order.customer_name}</span>
                              <span className="text-xs px-2 py-0.5 bg-white border border-coffee-100 rounded-full text-coffee-500 uppercase font-bold">
                                {order.order_type}
                              </span>
                            </div>
                            <div className="text-sm text-coffee-500 flex items-center gap-2">
                              <Clock size={14} />
                              {new Date(order.created_at!).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <span className="text-lg font-bold text-accent">${order.total_amount.toFixed(2)}</span>
                          <div className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                            order.status === 'preparing' ? 'bg-blue-100 text-blue-600' :
                            order.status === 'ready' ? 'bg-green-100 text-green-600' :
                            order.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {order.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Detail Modal */}
                <AnimatePresence>
                  {selectedOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-950/20 backdrop-blur-sm">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                      >
                        <div className="p-6 border-b border-coffee-50 flex justify-between items-center">
                          <h3 className="text-xl font-bold text-coffee-950">Order Details</h3>
                          <button onClick={() => setSelectedOrder(null)} className="text-coffee-400 hover:text-coffee-600">
                            <XCircle size={24} />
                          </button>
                        </div>
                        <div className="p-8 overflow-y-auto flex-grow space-y-8">
                          <div className="grid grid-cols-2 gap-8">
                            <div>
                              <h4 className="text-xs font-bold text-coffee-400 uppercase tracking-wider mb-3">Customer</h4>
                              <p className="font-bold text-coffee-900">{selectedOrder.customer_name}</p>
                              <p className="text-sm text-coffee-600">{selectedOrder.customer_email}</p>
                              <p className="text-sm text-coffee-600">{selectedOrder.customer_phone}</p>
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-coffee-400 uppercase tracking-wider mb-3">Order Info</h4>
                              <p className="text-sm text-coffee-900 font-bold uppercase">{selectedOrder.order_type}</p>
                              <p className="text-xs text-coffee-500">ID: {selectedOrder.id}</p>
                              {selectedOrder.order_type === 'delivery' && (
                                <p className="text-sm text-coffee-600 mt-2 italic">Address: {selectedOrder.customer_phone}</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-coffee-400 uppercase tracking-wider mb-4">Items</h4>
                            <div className="space-y-3">
                              {selectedOrder.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2 border-b border-coffee-50 last:border-0">
                                  <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 bg-coffee-50 rounded flex items-center justify-center text-xs font-bold text-coffee-600">
                                      {item.quantity}x
                                    </span>
                                    <span className="font-bold text-coffee-900">{item.name}</span>
                                  </div>
                                  <span className="text-coffee-600">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-coffee-50 p-6 rounded-2xl flex justify-between items-center">
                            <span className="font-bold text-coffee-950">Total Amount</span>
                            <span className="text-2xl font-bold text-accent">${selectedOrder.total_amount.toFixed(2)}</span>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-coffee-400 uppercase tracking-wider mb-4">Update Status</h4>
                            <div className="flex flex-wrap gap-2">
                              {(['pending', 'preparing', 'ready', 'completed', 'cancelled'] as const).map((status) => (
                                <button
                                  key={status}
                                  onClick={async () => {
                                    await orderService.updateOrderStatus(selectedOrder.id, status);
                                    setSelectedOrder({ ...selectedOrder, status });
                                    fetchOrders();
                                  }}
                                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                    selectedOrder.status === status
                                      ? 'bg-accent text-white shadow-lg shadow-accent/20'
                                      : 'bg-coffee-50 text-coffee-600 hover:bg-coffee-100'
                                  }`}
                                >
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="p-6 border-t border-coffee-50 bg-coffee-50/50 flex justify-end">
                          <button
                            onClick={async () => {
                              if (confirm('Are you sure you want to delete this order record?')) {
                                await orderService.deleteOrder(selectedOrder.id);
                                setSelectedOrder(null);
                                fetchOrders();
                              }
                            }}
                            className="text-red-600 font-bold text-sm flex items-center gap-2 hover:underline"
                          >
                            <Trash2 size={16} /> Delete Order Record
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {activeSection === 'gallery' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-coffee-950">Gallery Management</h3>
                  <div className="flex gap-4">
                    <button
                      onClick={fetchGalleryImages}
                      className="p-2 text-coffee-600 hover:text-accent transition-all"
                    >
                      <RefreshCw size={20} />
                    </button>
                    <label className="bg-accent text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-accent/90 transition-all cursor-pointer">
                      <Plus size={18} /> Upload Image
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleGalleryUpload}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {galleryImages.map((image) => (
                    <div key={image.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-coffee-100 shadow-sm">
                      <img src={image.url} alt={image.caption} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      <div className="absolute inset-0 bg-coffee-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                        <p className="text-white text-xs font-bold mb-4 line-clamp-2">{image.caption || 'No caption'}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingGalleryImage(image)}
                            className="p-2 bg-white/20 hover:bg-white/40 rounded-lg text-white transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm('Delete this image from gallery?')) {
                                await galleryService.deleteImage(image.id);
                                fetchGalleryImages();
                              }
                            }}
                            className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-200 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Edit Gallery Image Modal */}
                <AnimatePresence>
                  {editingGalleryImage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-950/20 backdrop-blur-sm">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6"
                      >
                        <h3 className="text-xl font-bold text-coffee-950">Edit Image Details</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-coffee-600 mb-1">Caption</label>
                            <input
                              type="text"
                              value={editingGalleryImage.caption}
                              onChange={(e) => setEditingGalleryImage({ ...editingGalleryImage, caption: e.target.value })}
                              className="w-full px-3 py-2 bg-coffee-50 border border-coffee-100 rounded-lg focus:outline-none focus:border-accent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-coffee-600 mb-1">Category</label>
                            <input
                              type="text"
                              value={editingGalleryImage.category}
                              onChange={(e) => setEditingGalleryImage({ ...editingGalleryImage, category: e.target.value })}
                              className="w-full px-3 py-2 bg-coffee-50 border border-coffee-100 rounded-lg focus:outline-none focus:border-accent"
                              placeholder="e.g. Interior, Coffee, Events"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={() => setEditingGalleryImage(null)}
                            className="flex-1 px-4 py-2 bg-coffee-50 text-coffee-600 font-bold rounded-xl hover:bg-coffee-100 transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={async () => {
                              if (editingGalleryImage.id) {
                                await galleryService.updateImage(editingGalleryImage.id, {
                                  caption: editingGalleryImage.caption,
                                  category: editingGalleryImage.category
                                });
                                setEditingGalleryImage(null);
                                fetchGalleryImages();
                              }
                            }}
                            className="flex-1 px-4 py-2 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-all"
                          >
                            Save Changes
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {activeSection === 'products' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-coffee-950">Manage Products</h3>
                  <button
                    onClick={() => setEditingProduct({
                      name: '',
                      description: '',
                      price: 0,
                      category: 'Coffee',
                      image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80',
                      is_available: true
                    })}
                    className="bg-accent text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-accent/90 transition-all"
                  >
                    <Plus size={18} /> Add Product
                  </button>
                </div>

                {editingProduct && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 bg-coffee-50 rounded-2xl border border-coffee-100 space-y-4"
                  >
                    <h4 className="font-bold text-coffee-900">{editingProduct.id ? 'Edit Product' : 'New Product'}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-coffee-600 mb-1">Product Name</label>
                        <input
                          type="text"
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-coffee-100 rounded-lg focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-coffee-600 mb-1">Category</label>
                        <select
                          value={editingProduct.category}
                          onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-coffee-100 rounded-lg focus:outline-none focus:border-accent"
                        >
                          <option value="Coffee">Coffee</option>
                          <option value="Tea">Tea</option>
                          <option value="Pastry">Pastry</option>
                          <option value="Food">Food</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-coffee-600 mb-1">Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 bg-white border border-coffee-100 rounded-lg focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-coffee-600 mb-1">Image URL</label>
                        <input
                          type="text"
                          value={editingProduct.image_url}
                          onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-coffee-100 rounded-lg focus:outline-none focus:border-accent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-coffee-600 mb-1">Description</label>
                      <textarea
                        value={editingProduct.description}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 bg-white border border-coffee-100 rounded-lg focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        onClick={() => setEditingProduct(null)}
                        className="px-4 py-2 text-coffee-600 font-bold hover:bg-coffee-100 rounded-lg transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          if (editingProduct.id) {
                            await productService.updateProduct(editingProduct.id, editingProduct);
                          } else {
                            await productService.addProduct(editingProduct as any);
                          }
                          setEditingProduct(null);
                          fetchProducts();
                        }}
                        className="bg-coffee-950 text-white px-6 py-2 rounded-lg font-bold hover:bg-accent transition-all"
                      >
                        {editingProduct.id ? 'Update Product' : 'Create Product'}
                      </button>
                    </div>
                  </motion.div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-coffee-50">
                        <th className="pb-4 font-bold text-coffee-400 text-xs uppercase tracking-wider">Product</th>
                        <th className="pb-4 font-bold text-coffee-400 text-xs uppercase tracking-wider">Category</th>
                        <th className="pb-4 font-bold text-coffee-400 text-xs uppercase tracking-wider">Price</th>
                        <th className="pb-4 font-bold text-coffee-400 text-xs uppercase tracking-wider">Status</th>
                        <th className="pb-4 font-bold text-coffee-400 text-xs uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-coffee-50">
                      {products.map((product) => (
                        <tr key={product.id} className="group">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                              <div>
                                <div className="font-bold text-coffee-900">{product.name}</div>
                                <div className="text-xs text-coffee-500 line-clamp-1">{product.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="px-2 py-1 bg-coffee-50 text-coffee-600 rounded-md text-xs font-bold">
                              {product.category}
                            </span>
                          </td>
                          <td className="py-4 font-bold text-coffee-900">${product.price.toFixed(2)}</td>
                          <td className="py-4">
                            <button
                              onClick={async () => {
                                await productService.updateProduct(product.id, { is_available: !product.is_available });
                                fetchProducts();
                              }}
                              className={`flex items-center gap-1 text-xs font-bold ${product.is_available ? 'text-green-600' : 'text-red-600'}`}
                            >
                              {product.is_available ? <Eye size={14} /> : <EyeOff size={14} />}
                              {product.is_available ? 'Available' : 'Sold Out'}
                            </button>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                              <button
                                onClick={() => setEditingProduct(product)}
                                className="p-2 text-coffee-400 hover:text-accent transition-all"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm('Are you sure you want to delete this product?')) {
                                    await productService.deleteProduct(product.id);
                                    fetchProducts();
                                  }
                                }}
                                className="p-2 text-coffee-400 hover:text-red-600 transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeSection === 'brand' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-coffee-700 mb-2">Brand Name</label>
                    <input
                      type="text"
                      value={localContent.brand.name}
                      onChange={(e) => updateNestedContent('brand.name', e.target.value)}
                      className="w-full px-4 py-3 bg-coffee-50 border border-coffee-100 rounded-xl focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-coffee-700 mb-2">Brand Suffix</label>
                    <input
                      type="text"
                      value={localContent.brand.suffix}
                      onChange={(e) => updateNestedContent('brand.suffix', e.target.value)}
                      className="w-full px-4 py-3 bg-coffee-50 border border-coffee-100 rounded-xl focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-coffee-700 mb-2">Brand Description</label>
                  <textarea
                    value={localContent.brand.description}
                    onChange={(e) => updateNestedContent('brand.description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-coffee-50 border border-coffee-100 rounded-xl focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            )}

            {activeSection === 'home' && (
              <div className="space-y-8">
                <div className="border-b border-coffee-50 pb-6">
                  <h3 className="text-lg font-bold mb-4">Hero Section</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-coffee-700 mb-2">Headline (HTML allowed)</label>
                      <input
                        type="text"
                        value={localContent.home.hero.headline}
                        onChange={(e) => updateNestedContent('home.hero.headline', e.target.value)}
                        className="w-full px-4 py-3 bg-coffee-50 border border-coffee-100 rounded-xl focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-coffee-700 mb-2">Subheadline</label>
                      <textarea
                        value={localContent.home.hero.subheadline}
                        onChange={(e) => updateNestedContent('home.hero.subheadline', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-3 bg-coffee-50 border border-coffee-100 rounded-xl focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-4">Experience Section</h3>
                  <div>
                    <label className="block text-sm font-bold text-coffee-700 mb-2">Experience Headline</label>
                    <input
                      type="text"
                      value={localContent.home.experience.headline}
                      onChange={(e) => updateNestedContent('home.experience.headline', e.target.value)}
                      className="w-full px-4 py-3 bg-coffee-50 border border-coffee-100 rounded-xl focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'contact' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-coffee-700 mb-2">Phone</label>
                    <input
                      type="text"
                      value={localContent.contact.phone}
                      onChange={(e) => updateNestedContent('contact.phone', e.target.value)}
                      className="w-full px-4 py-3 bg-coffee-50 border border-coffee-100 rounded-xl focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-coffee-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={localContent.contact.email}
                      onChange={(e) => updateNestedContent('contact.email', e.target.value)}
                      className="w-full px-4 py-3 bg-coffee-50 border border-coffee-100 rounded-xl focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-coffee-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={localContent.contact.address}
                    onChange={(e) => updateNestedContent('contact.address', e.target.value)}
                    className="w-full px-4 py-3 bg-coffee-50 border border-coffee-100 rounded-xl focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-coffee-700 mb-2">Opening Hours</label>
                  <textarea
                    value={localContent.contact.hours}
                    onChange={(e) => updateNestedContent('contact.hours', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-coffee-50 border border-coffee-100 rounded-xl focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            )}

            {activeSection === 'raw' && (
              <div>
                <label className="block text-sm font-bold text-coffee-700 mb-4">
                  Full Site Content (JSON)
                </label>
                <textarea
                  value={JSON.stringify(localContent, null, 2)}
                  onChange={(e) => {
                    try {
                      setLocalContent(JSON.parse(e.target.value));
                    } catch (err) {
                      // Silently fail while typing invalid JSON
                    }
                  }}
                  rows={25}
                  className="w-full px-4 py-3 bg-coffee-950 text-coffee-100 font-mono text-sm rounded-xl focus:outline-none border border-coffee-800"
                />
              </div>
            )}

            {activeSection === 'menu' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-coffee-700 mb-2">Menu Page Headline</label>
                  <input
                    type="text"
                    value={localContent.menu.headline}
                    onChange={(e) => updateNestedContent('menu.headline', e.target.value)}
                    className="w-full px-4 py-3 bg-coffee-50 border border-coffee-100 rounded-xl focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-coffee-700 mb-2">Menu Page Description</label>
                  <textarea
                    value={localContent.menu.description}
                    onChange={(e) => updateNestedContent('menu.description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-coffee-50 border border-coffee-100 rounded-xl focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-coffee-700 mb-2">Search Placeholder</label>
                  <input
                    type="text"
                    value={localContent.menu.searchPlaceholder}
                    onChange={(e) => updateNestedContent('menu.searchPlaceholder', e.target.value)}
                    className="w-full px-4 py-3 bg-coffee-50 border border-coffee-100 rounded-xl focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-coffee-700 mb-2">Categories (Comma separated)</label>
                  <input
                    type="text"
                    value={localContent.menu.categories.join(', ')}
                    onChange={(e) => updateNestedContent('menu.categories', e.target.value.split(',').map(s => s.trim()))}
                    className="w-full px-4 py-3 bg-coffee-50 border border-coffee-100 rounded-xl focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            )}

            {/* Placeholder for other sections */}
            {['navigation', 'about', 'gallery', 'footer'].includes(activeSection) && (
              <div className="text-center py-20">
                <AlertCircle className="text-coffee-300 mx-auto mb-4" size={48} />
                <h3 className="text-xl font-bold text-coffee-950 mb-2">Section Editor Coming Soon</h3>
                <p className="text-coffee-500 mb-6">Use the "Advanced (JSON)" tab to edit this section for now.</p>
                <button
                  onClick={() => setActiveSection('raw')}
                  className="text-accent font-bold hover:underline"
                >
                  Go to JSON Editor
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
