// UI components placeholder for AI Dungeon Master
// Future implementation will have shared React Native components with react-native-web support

import React from "react";

export interface ButtonProps {
  title: string;
  onPress: () => void;
}

// Simple button placeholder
export const Button: React.FC<ButtonProps> = ({ title, onPress }) => {
  return React.createElement('button', { onClick: onPress }, title);
};

export interface CardProps {
  children: React.ReactNode;
}

// Simple card placeholder  
export const Card: React.FC<CardProps> = ({ children }) => {
  return React.createElement('div', { style: { padding: '16px', border: '1px solid #ccc' } }, children);
};