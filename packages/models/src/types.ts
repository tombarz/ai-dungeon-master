/**
 * Types exports - organized by domain for better maintainability
 *
 * This file maintains the same public API while providing better organization
 * internally. All types are re-exported from organized domain files.
 */

// Re-export all types from organized domains
export * from "./types/core";
export * from "./types/entities";
export * from "./types/game-state";