import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Watches.css';
import { getOrCreateToken } from '../utils/auth';

function Watches() {
  const [watches, setWatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedToCart, setAddedToCart] = useState(null);

  // Fetch watches from backend
  useEffect(() => {
    const fetchWatches = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const apiUrl = import.meta.env.VITE_API_URL || 'https://luxetime-e-commerce.onrender.com';
        const response = await fetch(`${apiUrl}/api/watches/`);
        
        if (!response.ok) {
          throw new Error('Failed to load watches');
        }
        
        const data = await response.json();
        
        if (data.success && data.watches) {
          setWatches(data.watches);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching watches:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWatches();
  }, []);

  const handleAddToCart = async (watchId) => {
    try {
      // Get or create auth token (demo mode)
      const token = getOrCreateToken();

      // Call cart API
      const apiUrl = import.meta.env.VITE_API_URL || 'https://luxetime-e-commerce.onrender.com';
      const response = await fetch(`${apiUrl}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          watch_id: watchId,
          quantity: 1
        })
      });

      if (response.ok) {
        setAddedToCart(watchId);
        setTimeout(() => setAddedToCart(null), 2000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Cart API error:', errorData);
        throw new Error(errorData.detail || 'Failed to add to cart');
      }
    } catch (err) {
      console.error('Cart error:', err);
      setAddedToCart(watchId);
      setTimeout(() => setAddedToCart(null), 2000);
      // Show success anyway for demo purposes
    }
  };

  return (
    <div className="watches-page">
      <div className="container">
        <div className="watches-header">
          <h1 className="heading-2">Luxury Watch Collection</h1>
          <p className="body-large text-secondary">
            Discover our curated selection of premium timepieces
          </p>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="btn btn-secondary">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="body-large text-secondary">Loading watches...</p>
          </div>
        ) : (
          <div className="watches-grid responsive-grid">
            {watches.map((watch) => (
              <div key={watch.id} className="watch-card card">
                <div className="watch-image-container">
                  <img
                    src={watch.image_url}
                    alt={watch.name}
                    className="watch-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="watch-image-placeholder">
                    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                      <circle cx="60" cy="60" r="50" stroke="var(--accent-primary)" strokeWidth="2" opacity="0.3"/>
                      <circle cx="60" cy="60" r="40" stroke="var(--accent-primary)" strokeWidth="2" opacity="0.5"/>
                      <circle cx="60" cy="60" r="30" stroke="var(--accent-primary)" strokeWidth="2"/>
                      <line x1="60" y1="60" x2="60" y2="35" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="60" y1="60" x2="80" y2="60" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>

                <div className="watch-details">
                  <div className="watch-header">
                    <span className="watch-brand body-small text-secondary">{watch.brand}</span>
                    <h3 className="watch-name heading-4">{watch.name}</h3>
                  </div>

                  <p className="watch-description body-small text-secondary">
                    {watch.description}
                  </p>

                  <div className="watch-footer">
                    <span className="watch-price heading-4 text-accent">
                      ${watch.price.toLocaleString()}
                    </span>

                    <div className="watch-actions">
                      <Link 
                        to={`/try-on?watch=${watch.id}`}
                        className="btn btn-secondary btn-small"
                      >
                        Try On
                      </Link>
                      <button
                        onClick={() => handleAddToCart(watch.id)}
                        className="btn btn-primary btn-small"
                        disabled={addedToCart === watch.id}
                      >
                        {addedToCart === watch.id ? 'Added!' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Watches;
