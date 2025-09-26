import '@testing-library/jest-dom/vitest'
import React from 'react'
;(globalThis as any).React = React

if (typeof window !== 'undefined' && !window.HTMLElement.prototype.scrollTo) {
  window.HTMLElement.prototype.scrollTo = () => undefined
}