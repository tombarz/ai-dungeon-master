/**
 * Schemas exports - organized by domain for better maintainability
 *
 * This file maintains the same public API while providing better organization
 * internally. All schemas and parsers are re-exported from organized domain files.
 */

// Re-export all schemas from organized domains
export * from "./schemas/core";
export * from "./schemas/dice";
export * from "./schemas/entities";
export * from "./schemas/game-state";
