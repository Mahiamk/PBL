import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VendorRegister from './pages/VendorRegister';
import SelectUserType from './pages/SelectUserType';
import Cart from './pages/Cart';
import Shop from './pages/Shop';
import ShopsHub from './pages/ShopsHub';
import { BarberShop, Tailor, ComputerShop, BottleShop, ClothingShop, DrinkShop, Massage } from './shops';
import ProductDetail from './pages/ProductDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import VendorDashboard from './pages/vendor/dashboard/VendorDashboard';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import Invoice from './pages/Invoice';

// Import specific vendor dashboards
import BarberDashboard from './pages/vendor/barber/Dashboard';
import TailorDashboard from './pages/vendor/tailor/Dashboard';
import TechDashboard from './pages/vendor/tech/Dashboard';
import ClothingShopDashboard from './pages/vendor/clothesshop/Dashboard';
// Add other imports as needed if files exist, e.g.:
// import BottleShopDashboard from './pages/vendor/bottleshop/Dashboard';
// import ClothingShopDashboard from './pages/vendor/clothesshop/Dashboard';
// import DrinkShopDashboard from './pages/vendor/drinkshop/Dashboard';
// import MassageDashboard from './pages/vendor/massage/Dashboard';

import { ShoppingBag, User, LogOut, ShoppingCart, Search, Menu, X } from 'lucide-react';

import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';

const NavBar = () => {
  const { user, logout } = useAuth();
  const { cartCount, openCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Hide NavBar on vendor dashboard routes
  if (location.pathname.startsWith('/vendor')) {
    return null;
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary md:hidden mr-2 transition-transform duration-200 active:scale-95"
            >
              <div className="relative w-6 h-6">
                <Menu 
                  className={`absolute inset-0 w-6 h-6 transition-all duration-300 transform ${
                    isMenuOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
                  }`} 
                />
                <X 
                  className={`absolute inset-0 w-6 h-6 transition-all duration-300 transform ${
                    isMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
                  }`} 
                />
              </div>
            </button>
            <Link to="/" className="flex-shrink-0 flex items-center">
              <ShoppingBag className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">AIU microstore</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link to="/" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Home
              </Link>
              <Link to="/shops" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Stores
              </Link>
              <Link to="/shop" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                All Products
              </Link>
              {user && user.role === 'customer' && (
                <Link to="/customer" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-end">
            <div className="max-w-lg w-full lg:max-w-xs">
              <label htmlFor="search" className="sr-only">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <form onSubmit={handleSearch}>
                  <input
                    id="search"
                    name="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="Search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 ml-4">
            <button onClick={openCart} className="p-2 rounded-full text-gray-400 hover:text-gray-500 relative">
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-2">
                <Link 
                  to={user.role === 'admin' ? '/admin' : user.role === 'vendor' ? '/vendor' : '/customer'} 
                  className="p-2 rounded-full text-gray-400 hover:text-gray-500"
                  title="Profile"
                >
                  <User className="h-6 w-6" />
                </Link>
                <button onClick={logout} className="p-2 rounded-full text-gray-400 hover:text-gray-500" title="Sign Out">
                  <LogOut className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors">
                <User className="h-5 w-5" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu with transition */}
      <div 
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pt-2 pb-3 space-y-1 bg-white shadow-lg rounded-b-lg mx-4 mb-4 border border-t-0 border-gray-100">
          <Link
            to="/"
            onClick={() => setIsMenuOpen(false)}
            className="block pl-3 pr-4 py-3 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-primary hover:text-primary transition-colors"
          >
            Home
          </Link>
          <Link
            to="/shops"
            onClick={() => setIsMenuOpen(false)}
            className="block pl-3 pr-4 py-3 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-primary hover:text-primary transition-colors"
          >
            Stores
          </Link>
          <Link
            to="/shop"
            onClick={() => setIsMenuOpen(false)}
            className="block pl-3 pr-4 py-3 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-primary hover:text-primary transition-colors"
          >
            All Products
          </Link>
          {user && user.role === 'customer' && (
            <Link
              to="/customer"
              onClick={() => setIsMenuOpen(false)}
              className="block pl-3 pr-4 py-3 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-primary hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <OrderProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <NavBar />
              <CartDrawer />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/register/vendor" element={<VendorRegister />} />
                  <Route path="/select-user-type" element={<SelectUserType />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/shops" element={<ShopsHub />} />
                  <Route path="/shops/barber" element={<BarberShop />} />
                  <Route path="/shops/barber/:storeId" element={<BarberShop />} />
                  <Route path="/shops/tailor" element={<Tailor />} />
                  <Route path="/shops/computer" element={<ComputerShop />} />
                  <Route path="/shops/bottle" element={<BottleShop />} />
                  <Route path="/shops/clothing" element={<ClothingShop />} />
                  <Route path="/shops/clothing/:storeId" element={<ClothingShop />} />
                  <Route path="/shops/drink" element={<DrinkShop />} />
                  <Route path="/shops/massage" element={<Massage />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  
                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                  </Route>
                  
                  <Route element={<ProtectedRoute allowedRoles={['vendor']} />}>
                    <Route path="/vendor" element={<VendorDashboard />} />
                    <Route path="/vendor/barber" element={<BarberDashboard />} />
                    <Route path="/vendor/tailor" element={<TailorDashboard />} />
                    <Route path="/vendor/tech" element={<TechDashboard />} />
                    {/* Add other vendor routes here */}
                    <Route path="/vendor/bottleshop" element={<VendorDashboard />} /> {/* Placeholder */}
                    <Route path="/vendor/clothesshop" element={<ClothingShopDashboard />} />
                    <Route path="/vendor/drinkshop" element={<VendorDashboard />} /> {/* Placeholder */}
                    <Route path="/vendor/massage" element={<VendorDashboard />} /> {/* Placeholder */}
                  </Route>
                  
                  <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
                    <Route path="/customer" element={<CustomerDashboard />} />
                    <Route path="/invoice" element={<Invoice />} />
                  </Route>
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </OrderProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
