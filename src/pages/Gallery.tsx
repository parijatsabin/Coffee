import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useContent } from '../context/ContentContext';
import { galleryService, GalleryImage } from '../services/galleryService';
import { RefreshCw } from 'lucide-react';

export default function Gallery() {
  const { content } = useContent();
  const { gallery } = content;
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      const data = await galleryService.getImages();
      setImages(data);
      setLoading(false);
    };
    fetchImages();
  }, []);

  const displayImages = images.length > 0 ? images.map(img => img.url) : gallery.images;

  return (
    <div className="pt-24 pb-24 min-h-screen bg-coffee-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl mb-4">{gallery.headline}</h1>
          <p className="text-coffee-600">{gallery.description}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <RefreshCw className="animate-spin text-accent" size={48} />
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
            {displayImages.map((src, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="break-inside-avoid rounded-3xl overflow-hidden border-4 border-white shadow-sm hover:shadow-xl transition-all cursor-pointer group"
              >
                <img
                  src={src}
                  alt={`Gallery ${idx}`}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-24 text-center">
          <h3 className="text-2xl font-bold mb-6">{gallery.instagramCTA}</h3>
          <button className="bg-accent text-white px-10 py-4 rounded-full font-bold hover:bg-orange-600 transition-all">
            {gallery.instagramButton}
          </button>
        </div>
      </div>
    </div>
  );
}
