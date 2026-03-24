import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu as MenuIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useContent } from '../context/ContentContext';

export default function Navbar({ itemCount }: { itemCount: number }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const { content } = useContent();

  const navLinks = content.navigation;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-coffee-50/80 backdrop-blur-md border-b border-coffee-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-display font-bold text-accent">{content.brand.name}</span>
            <span className="text-2xl font-display font-bold text-coffee-900">{content.brand.suffix}</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-accent",
                  location.pathname === link.path ? "text-accent" : "text-coffee-700"
                )}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/order"
              className="relative p-2 text-coffee-700 hover:text-accent transition-colors"
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>
            <Link
              to="/order"
              className="bg-coffee-900 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-accent transition-all transform hover:scale-105"
            >
              Order Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to="/order" className="relative p-2 text-coffee-700">
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-coffee-900"
            >
              {isOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-coffee-50 border-b border-coffee-200"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-4 text-base font-medium text-coffee-700 hover:text-accent border-b border-coffee-100"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/order"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center bg-accent text-white px-6 py-4 rounded-xl text-lg font-bold mt-4"
              >
                Order Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
