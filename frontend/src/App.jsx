import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from './pages/Home';
import ProductDetails from "./pages/ProductDetails";
import Navbar from "./components/Navbar";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Shipping from "./pages/Shipping";
import Payment from "./pages/Payment";
import PlaceOrder from "./pages/PlaceOrder";
import MyOrders from "./pages/MyOrders";
import OrderSuccess from "./pages/OderSuccess";
import AdminDashboard from "./pages/AdminDashboard"; // 👈 ADD

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Shipping />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/placeorder" element={<PlaceOrder />} />
            <Route path="/my-orders" element={<MyOrders/>} />
            <Route path="/order-success/:orderId" element={<OrderSuccess />} />
            <Route path="/admin" element={<AdminDashboard />} /> {/* 👈 ADD */}
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;