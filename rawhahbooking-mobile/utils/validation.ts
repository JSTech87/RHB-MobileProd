import { z } from 'zod';

// Hotel choice validation
const hotelChoiceSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('specific'),
    hotelId: z.string().min(1, 'Hotel selection is required'),
    hotelName: z.string().min(1, 'Hotel name is required'),
  }),
  z.object({
    type: z.literal('preferences'),
    rating: z.number().min(3).max(5).optional(),
    distanceMeters: z.number().min(0).optional(),
    mealPlan: z.enum(['RO', 'BB', 'HB', 'FB', 'AI']).optional(),
    budget: z.object({
      min: z.number().min(0).optional(),
      max: z.number().min(0).optional(),
    }).optional(),
    brands: z.array(z.string()).optional(),
    facilities: z.array(z.string()).optional(),
  }).refine((data) => {
    // At least one preference should be provided
    return data.rating !== undefined || 
           data.distanceMeters !== undefined || 
           data.mealPlan !== undefined || 
           data.budget !== undefined || 
           (data.brands && data.brands.length > 0) || 
           (data.facilities && data.facilities.length > 0);
  }, {
    message: 'Please provide at least one hotel preference',
  }),
]);

// Stay validation
const staySchema = z.object({
  destination: z.object({
    city: z.string().min(1, 'Destination is required'),
    country: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }),
  dates: z.object({
    checkIn: z.string().min(1, 'Check-in date is required'),
    checkOut: z.string().min(1, 'Check-out date is required'),
  }).refine((data) => {
    const checkIn = new Date(data.checkIn);
    const checkOut = new Date(data.checkOut);
    return checkIn < checkOut;
  }, {
    message: 'Check-out date must be after check-in date',
    path: ['checkOut'],
  }),
  rooms: z.number().min(1, 'At least 1 room is required'),
  hotelChoice: hotelChoiceSchema,
  notes: z.string().optional(),
});

// Travelers validation
const travelersSchema = z.object({
  adults: z.number().min(1, 'At least 1 adult is required'),
  children: z.number().min(0, 'Children count cannot be negative'),
  childAges: z.array(z.number().min(0).max(17)).optional(),
}).refine((data) => {
  if (data.children > 0) {
    return data.childAges && data.childAges.length === data.children;
  }
  return true;
}, {
  message: 'Please provide ages for all children',
  path: ['childAges'],
});

// Contact validation
const contactSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(1, 'Phone number is required'),
});

// Sub-group validation
const subGroupSchema = z.object({
  label: z.string().min(1, 'Group label is required'),
  travelers: z.number().min(1, 'At least 1 traveler per group'),
});

// Group validation
const groupSchema = z.object({
  totalTravelers: z.number().min(1, 'Total travelers must be at least 1'),
  roomingPreference: z.enum(['twin', 'triple', 'quad', 'mixed']).optional(),
  subGroups: z.array(subGroupSchema).optional(),
  coordinator: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }).optional(),
});

// Main multi-stay hotel inquiry validation schema
export const multiStayHotelInquirySchema = z.object({
  stays: z.array(staySchema)
    .min(1, 'At least one stay is required')
    .max(6, 'Maximum 6 stays allowed'),
  travelers: travelersSchema,
  contact: contactSchema,
  groupBooking: z.boolean().default(false),
  group: groupSchema.optional(),
  tripRequests: z.string().optional(),
}).refine((data) => {
  // Group booking validations
  if (data.groupBooking && data.group) {
    const totalGuestsFromForm = data.travelers.adults + data.travelers.children;
    return data.group.totalTravelers >= totalGuestsFromForm;
  }
  return true;
}, {
  message: 'Total travelers in group must be at least equal to adults + children',
  path: ['group', 'totalTravelers'],
}).refine((data) => {
  // Sub-groups sum validation
  if (data.groupBooking && data.group?.subGroups && data.group.subGroups.length > 0) {
    const subGroupSum = data.group.subGroups.reduce((sum, sg) => sum + sg.travelers, 0);
    return subGroupSum <= (data.group.totalTravelers || 0);
  }
  return true;
}, {
  message: 'Sub-groups total cannot exceed total travelers',
  path: ['group', 'subGroups'],
}).refine((data) => {
  // Check for overlapping dates in the same city
  const conflicts: string[] = [];
  for (let i = 0; i < data.stays.length; i++) {
    for (let j = i + 1; j < data.stays.length; j++) {
      const stay1 = data.stays[i];
      const stay2 = data.stays[j];
      
      // Only check if same city
      if (stay1.destination.city.toLowerCase() === stay2.destination.city.toLowerCase()) {
        const start1 = new Date(stay1.dates.checkIn);
        const end1 = new Date(stay1.dates.checkOut);
        const start2 = new Date(stay2.dates.checkIn);
        const end2 = new Date(stay2.dates.checkOut);
        
        // Check for overlap
        if (start1 < end2 && start2 < end1) {
          conflicts.push(`Stay ${i + 1} and Stay ${j + 1} have overlapping dates in ${stay1.destination.city}`);
        }
      }
    }
  }
  
  // For now, just warn - don't block submission
  if (conflicts.length > 0) {
    console.warn('Date conflicts detected:', conflicts);
  }
  
  return true; // Allow submission but log warnings
});

export type MultiStayHotelInquiryFormData = z.infer<typeof multiStayHotelInquirySchema>;

// Backward compatibility - keep the old single-stay schema
export const hotelInquirySchema = z.object({
  destination: z.object({
    city: z.string().min(1, 'Destination is required'),
    country: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }),
  dates: z.object({
    checkIn: z.string().min(1, 'Check-in date is required'),
    checkOut: z.string().min(1, 'Check-out date is required'),
  }).refine((data) => {
    const checkIn = new Date(data.checkIn);
    const checkOut = new Date(data.checkOut);
    return checkIn < checkOut;
  }, {
    message: 'Check-out date must be after check-in date',
    path: ['checkOut'],
  }),
  rooms: z.number().min(1, 'At least 1 room is required'),
  guests: travelersSchema, // Reuse the travelers schema
  budget: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  contact: contactSchema,
  groupBooking: z.boolean().default(false),
  group: groupSchema.optional(),
  specialRequests: z.string().optional(),
});

export type HotelInquiryFormData = z.infer<typeof hotelInquirySchema>;

// Validation helpers
export const validateDestination = (destination: string) => {
  return destination.length >= 2;
};

export const validateDateRange = (checkIn: string, checkOut: string) => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return {
    isValidRange: checkInDate < checkOutDate,
    isCheckInFuture: checkInDate >= today,
    isCheckOutFuture: checkOutDate >= today,
  };
};

export const validateChildAges = (children: number, childAges: number[]) => {
  if (children === 0) return true;
  return childAges.length === children && childAges.every(age => age >= 0 && age <= 17);
}; 