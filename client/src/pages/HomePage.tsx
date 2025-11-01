import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Package, Calculator, Shield, Truck, Phone } from 'lucide-react';

const HomePage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const featuredCategories = [
    {
      id: 1,
      name: 'Glass Mosaics',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      description: 'Premium glass mosaic tiles for stunning designs',
      link: '/products?category=glass-mosaic'
    },
    {
      id: 2,
      name: 'Ceramic Tiles',
      image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
      description: 'Durable and versatile ceramic tile solutions',
      link: '/products?category=ceramic'
    },
    {
      id: 3,
      name: 'Custom Murals',
      image: 'https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=800',
      description: 'Bespoke tile murals for unique spaces',
      link: '/products?category=mural'
    }
  ];

  const features = [
    {
      icon: <Package className="w-8 h-8" />,
      title: 'Premium Quality',
      description: 'Curated selection of high-quality tiles from trusted manufacturers'
    },
    {
      icon: <Calculator className="w-8 h-8" />,
      title: 'Instant Quotes',
      description: 'Real-time pricing calculator for accurate project estimates'
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: 'Fast Delivery',
      description: 'Reliable shipping across Turkey and international markets'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Quality Guarantee',
      description: 'All products backed by manufacturer warranties'
    }
  ];

  const stats = [
    { value: '2000+', label: 'Products' },
    { value: '500+', label: 'Happy Clients' },
    { value: '15+', label: 'Years Experience' },
    { value: '24/7', label: 'Support' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - MSI Inspired */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1600)',
          }}
        />
        
        <div className={`relative z-10 text-center px-4 max-w-5xl mx-auto transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-6 h-6 text-sky-400 mr-2" />
            <span className="text-sky-400 font-semibold tracking-wider uppercase text-sm">Premium B2B Platform</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Transform Spaces with
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">
              Premium Tiles
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto">
            Your trusted partner for glass mosaics, ceramic tiles, and custom murals. 
            Serving professionals with quality products and exceptional service.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="group px-8 py-4 bg-sky-500 text-white rounded-lg font-semibold hover:bg-sky-600 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Browse Products
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              to="/configurator"
              className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
            >
              <Calculator className="mr-2 w-5 h-5" />
              Calculate Price
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-sky-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Explore Our Collections
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover premium tiles and mosaics for every project
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredCategories.map((category, index) => (
              <Link
                key={category.id}
                to={category.link}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="aspect-square">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                  <p className="text-gray-200 mb-4">{category.description}</p>
                  <div className="flex items-center text-sky-400 font-semibold group-hover:translate-x-2 transition-transform">
                    Explore Collection
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-sky-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose ERSOZ INC
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're committed to providing the best experience for our B2B partners
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-600 rounded-lg flex items-center justify-center text-white mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-sky-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl text-sky-100 mb-10">
            Get instant quotes, access our full catalog, and experience premium B2B service
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-sky-600 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Create Account
            </Link>
            
            <a
              href="tel:+905551234567"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-sky-600 transition-all duration-300 flex items-center justify-center"
            >
              <Phone className="mr-2 w-5 h-5" />
              Contact Sales
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
