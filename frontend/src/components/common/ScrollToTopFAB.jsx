import React, { useState, useEffect } from 'react';
import './ScrollToTopFAB.css';

export default function ScrollToTopFAB() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) {
    return null;
  }

  return (
    <button
      className="scroll-to-top-fab"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      type="button"
    >
      ↑
    </button>
  );
}
