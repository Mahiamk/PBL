import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, fetchServices } from '../lib/api';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Scissors } from 'lucide-react';
import bannerOne from '../assets/banner-one.png';
import bowlWhite from '../assets/bowl-white.jpg';

const Home = () => {

  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);

  // Newsletter state and handler
  const [email, setEmail] = useState("");
  const [confirmation, setConfirmation] = useState(false);
  const [error, setError] = useState("");

  async function handleSubscribe(e) {
    e.preventDefault();
    setError("");
    try {
      // Dynamically import to avoid circular dependency
      const { subscribeNewsletter } = await import('../lib/api');
      await subscribeNewsletter(email);
      setConfirmation(true);
      setEmail("");
      setTimeout(() => setConfirmation(false), 5000);
    } catch (err) {
      setError(err?.response?.data?.detail || "Subscription failed. Try again.");
    }
  }


  useEffect(() => {
    fetchProducts().then(setProducts).catch(console.error);
    fetchServices().then(setServices).catch(console.error);
  }, []);

  // Get the newest 6 products (backend sorts by ID desc)
  const featuredProducts = products.slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section - Minimalist Luxury */}
      <div className="relative h-screen max-h-[900px] flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 opacity-60">
          <img
            src={bannerOne}
            alt="Luxury Lifestyle"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <h2 className="text-sm md:text-base font-medium tracking-[0.3em] text-gray-300 uppercase mb-6 animate-fade-in-up">
            Welcome to AIU microstore platform
          </h2>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium text-white mb-8 tracking-tight leading-tight animate-fade-in-up delay-100">
            Elevate Your <br/> Lifestyle
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-12 font-light leading-relaxed animate-fade-in-up delay-200">
            Discover a curated ecosystem of premium services and exquisite products. 
            Where affordability meets convenience.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up delay-300">
            <Link
              to="/shop"
              className="group relative px-8 py-4 bg-white text-black min-w-[200px] transition-all duration-300 hover:bg-gray-100"
            >
              <span className="relative z-10 text-sm font-bold tracking-widest uppercase">Shop Collection</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Products - Replaces Services Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 mb-4">New Arrivals</h2>
            <div className="w-24 h-1 bg-black mx-auto mb-6"></div>
            <p className="text-gray-500 max-w-2xl mx-auto font-light text-lg">
              Explore our latest additions, curated for quality and style.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {featuredProducts.map((product) => (
              <div key={product.product_id} className="group">
                <ProductCard 
                  product={product} 
                  image={product.image_url || bowlWhite} 
                />
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link to="/shop" className="inline-flex items-center text-gray-900 font-medium hover:text-gray-600 transition-colors uppercase tracking-widest text-sm">
              View All Products <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter / Footer Teaser */}
      {/* Featured Services Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 mb-4">Our Premium Services</h2>
            <div className="w-24 h-1 bg-black mx-auto mb-6"></div>
            <p className="text-gray-500 max-w-2xl mx-auto font-light text-lg">
              Experience affordable and user friendly services from our expert partners.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.slice(0, 8).map((service) => (
              <div key={service.service_id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                 <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
                   {service.image_url ? (
                      <img src={service.image_url} alt={service.service_name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Scissors className="h-10 w-10 text-gray-300" />
                      </div>
                   )}
                 </div>
                 <div className="p-4">
                    <h3 className="font-medium text-gray-900">{service.service_name}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{service.service_desc}</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="font-bold text-gray-900">${Number(service.service_price).toFixed(2)}</span>
                       {/* Basic routing logic - default to barber shop route which handles dynamic data now */}
                      <Link 
                        to={service.store_name?.toLowerCase().includes('barber') ? `/shops/barber/${service.store_id}` : 
                            service.store_name?.toLowerCase().includes('tailor') ? `/shops/tailor` : 
                            `/shops/barber/${service.store_id}`}
                        className="text-xs font-bold uppercase tracking-wider text-black border-b border-black hover:opacity-70"
                      >
                        Book Now
                      </Link>
                    </div>
                 </div>
              </div>
            ))}
             {services.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-10">
                    No services available at the moment.
                </div>
            )}
          </div>
          
           <div className="mt-16 text-center">
            <Link to="/shops" className="inline-flex items-center text-gray-900 font-medium hover:text-gray-600 transition-colors uppercase tracking-widest text-sm">
              View All Services <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-10 bg-black text-white text-center px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-serif mb-4">Join the Exclusive List</h2>
          <p className="text-gray-400 mb-6 font-light text-lg">
            Be the first to know about new collections, exclusive events, and personalized offers.
          </p>
          {confirmation ? (
            <div className="text-green-400 font-semibold py-4 transition-opacity duration-500">Thank you for subscribing!</div>
          ) : (
            <>
              {error && (
                <div className="text-red-400 font-semibold py-2">{error}</div>
              )}
              <form className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto" onSubmit={handleSubscribe}>
                <input 
                  type="email" 
                  placeholder="Your Email Address" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-transparent border-b border-gray-700 py-2 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors w-full"
                  required
                />
                <button className="bg-white text-black px-8 py-2 font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
                  Subscribe
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
