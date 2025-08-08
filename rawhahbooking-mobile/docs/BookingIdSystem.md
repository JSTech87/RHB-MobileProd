# Sequential Daily Booking ID System

## Overview

The Rawhah Booking platform now uses a professional, human-friendly, sequential booking ID system that replaces the previous timestamp-based approach.

## Format

```
RHB-HTL-YYYYMMDD-####
```

### Breakdown
- **RHB**: Static brand prefix (RawhahBooking)
- **HTL**: Service type (HTL=hotels, FLT=flights, PKG=packages)
- **YYYYMMDD**: Date of request in UTC format
- **####**: Sequential number (0001-9999) that resets daily

## Examples

```
RHB-HTL-20250808-0001  # First hotel booking of August 8, 2025
RHB-HTL-20250808-0002  # Second hotel booking of the same day
RHB-HTL-20250808-0147  # 147th hotel booking of the same day
RHB-FLT-20250808-0001  # First flight booking of August 8, 2025
RHB-PKG-20250809-0001  # First package booking of August 9, 2025
```

## Features

### ✅ Sequential Counter
- Starts at `0001` each day at midnight UTC
- Increments for each booking of the same service type
- Resets to `0001` at the start of each new day

### ✅ Service Flexibility
- **HTL**: Hotel bookings
- **FLT**: Flight bookings (future)
- **PKG**: Package bookings (future)
- Easy to extend for new services

### ✅ Uniqueness Guarantee
- No duplicate IDs possible within the same day and service
- Concurrent booking support with proper sequencing

### ✅ Backwards Compatibility
- Existing bookings with old IDs remain unchanged
- System gracefully handles both old and new formats

## Technical Implementation

### Current Status
- ✅ Implemented in `services/api.ts`
- ✅ Used by hotel inquiry system
- ✅ Includes concurrency testing utilities
- ✅ Fallback mechanism for error scenarios

### API Usage

```typescript
import { BookingIdGenerator } from './services/api';

// Generate a hotel booking ID
const hotelId = await BookingIdGenerator.generate('HTL');
console.log(hotelId); // RHB-HTL-20250808-0001

// Get today's statistics
const stats = BookingIdGenerator.getStats('HTL');
console.log(stats);
/*
{
  date: "20250808",
  totalBookings: 5,
  serviceBreakdown: { HTL: 3, FLT: 2 },
  lastBookingId: "RHB-HTL-20250808-0003"
}
*/

// Test concurrent bookings
const testResult = await BookingIdGenerator.testConcurrent('HTL', 10);
console.log(testResult.success); // true (no duplicates)
```

## Production Database Schema

### Required Table: `booking_sequences`

```sql
CREATE TABLE booking_sequences (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  booking_id VARCHAR(50) UNIQUE NOT NULL,
  sequence_number INTEGER NOT NULL,
  date_part VARCHAR(8) NOT NULL,
  service_type VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE UNIQUE INDEX idx_booking_id ON booking_sequences(booking_id);
CREATE INDEX idx_date_service ON booking_sequences(date_part, service_type);
CREATE INDEX idx_sequence ON booking_sequences(date_part, service_type, sequence_number);
```

### Concurrency Safety

For production deployment, implement database transactions:

```sql
BEGIN TRANSACTION;

SELECT MAX(sequence_number) 
FROM booking_sequences 
WHERE date_part = ? AND service_type = ? 
FOR UPDATE;

INSERT INTO booking_sequences 
(booking_id, sequence_number, date_part, service_type) 
VALUES (?, ?, ?, ?);

COMMIT;
```

## Testing

### Concurrency Test
```typescript
// Test 100 concurrent hotel bookings
const result = await BookingIdGenerator.testConcurrent('HTL', 100);
console.log(result.success); // Should be true (no duplicates)
```

### Daily Reset Simulation
The system automatically handles daily resets. Each new UTC day starts the sequence at `0001`.

## Benefits

### 🎯 Professional Appearance
- Clean, readable format
- Easy to communicate over phone/email
- Consistent with industry standards

### 📊 Trackable & Sortable
- Chronological ordering built-in
- Easy to identify booking date
- Simple to filter by service type

### 🔍 Searchable & Indexable
- Database-friendly structure
- Fast lookups and filtering
- Efficient storage and indexing

### 📈 Scalable
- Supports 9,999 bookings per service per day
- Easy to extend for new services
- Handles high-volume scenarios

## Migration Notes

### Current Implementation
- In-memory storage for demo/development
- Includes comprehensive logging and monitoring
- Fallback to timestamp-based IDs if generation fails

### Production Deployment
1. Create database table with proper indexes
2. Implement transaction-based ID generation
3. Add Redis caching layer (optional)
4. Set up monitoring and alerting
5. Test concurrency under load

## Monitoring

The system provides built-in statistics and logging:

```javascript
// Check today's booking activity
console.log('Today\'s stats:', BookingIdGenerator.getStats());

// Monitor specific service
console.log('Hotel bookings:', BookingIdGenerator.getStats('HTL'));
```

## Support

For questions or issues with the booking ID system, refer to:
- Implementation: `services/api.ts`
- Tests: `BookingIdGenerator.testConcurrent()`
- Logs: Console output shows generation details 