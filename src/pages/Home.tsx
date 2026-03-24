import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Wifi, Battery, Coffee } from 'lucide-react';
import { MENU_ITEMS } from '../data/menu';
import siteContent from '../data/site-content.json';

const IconMap: Record<string, any> = {
  wifi: Wifi,
  battery: Battery,
  coffee: Coffee,
  star: Star
};

export default function Home() {
  const featuredItems = MENU_ITEMS.filter(item => item.popular).slice(0, 4);
  const { hero, socialProof, experience, finalCTA } = siteContent.home;

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-coffee-950">
        <div className="absolute inset-0 z-0">
          <img
            src={hero.backgroundImage}
            alt="Aesthetic Coffee"
            className="w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-coffee-950/50 to-coffee-950" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 
              className="text-5xl md:text-8xl font-display font-bold text-white mb-6 leading-tight"
              dangerouslySetInnerHTML={{ __html: hero.headline }}
            />
            <p className="text-lg md:text-2xl text-coffee-200 mb-10 max-w-2xl mx-auto text-balance">
              {hero.subheadline}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/order"
                className="w-full sm:w-auto bg-accent text-white px-10 py-4 rounded-full text-lg font-bold hover:bg-orange-600 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                {hero.primaryCTA} <ArrowRight size={20} />
              </Link>
              <Link
                to="/menu"
                className="w-full sm:w-auto bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-4 rounded-full text-lg font-bold hover:bg-white/20 transition-all"
              >
                {hero.secondaryCTA}
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-coffee-100 border-y border-coffee-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all">
            {socialProof.map((proof, idx) => {
              const Icon = IconMap[proof.type] || Coffee;
              return (
                <div key={idx} className="flex items-center gap-2">
                  <Icon className="text-accent fill-accent" size={20} />
                  <span className="font-bold">{proof.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Menu */}
      <section className="py-24 bg-coffee-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl mb-4">Fan Favorites</h2>
              <p className="text-coffee-600">The most loved brews and bites at HAHA.</p>
            </div>
            <Link to="/menu" className="hidden md:flex items-center gap-2 text-accent font-bold hover:underline">
              Full Menu <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-coffee-100"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <span className="text-accent font-bold">${item.price.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-coffee-600 mb-4 line-clamp-2">{item.description}</p>
                  <Link
                    to="/order"
                    className="w-full block text-center py-2 rounded-xl border border-coffee-200 text-sm font-bold hover:bg-coffee-900 hover:text-white transition-colors"
                  >
                    Add to Order
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-24 bg-coffee-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 
                className="text-4xl md:text-6xl mb-8 leading-tight"
                dangerouslySetInnerHTML={{ __html: experience.headline }}
              />
              <div className="space-y-8">
                {experience.features.map((feature, idx) => {
                  const Icon = IconMap[feature.icon] || Coffee;
                  return (
                    <div key={idx} className="flex gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center shrink-0">
                        <Icon className="text-accent" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-2">{feature.title}</h4>
                        <p className="text-coffee-300">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-3xl overflow-hidden">
                <img
                  src={experience.image}
                  alt="Cafe Vibe"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-accent p-8 rounded-3xl hidden md:block">
                <p className="text-4xl font-display font-bold">{experience.badge}</p>
                <p className="text-sm opacity-80 mt-2">{experience.badgeAuthor}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-accent">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-8">{finalCTA.headline}</h2>
          <p className="text-xl mb-12 opacity-90">{finalCTA.subheadline}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/order"
              className="bg-white text-accent px-12 py-4 rounded-full text-xl font-bold hover:bg-coffee-950 hover:text-white transition-all transform hover:scale-105"
            >
              {finalCTA.primaryButton}
            </Link>
            <Link
              to="/contact"
              className="bg-transparent border-2 border-white text-white px-12 py-4 rounded-full text-xl font-bold hover:bg-white hover:text-accent transition-all"
            >
              {finalCTA.secondaryButton}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
