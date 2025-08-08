# Hotel Inquiry Setup Guide

## 🚀 Quick Setup

Your hotel inquiry feature is now ready! Here's how to configure it:

## 1. 📱 WhatsApp Business Configuration

1. **Get your WhatsApp Business number** (if you don't have one):
   - Go to [WhatsApp Business API](https://business.whatsapp.com/)
   - Set up your business account
   - Get your phone number in E.164 format (example: `1234567890` for +1-234-567-8900)

2. **Update your `.env` file**:
   ```bash
   # Replace with your actual WhatsApp Business number (no + sign)
   EXPO_PUBLIC_WABA_NUMBER=1234567890
   ```

## 2. 📧 Resend Email Configuration

1. **Get your Resend API key**:
   - Go to [Resend.com](https://resend.com)
   - Create an account (free tier available)
   - Go to API Keys and create a new key
   - Copy the API key (starts with `re_`)

2. **Update your `.env` file**:
   ```bash
   # Replace with your actual Resend API key
   RESEND_API_KEY=re_your_actual_api_key_here

   # Replace with your actual email addresses
   INQUIRY_EMAIL_TO=your-email@yourdomain.com
   INQUIRY_EMAIL_FROM=noreply@yourdomain.com
   ```

3. **Verify your domain** (for production):
   - In Resend dashboard, add and verify your domain
   - Update the `INQUIRY_EMAIL_FROM` to use your verified domain

## 3. 🔧 Current Configuration

Your current `.env` file should look like this:

```bash
# Clerk Authentication
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Z3Jvd2luZy1jcm93LTQxLmNsZXJrLmFjY291bnRzLmRldiQ

# Supabase Database
EXPO_PUBLIC_SUPABASE_URL=https://karldxbrqccpuocfehvz.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Hotel Inquiry API Configuration
EXPO_PUBLIC_API_BASE_URL=https://api.rawhahbooking.com

# WhatsApp Business API - REPLACE WITH YOUR NUMBER
EXPO_PUBLIC_WABA_NUMBER=1234567890

# Resend Email API - REPLACE WITH YOUR API KEY
RESEND_API_KEY=re_your_actual_api_key_here

# Email Configuration - REPLACE WITH YOUR EMAILS
INQUIRY_EMAIL_TO=your-email@yourdomain.com
INQUIRY_EMAIL_FROM=noreply@yourdomain.com
```

## 4. 🧪 Testing the Feature

1. **Start the app**:
   ```bash
   npx expo start
   ```

2. **Test the hotel inquiry**:
   - Open the app
   - Go to Search tab
   - Select "Hotel" tab
   - Fill out the form
   - Submit or try WhatsApp

3. **What happens when form is submitted**:
   - ✅ Form validation occurs
   - ✅ Unique inquiry ID is generated (format: `HTL-timestamp-XXXXXX`)
   - ✅ Email sent to you with all inquiry details
   - ✅ Confirmation email sent to guest
   - ✅ Success message shown to user
   - ✅ Draft is cleared

4. **What happens with WhatsApp button**:
   - ✅ WhatsApp opens with prefilled message
   - ✅ Message contains all form details
   - ✅ Fallback if WhatsApp not installed

## 5. 📧 Email Templates

### Admin Notification Email
- **Subject**: `🏨 New Hotel Inquiry - [Destination] | [ID]`
- **Content**: Professional HTML email with:
  - Guest information
  - Travel details
  - Accommodation requirements
  - Group booking details (if applicable)
  - Special requests
  - Quick action buttons (Reply, Call, WhatsApp)

### Guest Confirmation Email
- **Subject**: `Hotel Inquiry Confirmation - [ID]`
- **Content**: Clean confirmation with:
  - Thank you message
  - Inquiry reference ID
  - What happens next
  - Response time expectation (10-15 minutes)

## 6. 🔧 Customization Options

### Update Email Templates
Edit `services/emailService.ts` to customize:
- Email styling
- Content sections
- Branding elements
- Call-to-action buttons

### Update WhatsApp Message Format
Edit `services/api.ts` in the `whatsAppService.formatMessage` method to customize:
- Message structure
- Information included
- Formatting style

### Update Form Fields
Edit form components in `components/form/` to:
- Add new fields
- Modify validation
- Change UI elements

## 7. 🚨 Troubleshooting

### Emails Not Sending
1. Check Resend API key is correct
2. Verify domain is verified in Resend (for production)
3. Check console logs for error messages
4. Ensure email addresses are valid

### WhatsApp Not Opening
1. Verify WhatsApp number format (E.164 without +)
2. Test WhatsApp URL manually
3. Check if WhatsApp is installed on device

### Form Validation Issues
1. Check console for validation errors
2. Verify all required fields are filled
3. Check date format and ranges

## 8. 🚀 Production Deployment

Before going live:

1. **Replace simulated API** in `services/api.ts`:
   - Uncomment the actual API call
   - Comment out the simulated response
   - Set up your backend API endpoint

2. **Update environment variables**:
   - Use production API URLs
   - Use verified email domains
   - Use production WhatsApp Business number

3. **Test thoroughly**:
   - Test all form scenarios
   - Test email delivery
   - Test WhatsApp integration
   - Test error handling

## 9. 📊 Analytics & Monitoring

The app logs these events:
- `hotel_inquiry_opened`
- `hotel_inquiry_submitted`
- `hotel_inquiry_whatsapp_clicked`

You can integrate with your analytics service to track:
- Inquiry conversion rates
- Popular destinations
- Form abandonment points
- Email delivery rates

## 🎉 You're All Set!

Your hotel inquiry feature is now fully functional with:
- ✅ Professional form validation
- ✅ WhatsApp Business integration
- ✅ Email notifications via Resend
- ✅ Draft autosave
- ✅ Group booking support
- ✅ Mobile-optimized UI
- ✅ Professional email templates

Need help? Check the console logs for any error messages or refer to the troubleshooting section above. 