import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VendorRegister from './pages/VendorRegister';
import SelectUserType from './pages/SelectUserType';
import Cart from './pages/Cart';
import Shop from './pages/Shop';
import ShopsHub from './pages/ShopsHub';
import ShopTemplate from './components/ShopTemplate';
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
import BottleShopDashboard from './pages/vendor/bottleshop/BottleShopDashboard';
import DrinkShopDashboard from './pages/vendor/drinkshop/Dashboard';
import MassageDashboard from './pages/vendor/massage/Dashboard';

import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <OrderProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="min-h-screen bg-[#f5f5f7] flex flex-col font-sans">
              <Navbar />
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

                  {/* Dedicated Store Category Routes */}
                  <Route path="/shops/barber" element={<BarberShop />} />
                  <Route path="/shops/barber/:storeId" element={<BarberShop />} />
                  <Route path="/shops/tailor" element={<Tailor />} />
                  <Route path="/shops/tailor/:storeId" element={<Tailor />} />
                  <Route path="/shops/computer" element={<ComputerShop />} />
                  <Route path="/shops/computer/:storeId" element={<ComputerShop />} />
                  <Route path="/shops/bottle" element={<BottleShop />} />
                  <Route path="/shops/bottle/:storeId" element={<BottleShop />} />
                  <Route path="/shops/clothing" element={<ClothingShop />} />
                  <Route path="/shops/clothing/:storeId" element={<ClothingShop />} />
                  <Route path="/shops/drink" element={<DrinkShop />} />
                  <Route path="/shops/drink/:storeId" element={<DrinkShop />} />
                  <Route path="/shops/massage" element={<Massage />} />
                  <Route path="/shops/massage/:storeId" element={<Massage />} />

                  {/* Dynamic Universal Store Profile */}
                  <Route path="/shops/:storeId" element={<ShopTemplate />} />
                  <Route path="/store/:storeId" element={<ShopTemplate />} />

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
                    <Route path="/vendor/bottleshop" element={<BottleShopDashboard />} />
                    <Route path="/vendor/clothesshop" element={<ClothingShopDashboard />} />
                    <Route path="/vendor/drinkshop" element={<DrinkShopDashboard />} />
                    <Route path="/vendor/massage" element={<MassageDashboard />} />
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
          <Analytics />
        </OrderProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
