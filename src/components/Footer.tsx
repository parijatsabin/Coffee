import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone } from 'lucide-react';
import siteContent from '../data/site-content.json';

export default function Footer() {
  return (
    <footer className="bg-coffee-950 text-coffee-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-display font-bold text-accent">{siteContent.brand.name}</span>
              <span className="text-2xl font-display font-bold text-white">{siteContent.brand.suffix}</span>
            </Link>
            <p className="text-coffee-300 text-sm leading-relaxed">
              {siteContent.brand.description}
            </p>
            <div className="flex space-x-4 pt-2">
              <a href={siteContent.footer.social.instagram} className="hover:text-accent transition-colors"><Instagram size={20} /></a>
              <a href={siteContent.footer.social.facebook} className="hover:text-accent transition-colors"><Facebook size={20} /></a>
              <a href={siteContent.footer.social.twitter} className="hover:text-accent transition-colors"><Twitter size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6">Explore</h4>
            <ul className="space-y-4 text-sm text-coffee-300">
              {siteContent.navigation.map(link => (
                <li key={link.path}><Link to={link.path} className="hover:text-accent transition-colors">{link.name}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm text-coffee-300">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-accent shrink-0" />
                <span>{siteContent.contact.address}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-accent shrink-0" />
                <span>{siteContent.contact.phone}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-accent shrink-0" />
                <span>{siteContent.contact.email}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-bold mb-6">{siteContent.footer.newsletter.headline}</h4>
            <p className="text-sm text-coffee-300 mb-4">{siteContent.footer.newsletter.description}</p>
            <form className="flex">
              <input
                type="email"
                placeholder={siteContent.footer.newsletter.placeholder}
                className="bg-coffee-900 border border-coffee-800 rounded-l-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-accent"
              />
              <button className="bg-accent text-white px-4 py-2 rounded-r-lg text-sm font-bold hover:bg-orange-600 transition-colors">
                {siteContent.footer.newsletter.button}
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-coffee-900 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-coffee-500 space-y-4 md:space-y-0">
          <p>© 2026 {siteContent.brand.name}-{siteContent.brand.suffix}. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-coffee-300">Privacy Policy</a>
            <a href="#" className="hover:text-coffee-300">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
