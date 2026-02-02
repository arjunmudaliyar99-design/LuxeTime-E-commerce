import { useState } from 'react';
import './Chatbot.css';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hello! I\'m your luxury watch assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');

  const quickReplies = [
    'Show me sports watches',
    'Recommend a watch',
    'Help with try-on',
    'What\'s my budget range?'
  ];

  const handleSend = (text) => {
    if (!text.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { type: 'user', text }]);
    setInput('');

    // Simulate bot response
    setTimeout(() => {
      const response = getBotResponse(text);
      setMessages(prev => [...prev, { type: 'bot', text: response }]);
    }, 800);
  };

  const getBotResponse = (userMessage) => {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('sport') || msg.includes('dive')) {
      return 'Our sports collection includes the Speedmaster, Seamaster Drive, and Diver 300M. Would you like to try them on virtually?';
    } else if (msg.includes('recommend') || msg.includes('suggest')) {
      return 'I\'d love to recommend the perfect watch! Please visit our AI Recommendations page to get personalized suggestions based on your wrist size and budget.';
    } else if (msg.includes('try') || msg.includes('camera')) {
      return 'To try on watches virtually, click "Try Virtual Watch" and allow camera access. Position your wrist in view and see watches in real-time!';
    } else if (msg.includes('budget') || msg.includes('price')) {
      return 'Our collection ranges from $4,200 to $8,900. Heritage starts at $4,200, while our premium Diver 300M is $8,900. What\'s your budget?';
    } else if (msg.includes('thank') || msg.includes('thanks')) {
      return 'You\'re welcome! Feel free to ask anything else about our luxury timepieces.';
    } else {
      return 'I can help you with:\n• Watch recommendations\n• Virtual try-on guidance\n• Pricing information\n• Style suggestions\nWhat would you like to know?';
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button 
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window glass-card">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <div className="chatbot-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="var(--accent-primary)" strokeWidth="2"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <h3 className="chatbot-title">Luxury Watch Assistant</h3>
                <p className="chatbot-status">Online</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.type}`}>
                {msg.type === 'bot' && (
                  <div className="message-avatar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="var(--accent-primary)"/>
                    </svg>
                  </div>
                )}
                <div className="message-bubble">
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Replies */}
          <div className="chatbot-quick-replies">
            {quickReplies.map((reply, idx) => (
              <button
                key={idx}
                className="quick-reply-btn"
                onClick={() => handleSend(reply)}
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="chatbot-input-container">
            <input
              type="text"
              className="chatbot-input"
              placeholder="Ask about watches..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
            />
            <button 
              className="chatbot-send-btn"
              onClick={() => handleSend(input)}
              disabled={!input.trim()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;
