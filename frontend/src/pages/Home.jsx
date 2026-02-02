import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import './Home.css';

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredSlide, setFeaturedSlide] = useState(0);
  
  const newArrivals = [
    { id: 1, name: 'Speedmaster', brand: 'OMEGA', price: 6500, image: '/watch images/image1.jpg' },
    { id: 2, name: 'Seamaster', brand: 'OMEGA', price: 5800, image: '/watch images/image3.jpg' },
    { id: 3, name: 'Diver 300M', brand: 'OMEGA', price: 7500, image: '/watch images/image2.jpg' },
    { id: 4, name: 'Planet Ocean', brand: 'OMEGA', price: 8900, image: '/watch images/Speedmaster.png' },
    { id: 5, name: 'Speedmaster Dark', brand: 'OMEGA', price: 7000, image: '/watch images/Speedmaster dark.png' },
    { id: 6, name: 'Aqua Terra', brand: 'OMEGA', price: 6200, image: '/watch images/seamaster aqua teera 150m.png' },
{ id: 7, name: 'Seamaster ttere', brand: 'OMEGA', price: 5800, image: '/watch images/image3.jpg' },
    { id: 8, name: 'Diver 300M  extra', brand: 'OMEGA', price: 7500, image: '/watch images/image2.jpg' },
    { id: 9, name: 'Planet Ocean gold', brand: 'OMEGA', price: 8900, image: '/watch images/Speedmaster.png' },
  ];
  
  const featuredWatches = [
    { id: 1, name: 'Heritage', price: 6500, image: '/watch images/image5.jpg' },
    { id: 2, name: 'Instinct', price: 5800, image: '/watch images/image6.jpg' },
    { id: 3, name: 'Planet Ocean', price: 7500, image: '/watch images/planet.png' },
    { id: 4, name: 'Diver', price: 8900, image: '/watch images/diver.png' },
    { id: 5, name: 'Heritage Classic', price: 7200, image: '/watch images/heritage.png' },
    { id: 6, name: 'Sport Edition', price: 6800, image: '/watch images/inst.png' }
  ];
  
  // Auto-slide for NEW ARRIVALS
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.ceil(newArrivals.length / 4));
    }, 4000);
    return () => clearInterval(timer);
  }, [newArrivals.length]);
  
  // Auto-slide for Featured
  useEffect(() => {
    const timer = setInterval(() => {
      setFeaturedSlide((prev) => (prev + 1) % Math.ceil(featuredWatches.length / 3));
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredWatches.length]);
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(newArrivals.length / 4));
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(newArrivals.length / 4)) % Math.ceil(newArrivals.length / 4));
  };
  
  const nextFeatured = () => {
    setFeaturedSlide((prev) => (prev + 1) % Math.ceil(featuredWatches.length / 3));
  };
  
  const prevFeatured = () => {
    setFeaturedSlide((prev) => (prev - 1 + Math.ceil(featuredWatches.length / 3)) % Math.ceil(featuredWatches.length / 3));
  };

  // Animation variants for hero section
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section fade-in">
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <motion.div 
            className="hero-text"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.h1 className="heading-hero" variants={fadeInUp}>
              VIRTUAL WATCH
              <br />
              TRY-ON
            </motion.h1>
            <motion.p 
              className="hero-description body-large text-secondary"
              variants={fadeInUp}
            >
              Experience luxury timepieces on your wrist through cutting-edge AR technology.
              <br />
              See how each watch complements your style before you buy.
            </motion.p>
            <motion.div className="hero-actions" variants={fadeInUp}>
              <Link to="/try-on" className="btn btn-primary hover-lift">
                Try Virtual Watch
              </Link>
              <Link to="/recommendations" className="btn btn-secondary hover-lift">
                Get AI Recommendations
              </Link>
            </motion.div>
          </motion.div>
          <motion.div 
            className="hero-video-container"
            initial="hidden"
            animate="visible"
            variants={scaleIn}
          >
            <div className="watch-showcase hover-glow">
              <video 
                className="hero-watch-video"
                autoPlay 
                loop 
                muted 
                playsInline
                poster="/watches/Speedmaster.png"
              >
                <source src="/watch images/video watch.mp4" type="video/mp4" />
                <source src="/videos/watch-showcase.mp4" type="video/mp4" />
              </video>
              <div className="watch-glow"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section section">
        <div className="container">
          <h2 className="heading-2 text-center">Why Choose LUXETIME</h2>
          <p className="body-large text-secondary text-center" style={{marginTop: 'var(--space-md)', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto'}}>
            Premium craftsmanship meets innovative technology
          </p>
          
          <div className="features-grid">
            <div className="feature-card card">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path d="M20 5L25 15H35L27 22L30 32L20 26L10 32L13 22L5 15H15L20 5Z" stroke="var(--accent-primary)" strokeWidth="2" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="heading-4">AI Recommendation</h3>
              <p className="body-base text-secondary">
               The AI Watch Recommender intelligently suggests watches based on user preferences such as style, budget, and interaction behavior.
     </p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <rect x="5" y="8" width="30" height="24" rx="2" stroke="var(--accent-primary)" strokeWidth="2"/>
                  <path d="M15 20L20 25L25 20" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 25V15" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="heading-4">Virtual Try-On</h3>
              <p className="body-base text-secondary">
                See how each watch looks on your wrist in real-time with advanced AR technology.
              </p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="15" stroke="var(--accent-primary)" strokeWidth="2"/>
                  <path d="M20 10V20L25 25" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="heading-4">Timeless Design</h3>
              <p className="body-base text-secondary">
                Elegant aesthetics that transcend trends and complement any style.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals Banner Section */}
      <section className="new-arrivals-section section">
        <div className="container">
          <h2 className="heading-2 text-center">NEW ARRIVALS</h2>
          <p className="body-large text-secondary text-center" style={{marginTop: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
            Explore our latest luxury timepieces
          </p>
          
          <div className="slider-container">
            <button className="slider-btn slider-btn-prev" onClick={prevSlide}>
              ‹
            </button>
            
            <div className="arrivals-slider-wrapper">
              <motion.div 
                className="arrivals-banner-grid"
                animate={{ x: `-${currentSlide * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                {newArrivals.map((watch) => (
                  <Link 
                    key={watch.id}
                    to={`/try-on?watch=${watch.id}`}
                    className="arrival-banner-card"
                  >
                    <div className="arrival-banner-image">
                      <img src={watch.image} alt={watch.name} onError={(e) => e.target.src = '/watch images/Speedmaster.png'} />
                      <div className="arrival-banner-overlay">
                        <span className="arrival-brand">{watch.brand}</span>
                        <h3 className="arrival-name">{watch.name}</h3>
                        <span className="arrival-price">${watch.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </motion.div>
            </div>
            
            <button className="slider-btn slider-btn-next" onClick={nextSlide}>
              ›
            </button>
            
            <div className="slider-dots">
              {Array.from({ length: Math.ceil(newArrivals.length / 4) }).map((_, index) => (
                <button
                  key={index}
                  className={`slider-dot ${currentSlide === index ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Watches Section */}
      <section className="featured-watches-section section">
        <div className="container">
          <h2 className="heading-2 text-center">Featured Collection</h2>
          <p className="body-large text-secondary text-center" style={{marginTop: 'var(--space-md)', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', marginBottom: 'var(--space-xl)' }}>
            Discover our handpicked selection of exquisite timepieces
          </p>
          
          <div className="slider-container">
            <button className="slider-btn slider-btn-prev" onClick={prevFeatured}>
              ‹
            </button>
            
            <div className="featured-slider-wrapper">
              <motion.div 
                className="featured-watches-grid"
                animate={{ x: `-${featuredSlide * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                {featuredWatches.map((watch) => (
                  <Link 
                    key={watch.id}
                    to={`/try-on?watch=${watch.id}`} 
                    className="featured-watch-card"
                  >
                    <div className="featured-watch-image-container">
                      <img 
                        src={watch.image} 
                        alt={watch.name}
                        className="featured-watch-image"
                        onError={(e) => e.target.src = '/watch images/heritage.png'}
                      />
                      <div className="featured-watch-overlay">
                        <span className="try-on-text">Try On</span>
                      </div>
                    </div>
                    <div className="featured-watch-info">
                      <h3 className="featured-watch-name">{watch.name}</h3>
                      <p className="featured-watch-price">${watch.price.toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </motion.div>
            </div>
            
            <button className="slider-btn slider-btn-next" onClick={nextFeatured}>
              ›
            </button>
            
            <div className="slider-dots">
              {Array.from({ length: Math.ceil(featuredWatches.length / 3) }).map((_, index) => (
                <button
                  key={index}
                  className={`slider-dot ${featuredSlide === index ? 'active' : ''}`}
                  onClick={() => setFeaturedSlide(index)}
                />
              ))}
            </div>
          </div>

          <div className="featured-watches-cta">
            <Link to="/watches" className="btn btn-secondary">
              View Full Collection
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section section">
        <div className="container">
          <div className="cta-card card">
            <h2 className="heading-2">Experience the Future of Watch Shopping</h2>
            <p className="body-large text-secondary" style={{marginTop: 'var(--space-md)'}}>
              Try on luxury watches virtually from the comfort of your home
            </p>
            <Link to="/try-on" className="btn btn-primary" style={{marginTop: 'var(--space-lg)'}}>
              Start Virtual Try-On
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
