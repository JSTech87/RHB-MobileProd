# Hotel Inquiry Screen - Implementation Guide

## Overview

The Hotel Inquiry Screen is a comprehensive React Native form that captures hotel booking inquiries with support for both individual and group bookings. It includes WhatsApp integration, draft autosave, and professional validation.

## Features

### ✅ Implemented Features

- **Professional Form Design**: Matches web design with clean, modern UI
- **Comprehensive Validation**: Zod-based validation with helpful error messages
- **Draft Autosave**: Automatic saving every 2 seconds with restoration on app restart
- **WhatsApp Integration**: Deep link with prefilled inquiry message
- **Group Booking Support**: Advanced group management with coordinator details
- **Destination Autocomplete**: API-based destination search with fallback
- **Date Range Selection**: Native date pickers with validation
- **Guest Management**: Adults, children, and child age collection
- **Budget Range**: Optional min/max budget specification
- **Contact Form**: Full name, email, and phone validation
- **Special Requests**: Multiline text input for custom requirements
- **Professional Typography**: Industry-standard font weights throughout
- **Accessibility**: VoiceOver/TalkBack support with proper labels
- **Offline Support**: Draft persistence and graceful API failure handling

### 🎨 UI/UX Features

- **Responsive Design**: Adapts to different screen sizes
- **Keyboard Handling**: Smart keyboard avoidance and persistence
- **Loading States**: Visual feedback during form submission
- **Error Handling**: User-friendly error messages and recovery options
- **Professional Styling**: Consistent with app design system
- **Interactive Elements**: Smooth animations and touch feedback

## File Structure

```
rawhahbooking-mobile/
├── screens/
│   └── HotelInquiryScreen.tsx          # Main screen component
├── components/form/
│   ├── DestinationInput.tsx            # Autocomplete destination picker
│   ├── DateRangeField.tsx              # Check-in/check-out date selection
│   ├── GuestCount.tsx                  # Adults, children, and ages
│   ├── BudgetRange.tsx                 # Min/max budget inputs
│   ├── ContactForm.tsx                 # Name, email, phone fields
│   ├── GroupSection.tsx                # Group booking details
│   └── SpecialRequestsInput.tsx        # Multiline text area
├── services/
│   └── api.ts                          # API integration and WhatsApp service
├── utils/
│   ├── validation.ts                   # Zod schemas and validation logic
│   └── storage.ts                      # Draft autosave functionality
└── constants/
    └── Typography.ts                   # Professional typography system
```

## Environment Variables Required

```bash
# API Configuration
EXPO_PUBLIC_API_BASE_URL=https://api.rawhahbooking.com

# WhatsApp Business Integration
EXPO_PUBLIC_WABA_NUMBER=15551234567  # E.164 format without +

# Optional: Google Places API (if using Google autocomplete)
EXPO_PUBLIC_GOOGLE_PLACES_KEY=your_google_places_api_key
```

## API Integration

### Hotel Inquiry Submission

**Endpoint**: `POST /api/inquiries/hotels`

**Request Payload**:
```json
{
  "source": "mobile",
  "destination": {
    "city": "Makkah",
    "country": "Saudi Arabia",
    "lat": 21.389,
    "lng": 39.857
  },
  "dates": {
    "checkIn": "2025-11-10",
    "checkOut": "2025-11-15"
  },
  "rooms": 2,
  "guests": {
    "adults": 3,
    "children": 2,
    "childAges": [6, 9]
  },
  "budget": {
    "min": 120,
    "max": 240
  },
  "contact": {
    "fullName": "Aisha Khan",
    "email": "aisha@example.com",
    "phone": "+966500000000"
  },
  "groupBooking": true,
  "group": {
    "groupName": "Family & Friends",
    "totalTravelers": 5,
    "roomingPreference": "mixed",
    "coordinator": {
      "name": "Aisha Khan",
      "phone": "+966500000000",
      "email": "aisha@example.com"
    }
  },
  "specialRequests": "Near Haram, breakfast included",
  "appMeta": {
    "appVersion": "1.0.0",
    "locale": "en",
    "currency": "USD"
  }
}
```

