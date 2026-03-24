/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import About from './pages/About';
import Order from './pages/Order';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import { useCart } from './hooks/useCart';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const { cart, addToCart, removeFromCart, updateQuantity, itemCount, total } = useCart();

  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Navbar itemCount={itemCount} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu addToCart={addToCart} />} />
            <Route path="/about" element={<About />} />
            <Route path="/order" element={<Order cart={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart} total={total} />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <Footer />

        {/* Mobile Sticky CTA */}
        <div className="md:hidden fixed bottom-6 left-6 right-6 z-40">
          <a
            href="/order"
            className="flex items-center justify-between bg-accent text-white px-6 py-4 rounded-2xl shadow-2xl font-bold"
          >
            <span>Order Now</span>
            <div className="flex items-center gap-2">
              <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs">{itemCount} items</span>
              <span className="text-lg">${total.toFixed(2)}</span>
            </div>
          </a>
        </div>
      </div>
    </Router>
  );
}
