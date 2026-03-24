import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, CreditCard, CheckCircle, RefreshCw } from 'lucide-react';
import { CartItem } from '../hooks/useCart';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { cn } from '../lib/utils';

interface OrderProps {
  cart: CartItem[];
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  total: number;
}

export default function Order({ cart, updateQuantity, removeFromCart, clearCart, total }: OrderProps) {
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const shipping = orderType === 'delivery' ? 2.50 : 0;
  const grandTotal = total + shipping;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsCheckingOut(true);
    try {
      const orderData = {
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        total_amount: grandTotal,
        order_type: orderType,
        address: orderType === 'delivery' ? customerInfo.address : undefined
      };

      const result = await orderService.createOrder(orderData as any);
      if (result) {
        setOrderSuccess(result.id);
        clearCart();
      }
    } catch (err) {
      console.error('Checkout failed:', err);
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="pt-24 pb-24 min-h-screen bg-coffee-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-10 rounded-3xl border border-coffee-200 shadow-xl text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-bold mb-4">Order Confirmed!</h2>
          <p className="text-coffee-600 mb-2">Order ID: <span className="font-mono text-xs text-coffee-400">{orderSuccess}</span></p>
          <p className="text-coffee-600 mb-8">We've received your order and we're starting to brew it right now.</p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 bg-coffee-950 text-white px-8 py-3 rounded-full font-bold hover:bg-accent transition-all"
          >
            Order More <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-24 min-h-screen bg-coffee-50">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-display font-bold mb-12">Your Order</h1>

        {cart.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-coffee-200 shadow-sm">
            <div className="w-20 h-20 bg-coffee-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={40} className="text-coffee-400" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-coffee-600 mb-8">Looks like you haven't added any treats yet.</p>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 bg-accent text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition-all"
            >
              Browse Menu <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items & Details */}
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-coffee-900">Items in Cart</h3>
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-6 rounded-3xl border border-coffee-100 shadow-sm flex gap-6 items-center"
                  >
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{item.name}</h3>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-coffee-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <p className="text-sm text-coffee-500 mb-4 line-clamp-1">{item.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center bg-coffee-50 rounded-lg p-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 hover:bg-white rounded-md transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-10 text-center font-bold">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 hover:bg-white rounded-md transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <span className="font-bold text-accent">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="bg-white p-8 rounded-3xl border border-coffee-100 shadow-sm space-y-6">
                <h3 className="text-xl font-bold text-coffee-900">Your Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-coffee-700 mb-2">Full Name</label>
                    <input
                      required
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      className="w-full px-4 py-3 bg-coffee-50 border border-coffee-100 rounded-xl focus:outline-none focus:border-accent"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-coffee-700 mb-2">Email Address</label>
                    <input
                      required
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      className="w-full px-4 py-3 bg-coffee-50 border border-coffee-100 rounded-xl focus:outline-none focus:border-accent"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-coffee-700 mb-2">Phone Number</label>
                    <input
                      required
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-coffee-50 border border-coffee-100 rounded-xl focus:outline-none focus:border-accent"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  {orderType === 'delivery' && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-coffee-700 mb-2">Delivery Address</label>
                      <input
                        required
                        type="text"
                        value={customerInfo.address}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                        className="w-full px-4 py-3 bg-coffee-50 border border-coffee-100 rounded-xl focus:outline-none focus:border-accent"
                        placeholder="123 Coffee Lane, Brew City"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-3xl border border-coffee-200 shadow-sm sticky top-24">
                <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-coffee-600">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-coffee-600">
                    <span>{orderType === 'pickup' ? 'Pickup Fee' : 'Delivery Fee'}</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-coffee-100 pt-4 flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span className="text-accent">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2 p-1 bg-coffee-50 rounded-xl mb-6">
                    <button
                      type="button"
                      onClick={() => setOrderType('pickup')}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                        orderType === 'pickup' ? "bg-white shadow-sm" : "text-coffee-500"
                      )}
                    >
                      Pickup
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('delivery')}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                        orderType === 'delivery' ? "bg-white shadow-sm" : "text-coffee-500"
                      )}
                    >
                      Delivery
                    </button>
                  </div>

                  <button
                    disabled={isCheckingOut}
                    className="w-full bg-coffee-950 text-white py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-accent transition-all disabled:opacity-50"
                  >
                    {isCheckingOut ? <RefreshCw className="animate-spin" size={20} /> : <CreditCard size={20} />}
                    {isCheckingOut ? 'Processing...' : 'Place Order Now'}
                  </button>
                  <p className="text-center text-xs text-coffee-400 mt-4">
                    Secure payment powered by HAHA-Pay
                  </p>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
