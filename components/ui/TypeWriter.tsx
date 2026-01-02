import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';

interface TypeWriterProps extends TextProps {
  children: string; // The text to type
  delay?: number;   // Delay between characters in ms
  minDelay?: number; // Minimum random delay
  maxDelay?: number; // Maximum random delay
  typing?: number; // 1 for typing, 0 for paused, -1 for deleting (not implemented fully for simple use)
  loop?: boolean; // Whether to loop the typing effect
}

export const TypeWriter: React.FC<TypeWriterProps> = ({ 
  children, 
  delay = 50, 
  minDelay, 
  maxDelay,
  typing = 1,
  style, 
  ...rest 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (typing === 0) return;

    if (currentIndex < children.length) {
      const timeoutVal = (minDelay && maxDelay) 
        ? Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay
        : delay;

      const timeoutId = setTimeout(() => {
        setDisplayedText((prev) => prev + children[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, timeoutVal);

      return () => clearTimeout(timeoutId);
    }
  }, [currentIndex, children, delay, minDelay, maxDelay, typing]);

  // Reset if content changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [children]);

  return (
    <Text style={style} {...rest}>
      {displayedText}
    </Text>
  );
};

const styles = StyleSheet.create({});
