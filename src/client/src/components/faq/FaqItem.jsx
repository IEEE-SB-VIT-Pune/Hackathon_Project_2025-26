import React, { useState } from 'react';

const FaqItem = ({ question, answer, color, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className={`faq-item ${isOpen ? 'open' : ''}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <button 
        className="faq-question" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="faq-question-text">{question}</span>
        <span className="faq-icon" style={{ color: isOpen ? color : '#64748b' }}>
          {isOpen ? '−' : '+'}
        </span>
      </button>
      
      <div className={`faq-answer ${isOpen ? 'open' : ''}`}>
        <div className="faq-answer-content">
          {answer}
        </div>
      </div>
    </div>
  );
};

export default FaqItem;
