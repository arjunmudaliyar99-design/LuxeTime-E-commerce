import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import Home from './pages/Home';
import Watches from './pages/Watches';
import TryOn from './pages/TryOn';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Checkout from './pages/Checkout';
import Recommendations from './pages/Recommendations';
import Contact from './pages/Contact';
import './styles/design-system.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Chatbot />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/watches" element={<Watches />} />
            <Route path="/try-on" element={<TryOn />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// Placeholder pages
function About() {
  return (
    <div className="section" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div className="container">
        <h1 className="heading-2">About LUXETIME</h1>
        <p className="body-large text-secondary" style={{ marginTop: 'var(--space-md)', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
          LUXE TIME is a modern luxury watch experience platform designed and built by Arjun, combining elegant design with cutting-edge technology. The platform allows users to explore premium timepieces, experience real-time virtual try-on, and discover watches that match their personal style—all in one seamless interface.
Crafted with a focus on performance, realism, and user experience, LUXE TIME blends fashion, innovation, and AI to redefine how people choose and experience luxury watches online.
        </p>
      </div>
    </div>
  );
}

export default App;
