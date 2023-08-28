'use client'

import React, { useState, useEffect } from 'react';

interface TypewriterProps {
  words: string[];
  delay?: number;
  pause?: number;
}

export const Typewriter: React.FC<TypewriterProps> = ({ words, delay = 300, pause = 1000 }) => {
    const [currentText, setCurrentText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [wordIndex, setWordIndex] = useState(0);
    const [deleting, setDeleting] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentColor, setCurrentColor] = useState('text-black');
    const [lastColor, setLastColor] = useState('');
  
    const colors = ['text-red-500', 'text-blue-500', 'text-green-500', 'text-yellow-500', 'text-purple-500'];
  
    useEffect(() => {
      if (currentIndex === 0 && !deleting) {
        const availableColors = colors.filter(color => color !== lastColor);
        const randomIndex = Math.floor(Math.random() * availableColors.length);
        const newColor = availableColors[randomIndex];
        
        setCurrentColor(newColor);
        setLastColor(newColor);
      }
  
      let typingDelay = deleting ? delay / 2 : delay;
  
      if (isPaused) {
        typingDelay = pause;
      }
  
      const timeout = setTimeout(() => {
      if (isPaused) {
        setIsPaused(false);
        setDeleting(true);
        return;
      }

      if (!deleting && currentIndex < words[wordIndex].length) {
        setCurrentText(prevText => prevText + words[wordIndex][currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      } else if (deleting && currentIndex > 0) {
        setCurrentText(prevText => prevText.substring(0, currentIndex - 1));
        setCurrentIndex(prevIndex => prevIndex - 1);
      } else if (currentIndex === words[wordIndex].length && !deleting) {
        setIsPaused(true);
      } else if (currentIndex === 0 && deleting) {
        setDeleting(false);
        setWordIndex((prevWordIndex) => (prevWordIndex + 1) % words.length);
      }
    }, typingDelay);

    return () => clearTimeout(timeout);
  }, [currentIndex, wordIndex, deleting, isPaused, delay, pause, words]);

  return (
    <span className={currentColor}>
      {currentText}
      <span className="cursor inline-block animate-blink-slow text-white">|</span>
    </span>
  );
};