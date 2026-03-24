import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import siteContent from '../data/site-content.json';

export default function Contact() {
  const { contact } = siteContent;

  return (
    <div className="pt-24 min-h-screen bg-coffee-50">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl mb-4">{contact.headline}</h1>
          <p className="text-coffee-600">{contact.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Info & Form */}
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-coffee-100 shadow-sm">
                <MapPin className="text-accent mb-4" size={24} />
                <h3 className="font-bold mb-2">Our Address</h3>
                <p className="text-sm text-coffee-600">{contact.address}</p>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-coffee-100 shadow-sm">
                <Clock className="text-accent mb-4" size={24} />
                <h3 className="font-bold mb-2">Opening Hours</h3>
                <p className="text-sm text-coffee-600 whitespace-pre-line">{contact.hours}</p>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-coffee-100 shadow-sm">
                <Phone className="text-accent mb-4" size={24} />
                <h3 className="font-bold mb-2">Call Us</h3>
                <p className="text-sm text-coffee-600">{contact.phone}</p>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-coffee-100 shadow-sm">
                <Mail className="text-accent mb-4" size={24} />
                <h3 className="font-bold mb-2">Email Us</h3>
                <p className="text-sm text-coffee-600">{contact.email}</p>
              </div>
            </div>

            <div className="bg-coffee-950 text-white p-10 rounded-3xl shadow-xl">
              <h3 className="text-2xl font-bold mb-6">Send a Message</h3>
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Name"
                    className="bg-coffee-900 border border-coffee-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent w-full"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="bg-coffee-900 border border-coffee-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent w-full"
                  />
                </div>
                <textarea
                  placeholder="Your message"
                  rows={4}
                  className="bg-coffee-900 border border-coffee-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent w-full"
                ></textarea>
                <button className="w-full bg-accent text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-all">
                  Send Message <Send size={18} />
                </button>
              </form>
            </div>
          </div>

          {/* Map */}
          <div className="h-full min-h-[500px] rounded-3xl overflow-hidden border-8 border-white shadow-xl relative">
            <iframe
              src={contact.mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title={`${siteContent.brand.name} Location`}
            ></iframe>
            <div className="absolute bottom-6 left-6 right-6 bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
              <div>
                <h4 className="font-bold">{siteContent.brand.name} Main</h4>
                <p className="text-xs text-coffee-500">Open until 9:00 PM</p>
              </div>
              <button className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-bold">Directions</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
