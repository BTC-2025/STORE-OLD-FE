import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from './user/components/Navbar';
import Footer from './user/components/Footer';
import Home from "./user/home/Home";
import ProductListing from "./user/products/ProductListing";
import ProductDetail from "./user/products/ProductDetail";
import CartPage from "./user/cart/CartPage";
import LoginPage from "./user/Login/LoginPage";
import SignupPage from "./user/signup/SignupPage";
import WishlistPage from "./user/wishlist/WishlistPage";
import Checkout from "./user/checkout/Checkout";
import ProfilePage from "./user/profile/ProfilePage";
import ForgotPassword from "./user/forgot-password/ForgotPassword";
import CheckoutPage from "./user/checkout/CheckOutPage";
import MyOrders from "./user/orders/MyOrders";
import PaymentStatus from "./user/payment/PaymentStatus";
import OrderSuccess from "./user/orders/OrderSuccess";



function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // delay modal by 3 seconds if no user
      const timer = setTimeout(() => {
        setShowLogin(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleLogin = (data) => {
    // `data` comes from LoginModal → res.data
    setUser(data.user);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);
    setShowLogin(false); // ✅ close modal after login
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setShowLogin(true); // show modal again after logout
  };

  return (
    <Router>
      <Routes>
        {/* User Routes with Navbar & Footer */}
        <Route element={
          <>
            <Navbar
              user={user}
              onLoginClick={() => setShowLogin(true)}
              onLogout={handleLogout}
            />
            <Outlet />
            <Footer />
          </>
        }>
          <Route
            path="/"
            element={
              <Home
                showLogin={showLogin}
                setShowLogin={setShowLogin}
                onLogin={handleLogin}
              />
            }
          />
          <Route path="/products" element={<ProductListing />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path='/login' element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/checkout/:id" element={<Checkout />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/cart-checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/payment/status" element={<PaymentStatus />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;