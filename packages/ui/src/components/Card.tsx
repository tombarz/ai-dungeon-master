import React from "react";

export interface CardProps {
  children: React.ReactNode;
}

/** Lightweight card placeholder to frame content */
export const Card: React.FC<CardProps> = ({ children }) => {
  return React.createElement(
    "div",
    { style: { padding: "16px", border: "1px solid #ccc", borderRadius: "8px" } },
    children,
  );
};
