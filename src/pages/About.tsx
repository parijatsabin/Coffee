import { motion } from 'motion/react';
import { Coffee, Heart, Users, Globe } from 'lucide-react';
import { useContent } from '../context/ContentContext';

const IconMap: Record<string, any> = {
  heart: Heart,
  users: Users,
  globe: Globe,
  coffee: Coffee
};

export default function About() {
  const { content } = useContent();
  const { hero, values, team } = content.about;

  return (
    <div className="pt-24 min-h-screen bg-coffee-50">
      {/* Hero */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span className="text-accent font-bold tracking-widest uppercase text-sm mb-4 block">{hero.label}</span>
              <h1 
                className="text-4xl md:text-7xl mb-8 leading-tight"
                dangerouslySetInnerHTML={{ __html: hero.headline }}
              />
              <p className="text-lg text-coffee-600 mb-8 leading-relaxed">
                {hero.description}
              </p>
              <div className="grid grid-cols-2 gap-8">
                {hero.stats.map((stat, idx) => (
                  <div key={idx}>
                    <h4 className="text-3xl font-display font-bold text-accent mb-2">{stat.value}</h4>
                    <p className="text-sm text-coffee-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            <div className="relative">
              <div className="aspect-square rounded-full overflow-hidden border-8 border-coffee-100">
                <img
                  src={hero.image}
                  alt="Roasting Coffee"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-0 right-0 bg-accent text-white p-6 rounded-3xl shadow-xl transform rotate-12">
                <Coffee size={40} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-coffee-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl mb-4">{values.headline}</h2>
            <p className="text-coffee-600">{values.subheadline}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {values.items.map((value, idx) => {
              const Icon = IconMap[value.icon] || Heart;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-10 rounded-3xl text-center shadow-sm"
                >
                  <div className="w-16 h-16 bg-coffee-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Icon className="text-accent" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                  <p className="text-coffee-600 leading-relaxed">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team/Vibe */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl mb-12">{team.headline}</h2>
          <div className="aspect-video rounded-3xl overflow-hidden mb-12">
            <img
              src={team.image}
              alt="Team HAHA"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-xl text-coffee-600 max-w-3xl mx-auto">
            {team.description}
          </p>
        </div>
      </section>
    </div>
  );
}
