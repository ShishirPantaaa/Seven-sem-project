import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "./context/AuthContext";
import RequireAuth from "./components/RequireAuth";

import Home from "./pages/Home";
import About from "./pages/About";
import Departments from "./pages/Departments";
import BookToken from "./pages/BookToken";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OtpVerify from "./pages/OtpVerify";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/departments" element={<Departments />} />
          <Route
            path="/book-token"
            element={
              <RequireAuth>
                <BookToken />
              </RequireAuth>
            }
          />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/otp-verify" element={<OtpVerify />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}
