// Professional Typography System
// Industry-standard font weights for consistent UI

export const Typography = {
  // Font Weights
  weights: {
    normal: '400',      // Body text, labels, captions
    medium: '500',      // Input values, secondary headings  
    semiBold: '600',    // Primary headings, buttons, important text
    bold: '700',        // Only for critical identifiers (airport codes, etc)
  },

  // Text Styles
  styles: {
    // Headers
    headerLarge: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 32,
    },
    headerMedium: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    headerSmall: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
    },

    // Body Text
    bodyLarge: {
      fontSize: 18,
      fontWeight: '500' as const,
      lineHeight: 24,
    },
    bodyMedium: {
      fontSize: 16,
      fontWeight: '500' as const,
      lineHeight: 22,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },

    // Labels & Captions
    label: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 18,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
    captionSmall: {
      fontSize: 10,
      fontWeight: '400' as const,
      lineHeight: 14,
    },

    // Buttons
    buttonLarge: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    buttonMedium: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 22,
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 18,
    },

    // Special Cases
    airportCode: {
      fontSize: 28,
      fontWeight: '700' as const, // Keep bold for critical identifiers
      lineHeight: 32,
    },
    price: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 26,
    },
    time: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
  },

  // Colors (for reference)
  colors: {
    primary: '#000000',
    secondary: '#6c757d',
    accent: '#A83442',
    muted: '#9ca3af',
    light: '#f8f9fa',
  },
};

// Helper function to apply typography styles
export const applyTypography = (style: keyof typeof Typography.styles) => {
  return Typography.styles[style];
};

export default Typography; 