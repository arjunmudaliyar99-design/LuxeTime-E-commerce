import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle scroll for navbar style change
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if link is active
  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-content">
        {/* Logo / Brand */}
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="url(#brand-gradient)" strokeWidth="2"/>
              <circle cx="16" cy="16" r="8" fill="url(#brand-gradient)"/>
              <path d="M16 8V16L20 18" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"/>
              <defs>
                <linearGradient id="brand-gradient" x1="0" y1="0" x2="32" y2="32">
                  <stop offset="0%" stopColor="rgba(201, 160, 95, 1)"/>
                  <stop offset="100%" stopColor="rgba(255, 215, 130, 1)"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="brand-text-group">
            <span className="brand-text">LUXE</span>
            <span className="brand-accent">TIME</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/watches" className={`nav-link ${isActive('/watches') ? 'active' : ''}`}>
            Watches
          </Link>
          <Link to="/try-on" className={`nav-link ${isActive('/try-on') ? 'active' : ''}`}>
            Try-On
          </Link>
          <Link to="/recommendations" className={`nav-link ${isActive('/recommendations') ? 'active' : ''}`}>
            AI Match
          </Link>
          <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>
            About
          </Link>
          <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>
            Contact
          </Link>
        </div>

        {/* Right Actions */}
        <div className="navbar-actions">
          <button className="nav-icon" aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M19 19L14.65 14.65M17 9C17 13.4183 13.4183 17 9 17C4.58172 17 1 13.4183 1 9C1 4.58172 4.58172 1 9 1C13.4183 1 17 4.58172 17 9Z" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          
          <Link to="/cart" className="nav-icon" aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M1 1H3.5L5.5 13H16.5M5.5 13L7 16H17M5.5 13L4 4H18L16.5 13M7 19C7 19.5523 6.55228 20 6 20C5.44772 20 5 19.5523 5 19C5 18.4477 5.44772 18 6 18C6.55228 18 7 18.4477 7 19ZM18 19C18 19.5523 17.5523 20 17 20C16.4477 20 16 19.5523 16 19C16 18.4477 16.4477 18 17 18C17.5523 18 18 18.4477 18 19Z" 
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="cart-badge">2</span>
          </Link>
          
          <Link to="/login" className="btn btn-secondary btn-nav">
            Login
          </Link>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          <Link 
            to="/" 
            className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/watches" 
            className={`mobile-nav-link ${isActive('/watches') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Watches
          </Link>
          <Link 
            to="/try-on" 
            className={`mobile-nav-link ${isActive('/try-on') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Try-On
          </Link>
          <Link 
            to="/recommendations" 
            className={`mobile-nav-link ${isActive('/recommendations') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            AI Match
          </Link>
          <Link 
            to="/contact" 
            className={`mobile-nav-link ${isActive('/contact') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Contact
          </Link>
          <div className="mobile-menu-divider"></div>
          <Link 
            to="/cart" 
            className="mobile-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Cart (2)
          </Link>
          <Link 
            to="/login" 
            className="mobile-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Login
          </Link>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-menu-overlay" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
}

export default Navbar;
