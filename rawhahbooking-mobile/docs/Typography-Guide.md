# Typography Guide - Rawhah Booking Mobile

## Professional Font Weight System

This guide establishes industry-standard typography for consistent, professional appearance across all screens.

## Font Weight Standards

### Weight Hierarchy
- **`'400'` (Normal)**: Body text, labels, captions, secondary information
- **`'500'` (Medium)**: Input values, form data, secondary headings
- **`'600'` (Semi-Bold)**: Primary headings, buttons, important UI elements
- **`'700'` (Bold)**: Reserved ONLY for critical identifiers (airport codes, prices)

## Usage Guidelines

### ✅ DO Use These Patterns

#### Headers & Titles
```typescript
// Page titles, modal headers
fontSize: 20,
fontWeight: '600'

// Section headers, card titles  
fontSize: 18,
fontWeight: '600'

// Subsection headers
fontSize: 16,
fontWeight: '600'
```

#### Body Text & Content
```typescript
// Main content, input values
fontSize: 16,
fontWeight: '500'

// Secondary content, descriptions
fontSize: 14,
fontWeight: '400'

// Labels, captions, helper text
fontSize: 12,
fontWeight: '400'
```

#### Buttons & Interactive Elements
```typescript
// Primary buttons
fontSize: 16,
fontWeight: '600'

// Secondary buttons, links
fontSize: 14,
fontWeight: '500'
```

#### Special Cases
```typescript
// Airport codes (critical identifiers)
fontSize: 28,
fontWeight: '700'

// Prices, times (important data)
fontSize: 18-20,
fontWeight: '600'
```

### ❌ DON'T Use These Patterns

```typescript
// Too bold for regular content
fontWeight: '700' // Only for airport codes & critical IDs
fontWeight: '800' // Never use
fontWeight: 'bold' // Use numeric values instead

// Inconsistent weights
fontWeight: '300' // Too light
fontWeight: '900' // Too heavy
```

## Implementation

### Import Typography System
```typescript
import { Typography } from '../constants/Typography';

// Use predefined styles
const styles = StyleSheet.create({
  title: {
    ...Typography.styles.headerMedium,
    color: '#000000',
  },
  content: {
    ...Typography.styles.bodyMedium,
    color: '#6c757d',
  },
});
```

### Manual Implementation
```typescript
const styles = StyleSheet.create({
  // Headers
  pageTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  
  // Content
  inputText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  
  // Labels
  fieldLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6c757d',
  },
});
```

## Screen-Specific Guidelines

### SearchScreen
- **Service tabs**: `fontWeight: '600'` (semi-bold)
- **Input values**: `fontWeight: '500'` (medium)
- **Field labels**: `fontWeight: '400'` (normal)
- **Button text**: `fontWeight: '600'` (semi-bold)

### FlightResultsScreen  
- **Page title**: `fontWeight: '600'` (semi-bold)
- **Airport codes**: `fontWeight: '700'` (bold) - Exception for critical IDs
- **Flight times**: `fontWeight: '600'` (semi-bold)
- **Airline names**: `fontWeight: '500'` (medium)
- **Helper text**: `fontWeight: '400'` (normal)

### FromToPicker Component
- **Dropdown title**: `fontWeight: '600'` (semi-bold)
- **Airport names**: `fontWeight: '500'` (medium)
- **Input labels**: `fontWeight: '400'` (normal)
- **IATA codes**: `fontWeight: '600'` (semi-bold)

## Industry Comparison

Our typography system matches industry leaders:

- **Expedia**: Medium weights for content, semi-bold for headers
- **Booking.com**: Clean hierarchy without excessive boldness
- **Kayak**: Professional weights with subtle emphasis
- **Airbnb**: Modern, readable typography

## Benefits

✅ **Professional appearance** - Industry-standard weights  
✅ **Better readability** - Less visual fatigue  
✅ **Clear hierarchy** - Information structure is obvious  
✅ **Consistent branding** - Unified look across all screens  
✅ **Accessibility** - Easier to read for all users  

## Migration Checklist

When updating existing screens:

- [ ] Replace `fontWeight: '700'` with `'600'` for headers
- [ ] Replace `fontWeight: '700'` with `'500'` for content  
- [ ] Replace `fontWeight: '600'` with `'500'` for secondary text
- [ ] Replace `fontWeight: '500'` with `'400'` for labels
- [ ] Keep `fontWeight: '700'` ONLY for airport codes
- [ ] Add line heights for better readability
- [ ] Test on different screen sizes

## Questions?

Contact the development team for clarification on typography decisions. 