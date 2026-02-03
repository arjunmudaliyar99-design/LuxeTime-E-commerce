import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Recommendations.css';

function Recommendations() {
  const [wristSize, setWristSize] = useState('');
  const [budget, setBudget] = useState('');
  const [stylePreference, setStylePreference] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert wrist size in mm to small/medium/large
      let wristCategory = 'medium';
      const wristMm = parseInt(wristSize);
      if (wristMm < 170) {
        wristCategory = 'small';
      } else if (wristMm > 200) {
        wristCategory = 'large';
      }

      // Prepare request body matching backend expectations
      const requestBody = {
        wrist_size: wristCategory, // string: small/medium/large
        budget_min: 0,
        budget_max: budget ? parseInt(budget) : 100000,
        style_preference: stylePreference || null,
        viewed_watches: [],
        cart_watches: []
      };

      console.log('Sending recommendation request:', requestBody);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/recommendations/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.detail || 'Failed to get recommendations');
      }

      const data = await response.json();
      console.log('Recommendations response:', data);
      
      if (data.success && data.recommendations) {
        setRecommendations(data.recommendations);
        // Generate explanation based on results
        const count = data.recommendations.length;
        setExplanation(count > 0 
          ? `Found ${count} perfect ${count === 1 ? 'match' : 'matches'} for your preferences!`
          : 'No matches found. Try adjusting your preferences.');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setError(err.message || 'Failed to get recommendations. Please try again.');
      console.error('Recommendation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recommendations-page">
      <div className="container">
        <div className="recommendations-header">
          <h1 className="heading-2">AI Watch Recommendations</h1>
          <p className="body-large text-secondary">
            Get personalized watch suggestions based on your wrist size and budget
          </p>
        </div>

        <div className="recommendations-layout">
          {/* Form */}
          <div className="recommendation-form card">
            <h2 className="heading-4">Your Preferences</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">
                  Wrist Size (mm) *
                  <span className="form-hint">Measure around your wrist (usually 160-220mm)</span>
                </label>
                <input
                  type="number"
                  value={wristSize}
                  onChange={(e) => setWristSize(e.target.value)}
                  className="form-input"
                  placeholder="180"
                  min="140"
                  max="250"
                  step="1"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Budget (USD) *
                  <span className="form-hint">Maximum you're willing to spend</span>
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="form-input"
                  placeholder="5000"
                  min="0"
                  step="100"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Style Preference (Optional)
                </label>
                <select
                  value={stylePreference}
                  onChange={(e) => setStylePreference(e.target.value)}
                  className="form-input"
                >
                  <option value="">Any Style</option>
                  <option value="sports">Sports</option>
                  <option value="classic">Classic</option>
                  <option value="luxury">Luxury</option>
                  <option value="casual">Casual</option>
                </select>
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? 'Finding Matches...' : 'Get Recommendations'}
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="recommendation-results">
            {explanation && (
              <div className="recommendation-explanation card">
                <h3 className="heading-4">Analysis</h3>
                <p className="body-base">{explanation}</p>
              </div>
            )}

            {recommendations.length > 0 && (
              <div className="recommendation-list">
                <h3 className="heading-4">Your Top Matches</h3>
                
                {recommendations.map((rec, index) => (
                  <div key={rec.watch_id} className="recommendation-card card">
                    <div className="rec-image">
                      <img 
                        src={rec.image_url || `/watches/${rec.watch_id}.png`} 
                        alt={rec.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x300/1a1a1a/C9A05F?text=' + encodeURIComponent(rec.name);
                        }}
                      />
                    </div>
                    
                    <div className="rec-rank">
                      <span className="rank-number">#{index + 1}</span>
                      <div className="confidence-bar">
                        <div 
                          className="confidence-fill"
                          style={{ width: `${rec.confidence_score * 100}%` }}
                        ></div>
                      </div>
                      <span className="confidence-score">
                        {(rec.confidence_score * 100).toFixed(0)}% Match
                      </span>
                    </div>

                    <div className="rec-details">
                      <div className="rec-header">
                        <h4 className="heading-4">{rec.name}</h4>
                        <span className="rec-price text-accent">${rec.price.toLocaleString()}</span>
                      </div>

                      <div className="rec-specs">
                        <span className="spec-badge">{rec.case_size}mm</span>
                        <span className="spec-badge">
                          {rec.price <= parseFloat(budget) ? '✓ Within Budget' : '⚠ Over Budget'}
                        </span>
                      </div>

                      <p className="rec-explanation body-small text-secondary">
                        {rec.explanation}
                      </p>

                      <div className="rec-actions">
                        <Link 
                          to={`/try-on?watch=${rec.watch_id}`}
                          className="btn btn-secondary btn-small"
                        >
                          Try On
                        </Link>
                        <Link 
                          to="/watches"
                          className="btn btn-primary btn-small"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && !explanation && (
              <div className="empty-state card">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="35" stroke="var(--accent-primary)" strokeWidth="2" opacity="0.3"/>
                  <path d="M40 25V40L50 50" stroke="var(--accent-primary)" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                <h3 className="heading-4">Ready to Find Your Perfect Watch?</h3>
                <p className="body-base text-secondary">
                  Fill in your preferences and we'll recommend the best watches for you
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Recommendations;
