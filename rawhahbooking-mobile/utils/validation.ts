import { z } from 'zod';

// Destination validation
const destinationSchema = z.object({
  city: z.string().min(1, 'Destination is required'),
  country: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

// Date validation
const datesSchema = z.object({
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
}).refine((data) => {
  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);
  return checkIn < checkOut;
}, {
  message: 'Check-out date must be after check-in date',
  path: ['checkOut'],
});

// Guests validation
const guestsSchema = z.object({
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

// Budget validation
const budgetSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
}).refine((data) => {
  if (data.min && data.max) {
    return data.min <= data.max;
  }
  return true;
}, {
  message: 'Minimum budget cannot be greater than maximum budget',
  path: ['max'],
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
  groupName: z.string().optional(),
  totalTravelers: z.number().min(1, 'Total travelers must be at least 1'),
  roomingPreference: z.enum(['twin', 'triple', 'quad', 'mixed']).optional(),
  subGroups: z.array(subGroupSchema).optional(),
  coordinator: contactSchema.optional(),
});

// Main hotel inquiry validation schema
export const hotelInquirySchema = z.object({
  destination: destinationSchema,
  dates: datesSchema,
  rooms: z.number().min(1, 'At least 1 room is required'),
  guests: guestsSchema,
  budget: budgetSchema.optional(),
  contact: contactSchema,
  groupBooking: z.boolean().default(false),
  group: groupSchema.optional(),
  specialRequests: z.string().optional(),
}).refine((data) => {
  // Group booking validations
  if (data.groupBooking && data.group) {
    const totalGuestsFromForm = data.guests.adults + data.guests.children;
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