import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';
import { getOrCreateToken } from '../utils/auth';

function Checkout() {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVV: ''
  });
  const apiUrl = import.meta.env.VITE_API_URL || 'https://luxetime-e-commerce.onrender.com';

  // Fetch cart items
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = getOrCreateToken();

        const response = await fetch(`${apiUrl}/api/cart/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.items && data.items.length > 0) {
            // Fetch watch details for each item
            const watchesRes = await fetch(`${apiUrl}/api/watches/`);
            const watchesData = await watchesRes.json();
            const watchesMap = {};
            
            if (watchesData.success && watchesData.watches) {
              watchesData.watches.forEach(w => watchesMap[w.id] = w);
            }
            
            const itemsWithDetails = data.items.map(item => ({
              ...item,
              ...(watchesMap[item.watch_id] || {})
            }));
            
            setCartItems(itemsWithDetails);
          } else {
            setCartItems([]);
          }
        } else {
          console.error('Failed to fetch cart');
          setCartItems([]);
        }
      } catch (err) {
        console.error('Error fetching cart:', err);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [navigate]);

  const subtotal = cartItems.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
  const shipping = subtotal > 5000 ? 0 : 25;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      // In production, this would call Stripe/payment API
      alert('🎉 Demo Order Placed Successfully!\n\n(This is a test payment - no real charges)');
      navigate('/');
    }, 2000);
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-header">
          <h1 className="heading-2">Checkout</h1>
          <p className="body-large text-secondary">Complete your purchase</p>
        </div>

        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="checkout-layout">
            {/* Left Column - Forms */}
            <div className="checkout-main">
              {/* Shipping Information */}
              <section className="checkout-section card">
                <h2 className="heading-4">Shipping Information</h2>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="form-group form-group-full">
                    <label className="form-label">Address *</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="New York"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Postal Code *</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="10001"
                    />
                  </div>

                  <div className="form-group form-group-full">
                    <label className="form-label">Country *</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="United States"
                    />
                  </div>
                </div>
              </section>

              {/* Payment Method */}
              <section className="checkout-section card">
                <h2 className="heading-4">Payment Method</h2>
                
                <div className="payment-methods">
                  <label className="payment-method">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="payment-method-label">
                      <span>Credit/Debit Card</span>
                      <span className="payment-method-icons">💳</span>
                    </span>
                  </label>

                  <label className="payment-method">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="demo"
                      checked={paymentMethod === 'demo'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="payment-method-label">
                      <span>Demo Payment (Test)</span>
                      <span className="payment-method-icons">✨</span>
                    </span>
                  </label>
                </div>

                {paymentMethod === 'card' && (
                  <div className="form-grid">
                    <div className="form-group form-group-full">
                      <label className="form-label">Card Number *</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                        placeholder="4242 4242 4242 4242"
                        maxLength="19"
                      />
                      <span className="form-hint">Test card: 4242 4242 4242 4242</span>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Expiry Date *</label>
                      <input
                        type="text"
                        name="cardExpiry"
                        value={formData.cardExpiry}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                        placeholder="MM/YY"
                        maxLength="5"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">CVV *</label>
                      <input
                        type="text"
                        name="cardCVV"
                        value={formData.cardCVV}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                        placeholder="123"
                        maxLength="3"
                      />
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* Right Column - Order Summary */}
            <div className="checkout-sidebar">
              <div className="checkout-summary card">
                <h2 className="heading-4">Order Summary</h2>
                
                {loading ? (
                  <div className="summary-loading">
                    <div className="loading-spinner"></div>
                    <p className="body-small text-secondary">Loading cart...</p>
                  </div>
                ) : cartItems.length === 0 ? (
                  <div className="summary-empty">
                    <p className="body-base text-secondary">Your cart is empty</p>
                  </div>
                ) : (
                  <>
                    <div className="summary-items">
                      {cartItems.map((item) => (
                        <div key={item.watch_id || item.id} className="summary-item-row">
                          <span className="body-small">{item.name} × {item.quantity}</span>
                          <span className="body-small">${((item.price || 0) * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="summary-divider"></div>

                    <div className="summary-item">
                      <span className="body-base text-secondary">Subtotal</span>
                      <span className="body-base">${subtotal.toLocaleString()}</span>
                    </div>

                    <div className="summary-item">
                      <span className="body-base text-secondary">Shipping</span>
                      <span className="body-base">{shipping === 0 ? 'FREE' : `$${shipping}`}</span>
                    </div>

                    <div className="summary-item">
                      <span className="body-base text-secondary">Tax</span>
                      <span className="body-base">${tax.toFixed(2)}</span>
                    </div>

                    <div className="summary-divider"></div>

                    <div className="summary-total">
                      <span className="heading-4">Total</span>
                      <span className="heading-4 text-accent">${total.toLocaleString()}</span>
                    </div>

                    <button
                      type="submit"
                      disabled={processing}
                      className="btn btn-primary btn-full"
                    >
                      {processing ? 'Processing...' : 'Place Order'}
                    </button>

                    <div className="checkout-notice">
                      <p className="body-small text-secondary">
                        🔒 Demo checkout - No real charges will be made
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Checkout;
