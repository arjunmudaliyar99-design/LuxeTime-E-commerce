import { useState } from 'react';
import './Contact.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
  const [submitMessage, setSubmitMessage] = useState('');
  const apiUrl = import.meta.env.VITE_API_URL || 'https://luxetime-e-commerce.onrender.com';

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation (optional but if provided should be valid)
    if (formData.phone && !/^[\d\s+()-]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      const response = await fetch(`${apiUrl}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage(data.message || 'Thank you! We\'ll get back to you soon.');
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: ''
        });
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSubmitStatus(null);
          setSubmitMessage('');
        }, 5000);
      } else {
        setSubmitStatus('error');
        setSubmitMessage(data.detail || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitStatus('error');
      setSubmitMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        {/* Header Section */}
        <div className="contact-header">
          <h1 className="heading-1">Get in Touch</h1>
          <p className="body-large text-secondary">
            Have questions about our luxury watches or the virtual try-on experience? 
            We'd love to hear from you.
          </p>
        </div>

        <div className="contact-content">
          {/* Left: Contact Form */}
          <div className="contact-form-section">
            <div className="card form-card">
              <h2 className="heading-3">Send us a message</h2>
              
              <form onSubmit={handleSubmit} className="contact-form">
                {/* Name Field */}
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    placeholder="John Doe"
                    disabled={isSubmitting}
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                {/* Email Field */}
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="john@example.com"
                    disabled={isSubmitting}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                {/* Phone Field */}
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Phone Number <span className="optional">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    placeholder="+1 (555) 123-4567"
                    disabled={isSubmitting}
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>

                {/* Message Field */}
                <div className="form-group">
                  <label htmlFor="message" className="form-label">
                    Message <span className="required">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className={`form-input form-textarea ${errors.message ? 'error' : ''}`}
                    placeholder="Tell us how we can help you..."
                    rows="6"
                    disabled={isSubmitting}
                  />
                  {errors.message && <span className="error-message">{errors.message}</span>}
                </div>

                {/* Submit Status Messages */}
                {submitStatus && (
                  <div className={`submit-message ${submitStatus}`}>
                    {submitStatus === 'success' ? (
                      <svg className="message-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg className="message-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    <span>{submitMessage}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button 
                  type="submit" 
                  className="btn btn-primary btn-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" 
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Contact Info */}
          <div className="contact-info-section">
            <div className="card info-card">
              <h2 className="heading-3">Contact Information</h2>
              
              <div className="info-items">
                <div className="info-item">
                  <div className="info-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="info-content">
                    <h3 className="info-title">Email</h3>
                    <a href="mailto:arjunmuudaliyar99@gmail.com" className="info-value">
                      arjunmuudaliyar99@gmail.com
                    </a>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="info-content">
                    <h3 className="info-title">Phone</h3>
                    <p className="info-value">Available via contact form</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="info-content">
                    <h3 className="info-title">Response Time</h3>
                    <p className="info-value">Within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card faq-card">
              <h3 className="heading-4">Quick FAQ</h3>
              <div className="faq-list">
                <div className="faq-item">
                  <h4>How does virtual try-on work?</h4>
                  <p>Our AI-powered system uses your device camera to overlay watches on your wrist in real-time.</p>
                </div>
                <div className="faq-item">
                  <h4>Is the try-on accurate?</h4>
                  <p>Yes! We use advanced hand tracking to ensure realistic sizing and positioning.</p>
                </div>
                <div className="faq-item">
                  <h4>Can I save my try-on photos?</h4>
                  <p>Yes, you can capture and download photos during your try-on session.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
