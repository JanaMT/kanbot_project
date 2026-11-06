/**
 * Label color utilities for consistent, deterministic label presentation.
 * Colors are accessible in both light and dark modes.
 */

// Accessible color palette that works in light and dark modes
const LABEL_COLORS = [
  '#1976d2', // Blue
  '#388e3c', // Green
  '#d32f2f', // Red
  '#f57c00', // Orange
  '#7b1fa2', // Purple
  '#0097a7', // Cyan
  '#c2185b', // Pink
  '#5d4037', // Brown
  '#455a64', // Blue Grey
  '#00796b', // Teal
] as const;

/**
 * Generate a deterministic color for a label based on its normalized name.
 * The same label will always produce the same color.
 */
export function getLabelColor(label: string): string {
  // Normalize: lowercase and trim
  const normalized = label.toLowerCase().trim();
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Map to color index
  const index = Math.abs(hash) % LABEL_COLORS.length;
  return LABEL_COLORS[index];
}
