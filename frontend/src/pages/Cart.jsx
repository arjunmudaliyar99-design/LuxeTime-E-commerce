import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Cart.css';
import { getOrCreateToken } from '../utils/auth';

function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch cart from backend
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = getOrCreateToken();
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

        const response = await fetch(`${apiUrl}/api/cart/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          // Token invalid
          localStorage.removeItem('auth_token');
          navigate('/login', { state: { from: '/cart' } });
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to load cart');
        }

        const data = await response.json();
        
        console.log('Cart API response:', data);
        
        // Handle both response formats
        const items = data.items || (data.cart && data.cart.items) || [];
        
        if (items.length > 0) {
          // Fetch all watches first
          const watchesRes = await fetch('http://localhost:8000/api/watches/');
          const watchesData = await watchesRes.json();
          const watchesMap = {};
          
          if (watchesData.success && watchesData.watches) {
            watchesData.watches.forEach(w => watchesMap[w.id] = w);
          }
          
          // Map cart items to watch details
          const itemsWithDetails = items.map(item => ({
            ...item,
            ...(watchesMap[item.watch_id] || {})
          }));
          
          setCartItems(itemsWithDetails);
          console.log('Cart items loaded:', itemsWithDetails);
        } else {
          setCartItems([]);
          console.log('Cart is empty');
        }
      } catch (err) {
        console.error('Error fetching cart:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [navigate]);

  const updateQuantity = async (watchId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('http://localhost:8000/api/cart/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          watch_id: watchId,
          quantity: newQuantity
        })
      });

      if (response.ok) {
        setCartItems(items =>
          items.map(item =>
            item.watch_id === watchId ? { ...item, quantity: newQuantity } : item
          )
        );
      }
    } catch (err) {
      console.error('Update quantity error:', err);
    }
  };

  const removeItem = async (watchId) => {
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`http://localhost:8000/api/cart/remove/${watchId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setCartItems(items => items.filter(item => item.watch_id !== watchId));
      }
    } catch (err) {
      console.error('Remove item error:', err);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 500 ? 0 : 25;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1 className="heading-2">Shopping Cart</h1>
          <p className="body-large text-secondary">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
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
            <p className="body-large text-secondary">Loading cart...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="cart-empty card">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <path d="M10 10H20L30 60H70M30 60L25 25H75L70 60M25 75C25 77.7614 22.7614 80 20 80C17.2386 80 15 77.7614 15 75C15 72.2386 17.2386 70 20 70C22.7614 70 25 72.2386 25 75ZM70 75C70 77.7614 67.7614 80 65 80C62.2386 80 60 77.7614 60 75C60 72.2386 62.2386 70 65 70C67.7614 70 70 72.2386 70 75Z" stroke="var(--accent-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3 className="heading-3">Your cart is empty</h3>
            <p className="body-base text-secondary">Browse our collection to find your perfect timepiece</p>
            <Link to="/watches" className="btn btn-primary">
              Explore Watches
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Cart Items */}
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.watch_id || item.id} className="cart-item card">
                  <div className="item-image">
                    <img
                      src={item.image_url || item.image}
                      alt={item.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="item-image-placeholder">
                      <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                        <circle cx="30" cy="30" r="20" stroke="var(--accent-primary)" strokeWidth="2"/>
                      </svg>
                    </div>
                  </div>

                  <div className="item-details">
                    <div>
                      <span className="item-brand body-small text-secondary">{item.brand}</span>
                      <h3 className="item-name heading-4">{item.name}</h3>
                    </div>
                    <span className="item-price heading-4 text-accent">${item.price?.toLocaleString()}</span>
                  </div>

                  <div className="item-actions">
                    <div className="quantity-control">
                      <button
                        onClick={() => updateQuantity(item.watch_id || item.id, item.quantity - 1)}
                        className="quantity-btn"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.watch_id || item.id, item.quantity + 1)}
                        className="quantity-btn"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.watch_id || item.id)}
                      className="btn-remove"
                      aria-label="Remove item"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="cart-summary card">
              <h3 className="heading-4">Order Summary</h3>

              <div className="summary-row">
                <span className="body-base text-secondary">Subtotal</span>
                <span className="body-base">${subtotal.toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span className="body-base text-secondary">Shipping</span>
                <span className="body-base">
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>

              <div className="summary-row">
                <span className="body-base text-secondary">Tax (10%)</span>
                <span className="body-base">${tax.toFixed(2)}</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row summary-total">
                <span className="heading-4">Total</span>
                <span className="heading-4 text-accent">${total.toFixed(2)}</span>
              </div>

              {shipping > 0 && (
                <div className="shipping-notice">
                  <p className="body-small text-secondary">
                    Add ${(500 - subtotal).toFixed(2)} more for free shipping
                  </p>
                </div>
              )}

              <Link to="/checkout" className="btn btn-primary btn-full">
                Proceed to Checkout
              </Link>

              <Link to="/watches" className="btn btn-secondary btn-full">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
