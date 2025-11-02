import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Send
} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Story', href: '/story' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press Kit', href: '/press' },
    ],
    products: [
      { name: 'All Products', href: '/products' },
      { name: 'Glass Mosaics', href: '/products?category=glass-mosaic' },
      { name: 'Ceramic Tiles', href: '/products?category=ceramic' },
      { name: 'Custom Murals', href: '/products?category=mural' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Shipping Info', href: '/shipping' },
      { name: 'Returns', href: '/returns' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Sitemap', href: '/sitemap' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/ersozinc' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/ersozinc' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/ersozinc' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/ersozinc' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="container-custom pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <div>
                <span className="font-display font-bold text-xl text-white">ERSOZ INC</span>
                <span className="block text-xs text-gray-400">Premium Surfaces</span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 mb-6 max-w-sm">
              Leading manufacturer of premium tiles, mosaics, and custom surfaces. 
              Delivering excellence in design and quality since 1995.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a href="mailto:info@ersozinc.com" className="flex items-center space-x-3 text-sm hover:text-primary-400 transition-colors">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>info@ersozinc.com</span>
              </a>
              <a href="tel:+1234567890" className="flex items-center space-x-3 text-sm hover:text-primary-400 transition-colors">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+1 (234) 567-890</span>
              </a>
              <div className="flex items-start space-x-3 text-sm">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-1" />
                <span>123 Business Ave<br />New York, NY 10001</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-sm hover:text-primary-400 transition-colors inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Products</h3>
            <ul className="space-y-2">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-sm hover:text-primary-400 transition-colors inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-sm hover:text-primary-400 transition-colors inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-white mb-4">Stay Updated</h3>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe to our newsletter for latest products and offers.
            </p>
            <form className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Subscribe</span>
              </button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Copyright */}
          <div className="text-sm text-gray-400">
            © {currentYear} ERSOZ INC. All rights reserved.
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center bg-gray-800 hover:bg-primary-500 text-gray-400 hover:text-white rounded-lg transition-all duration-200"
                aria-label={social.name}
              >
                <social.icon className="w-4 h-4" />
              </a>
            ))}
          </div>

          {/* Legal Links */}
          <div className="flex items-center space-x-4 text-sm">
            {footerLinks.legal.map((link, index) => (
              <React.Fragment key={link.name}>
                <Link 
                  to={link.href} 
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  {link.name}
                </Link>
                {index < footerLinks.legal.length - 1 && (
                  <span className="text-gray-700">•</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
