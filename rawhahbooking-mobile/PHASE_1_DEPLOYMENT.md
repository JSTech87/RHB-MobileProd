# Phase 1 Deployment Guide

## 🚀 Deploy Phase 1: Foundation & Core Services

### Prerequisites
- Supabase CLI installed: `npm install -g supabase`
- Logged into Supabase: `supabase login`
- Project linked: `supabase link --project-ref YOUR_PROJECT_ID`

### Step 1: Deploy Database Schema

```bash
# Navigate to project directory
cd /Users/jsolebo/Desktop/RHB-MobileProd/rawhahbooking-mobile

# Apply database migrations
supabase db push

# Or manually run the migration
supabase db reset
```

### Step 2: Set Environment Variables

Set these in your Supabase Dashboard → Project Settings → Environment Variables:

```bash
DUFFEL_API_TOKEN=your_duffel_test_token_here
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 3: Deploy Edge Functions

```bash
# Deploy all functions at once
supabase functions deploy

# Or deploy individually:
supabase functions deploy flight-search
supabase functions deploy airports
supabase functions deploy customer-management
```

### Step 4: Test Deployment

#### Test Flight Search Function
```bash
curl -X POST \
  'https://your-project-id.supabase.co/functions/v1/flight-search' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "slices": [
      {
        "origin": "JFK",
        "destination": "LAX", 
        "departure_date": "2024-12-25"
      }
    ],
    "passengers": [
      {"type": "adult"}
    ],
    "cabin_class": "economy"
  }'
```

#### Test Airport Search Function
```bash
curl -X GET \
  'https://your-project-id.supabase.co/functions/v1/airports?q=New York&limit=5' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

#### Test Customer Management Function
```bash
curl -X POST \
  'https://your-project-id.supabase.co/functions/v1/customer-management' \
  -H 'Authorization: Bearer YOUR_USER_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "given_name": "John",
    "family_name": "Doe",
    "phone_number": "+1234567890"
  }'
```

### Step 5: Update Mobile App Environment

Update your mobile app's `.env` file:

```bash
# Remove this (no longer needed in mobile app)
# EXPO_PUBLIC_DUFFEL_API_TOKEN=...

# Ensure these are set correctly
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Step 6: Test Mobile App Integration

```bash
# In your mobile app directory
cd /Users/jsolebo/Desktop/RHB-MobileProd/rawhahbooking-mobile

# Start the development server
npm start

# Test the search functionality in the app
```

## 🧪 Testing Checklist

- [ ] Database tables created successfully
- [ ] Edge Functions deployed without errors
- [ ] Flight search returns real Duffel data
- [ ] Airport search works correctly
- [ ] Customer management functions work
- [ ] Mobile app can connect to backend
- [ ] Error handling works properly
- [ ] Authentication flow works

## 🐛 Troubleshooting

### Common Issues:

1. **"Duffel API token not found"**
   - Verify environment variables are set in Supabase Dashboard
   - Redeploy functions after setting variables

2. **"CORS errors"**
   - Check that corsHeaders are properly imported
   - Verify function returns proper CORS headers

3. **"Database connection failed"**
   - Check RLS policies are set correctly
   - Verify Supabase service role key is set

4. **"Function timeout"**
   - Duffel API calls may take 15-20 seconds
   - This is normal for flight searches

### View Function Logs:
```bash
supabase functions logs flight-search
supabase functions logs airports
supabase functions logs customer-management
```

### Reset Database (if needed):
```bash
supabase db reset
```

## ✅ Success Criteria

Phase 1 is successful when:

1. ✅ All Edge Functions deploy without errors
2. ✅ Database schema is created with proper RLS policies
3. ✅ Flight search returns real offers from Duffel API
4. ✅ Airport search returns valid airport data
5. ✅ Customer management creates users in both Duffel and Supabase
6. ✅ Mobile app successfully calls backend instead of direct API
7. ✅ Error handling provides useful feedback to users

## 🎯 Next Steps

After Phase 1 is complete, we'll move to **Phase 2**:
- Enhanced flight search with loyalty programs
- Seat selection implementation
- Advanced filtering and search optimization
- Performance improvements and caching

---

**Phase 1 Complete! 🎉** Your flight booking app now has a secure, production-ready backend architecture. 