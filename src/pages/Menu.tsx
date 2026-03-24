import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Plus, Check } from 'lucide-react';
import { MENU_ITEMS, MenuItem } from '../data/menu';
import { cn } from '../lib/utils';
import siteContent from '../data/site-content.json';

export default function Menu({ addToCart }: { addToCart: (item: MenuItem) => void }) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedId, setAddedId] = useState<string | null>(null);

  const { headline, description, categories, searchPlaceholder } = siteContent.menu;

  const filteredItems = MENU_ITEMS.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAdd = (item: MenuItem) => {
    addToCart(item);
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  return (
    <div className="pt-24 pb-24 min-h-screen bg-coffee-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl mb-4"
          >
            {headline}
          </motion.h1>
          <p className="text-coffee-600 max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-12">
          <div className="flex bg-white p-1 rounded-2xl border border-coffee-200 overflow-x-auto max-w-full">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                  activeCategory === cat ? "bg-accent text-white shadow-md" : "text-coffee-600 hover:text-accent"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-400" size={18} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-coffee-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl overflow-hidden border border-coffee-100 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  {item.popular && (
                    <div className="absolute top-4 left-4 bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Star size={10} fill="white" /> POPULAR
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg leading-tight">{item.name}</h3>
                    <span className="text-accent font-bold">${item.price.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-coffee-600 mb-6 line-clamp-2 h-10">{item.description}</p>
                  <button
                    onClick={() => handleAdd(item)}
                    className={cn(
                      "w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
                      addedId === item.id
                        ? "bg-green-500 text-white"
                        : "bg-coffee-950 text-white hover:bg-accent"
                    )}
                  >
                    {addedId === item.id ? (
                      <><Check size={18} /> Added!</>
                    ) : (
                      <><Plus size={18} /> Add to Order</>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-24">
            <p className="text-coffee-500 text-lg">No items found matching your search.</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
              className="mt-4 text-accent font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Star({ size, fill }: { size: number, fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
