import { motion } from 'motion/react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, CreditCard } from 'lucide-react';
import { CartItem } from '../hooks/useCart';
import { Link } from 'react-router-dom';

interface OrderProps {
  cart: CartItem[];
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  total: number;
}

export default function Order({ cart, updateQuantity, removeFromCart, total }: OrderProps) {
  const shipping = cart.length > 0 ? 2.50 : 0;
  const grandTotal = total + shipping;

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
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
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 hover:bg-white rounded-md transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-10 text-center font-bold">{item.quantity}</span>
                        <button
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
                    <span>Service Fee</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-coffee-100 pt-4 flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span className="text-accent">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2 p-1 bg-coffee-50 rounded-xl mb-6">
                    <button className="flex-1 py-2 rounded-lg bg-white shadow-sm text-sm font-bold">Pickup</button>
                    <button className="flex-1 py-2 rounded-lg text-sm font-bold text-coffee-500">Delivery</button>
                  </div>

                  <button className="w-full bg-coffee-950 text-white py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-accent transition-all">
                    <CreditCard size={20} /> Checkout Now
                  </button>
                  <p className="text-center text-xs text-coffee-400 mt-4">
                    Secure payment powered by HAHA-Pay
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
