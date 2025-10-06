import React from "react";

export interface ButtonProps {
  title: string;
  onPress: () => void;
}

/** Minimal button placeholder for demos */
export const Button: React.FC<ButtonProps> = ({ title, onPress }) => {
  return React.createElement("button", { onClick: onPress }, title);
};