**Success Response**:
```json
{
  "id": "inq_abc123",
  "status": "received",
  "message": "Hotel inquiry received successfully"
}
```

### Destination Search

**Endpoint**: `GET /api/destinations?q={query}`

**Response**:
```json
{
  "destinations": [
    {
      "city": "Makkah",
      "country": "Saudi Arabia",
      "region": "Makkah Province",
      "lat": 21.389,
      "lng": 39.857
    }
  ]
}
```

## Testing Instructions

### Manual Testing Checklist

#### Form Validation
- [ ] Cannot submit without destination
- [ ] Cannot submit without check-in/check-out dates
- [ ] Check-out date must be after check-in date
- [ ] At least 1 adult required
- [ ] Child ages required when children > 0
- [ ] Valid email format required
- [ ] Phone number required
- [ ] Budget min cannot exceed max

#### Group Booking
- [ ] Group toggle shows/hides group section
- [ ] Total travelers must be >= adults + children
- [ ] Rooming preference selection works
- [ ] Coordinator defaults to contact info

#### WhatsApp Integration
- [ ] WhatsApp button generates correct deep link
- [ ] Message contains all form data
- [ ] Handles WhatsApp not installed gracefully
- [ ] Works with partial form data

#### Draft Functionality
- [ ] Form data saves automatically after changes
- [ ] Draft restoration prompt appears on app restart
- [ ] Draft clears after successful submission
- [ ] Draft persists through app crashes

#### Accessibility
- [ ] All inputs have proper labels
- [ ] VoiceOver/TalkBack reads form correctly
- [ ] Touch targets are adequate size
- [ ] Error messages are announced

### Device Testing

#### iOS Testing
```bash
# Run on iOS simulator
npx expo run:ios

# Test on physical device
npx expo run:ios --device
```

#### Android Testing
```bash
# Run on Android emulator
npx expo run:android

# Test on physical device
npx expo run:android --device
```

### Network Testing

#### Offline Scenarios
- [ ] Form works without internet connection
- [ ] Draft saving works offline
- [ ] Graceful handling of API failures
- [ ] WhatsApp fallback when API down

#### API Error Handling
- [ ] Network timeout handling
- [ ] Invalid response handling
- [ ] Server error (5xx) handling
- [ ] Rate limiting handling

## Known Limitations

1. **Destination Search**: Falls back to basic text input if API unavailable
2. **WhatsApp Integration**: Requires WhatsApp app installation
3. **Group Sub-Groups**: Simplified implementation without full sub-group management
4. **Internationalization**: English only (Arabic support planned)
5. **Offline Submission**: Requires network for form submission

## Performance Considerations

- **Form Validation**: Debounced to prevent excessive validation calls
- **Draft Saving**: Throttled to every 2 seconds to prevent storage spam
- **API Calls**: Properly cancelled when component unmounts
- **Memory Usage**: Form state optimized for large forms

## Future Enhancements

### Planned Features
- [ ] Arabic language support (RTL layout)
- [ ] Advanced sub-group management
- [ ] Photo attachment for special requests
- [ ] Integration with calendar apps
- [ ] Push notifications for inquiry status
- [ ] Offline submission queue

### Technical Improvements
- [ ] Form state persistence across navigation
- [ ] Advanced validation with async rules
- [ ] Better error recovery mechanisms
- [ ] Performance monitoring integration
- [ ] A/B testing framework integration

## Troubleshooting

### Common Issues

**Form not submitting**
- Check network connection
- Verify API endpoint configuration
- Check form validation errors

**Draft not saving**
- Check AsyncStorage permissions
- Verify storage space available
- Check console for storage errors

**WhatsApp not opening**
- Verify WABA number configuration
- Check WhatsApp app installation
- Test deep link format manually

**Validation errors**
- Check Zod schema configuration
- Verify form field mappings
- Test with different data types

### Debug Mode

Enable debug logging by setting:
```javascript
console.log('Debug mode enabled');
// Add to form component for detailed logging
```

## Support

For technical issues or questions:
- Check console logs for error details
- Review API response status codes
- Test on multiple devices/platforms
- Contact development team with reproduction steps

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Compatibility**: React Native 0.72+, Expo SDK 49+ 