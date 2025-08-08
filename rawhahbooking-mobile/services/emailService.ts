import { HotelInquiryFormData } from '../utils/validation';

interface ResendEmailPayload {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text?: string;
}

interface ResendEmailResponse {
  id: string;
  from: string;
  to: string[];
  created_at: string;
}

class EmailService {
  private apiKey: string;
  private baseURL = 'https://api.resend.com';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Format hotel inquiry data for email
  formatHotelInquiryEmail(data: HotelInquiryFormData, inquiryId: string): { html: string; text: string } {
    const { destination, dates, guests, contact, rooms, budget, groupBooking, group, specialRequests } = data;

    // Calculate nights
    const checkInDate = new Date(dates.checkIn);
    const checkOutDate = new Date(dates.checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    // HTML Email Template
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hotel Inquiry - ${inquiryId}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: #A83442; color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .header p { margin: 10px 0 0; opacity: 0.9; font-size: 16px; }
          .content { padding: 30px; }
          .section { margin-bottom: 25px; }
          .section h2 { color: #A83442; font-size: 20px; font-weight: 600; margin: 0 0 15px; border-bottom: 2px solid #f0f0f0; padding-bottom: 8px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
          .info-item { background: #f8f9fa; padding: 15px; border-radius: 8px; }
          .info-label { font-weight: 600; color: #6c757d; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
          .info-value { font-size: 16px; color: #000; font-weight: 500; }
          .full-width { grid-column: 1 / -1; }
          .highlight { background: #e8f4f8; border-left: 4px solid #A83442; }
          .group-info { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin-top: 10px; }
          .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; color: #6c757d; font-size: 14px; }
          .priority { background: #d4edda; border: 1px solid #c3e6cb; }
          @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏨 New Hotel Inquiry</h1>
            <p>Reference ID: <strong>${inquiryId}</strong></p>
          </div>
          
          <div class="content">
            <!-- Guest Information -->
            <div class="section">
              <h2>👤 Guest Information</h2>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Full Name</div>
                  <div class="info-value">${contact.fullName}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Email</div>
                  <div class="info-value">${contact.email}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Phone</div>
                  <div class="info-value">${contact.phone}</div>
                </div>
              </div>
            </div>

            <!-- Travel Details -->
            <div class="section">
              <h2>✈️ Travel Details</h2>
              <div class="info-grid">
                <div class="info-item highlight">
                  <div class="info-label">Destination</div>
                  <div class="info-value">${destination.city}${destination.country ? `, ${destination.country}` : ''}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Check-in</div>
                  <div class="info-value">${checkInDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Check-out</div>
                  <div class="info-value">${checkOutDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Duration</div>
                  <div class="info-value">${nights} night${nights !== 1 ? 's' : ''}</div>
                </div>
              </div>
            </div>

            <!-- Accommodation Details -->
            <div class="section">
              <h2>🛏️ Accommodation Details</h2>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Guests</div>
                  <div class="info-value">${guests.adults} Adult${guests.adults !== 1 ? 's' : ''}${guests.children > 0 ? `, ${guests.children} Child${guests.children !== 1 ? 'ren' : ''}` : ''}</div>
                  ${guests.children > 0 && guests.childAges ? `<div style="margin-top: 5px; font-size: 14px; color: #6c757d;">Ages: ${guests.childAges.join(', ')}</div>` : ''}
                </div>
                <div class="info-item">
                  <div class="info-label">Rooms</div>
                  <div class="info-value">${rooms} Room${rooms !== 1 ? 's' : ''}</div>
                </div>
                ${budget?.min || budget?.max ? `
                <div class="info-item">
                  <div class="info-label">Budget (per night)</div>
                  <div class="info-value">
                    ${budget.min ? `$${budget.min}` : ''}${budget.min && budget.max ? ' - ' : ''}${budget.max ? `$${budget.max}` : ''}
                  </div>
                </div>
                ` : ''}
              </div>
            </div>

            ${groupBooking && group ? `
            <!-- Group Booking Details -->
            <div class="section">
              <h2>👥 Group Booking Details</h2>
              <div class="group-info">
                <div class="info-grid">
                  ${group.groupName ? `
                  <div class="info-item full-width">
                    <div class="info-label">Group Name</div>
                    <div class="info-value">${group.groupName}</div>
                  </div>
                  ` : ''}
                  <div class="info-item priority">
                    <div class="info-label">Total Travelers</div>
                    <div class="info-value">${group.totalTravelers} People</div>
                  </div>
                  ${group.roomingPreference ? `
                  <div class="info-item">
                    <div class="info-label">Rooming Preference</div>
                    <div class="info-value">${group.roomingPreference.charAt(0).toUpperCase() + group.roomingPreference.slice(1)}</div>
                  </div>
                  ` : ''}
                  ${group.coordinator ? `
                  <div class="info-item full-width">
                    <div class="info-label">Group Coordinator</div>
                    <div class="info-value">${group.coordinator.fullName} • ${group.coordinator.phone} • ${group.coordinator.email}</div>
                  </div>
                  ` : ''}
                </div>
              </div>
            </div>
            ` : ''}

            ${specialRequests ? `
            <!-- Special Requests -->
            <div class="section">
              <h2>📝 Special Requests</h2>
              <div class="info-item full-width">
                <div class="info-value" style="white-space: pre-wrap;">${specialRequests}</div>
              </div>
            </div>
            ` : ''}

            <!-- Quick Actions -->
            <div class="section">
              <h2>⚡ Quick Actions</h2>
              <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <a href="mailto:${contact.email}?subject=Re: Hotel Inquiry ${inquiryId}" style="background: #A83442; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: 600;">Reply via Email</a>
                <a href="tel:${contact.phone}" style="background: #28a745; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: 600;">Call Guest</a>
                <a href="https://wa.me/${contact.phone.replace(/[^\d]/g, '')}?text=Hi%20${encodeURIComponent(contact.fullName)}%2C%20regarding%20your%20hotel%20inquiry%20${inquiryId}" style="background: #25D366; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: 600;">WhatsApp</a>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>This inquiry was submitted via Rawhah Booking Mobile App</p>
            <p>Submitted on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Plain text version
    const text = `
NEW HOTEL INQUIRY - ${inquiryId}

GUEST INFORMATION:
Name: ${contact.fullName}
Email: ${contact.email}
Phone: ${contact.phone}

TRAVEL DETAILS:
Destination: ${destination.city}${destination.country ? `, ${destination.country}` : ''}
Check-in: ${dates.checkIn}
Check-out: ${dates.checkOut}
Duration: ${nights} night${nights !== 1 ? 's' : ''}

ACCOMMODATION:
Guests: ${guests.adults} Adult${guests.adults !== 1 ? 's' : ''}${guests.children > 0 ? `, ${guests.children} Child${guests.children !== 1 ? 'ren' : ''}` : ''}
${guests.children > 0 && guests.childAges ? `Child Ages: ${guests.childAges.join(', ')}` : ''}
Rooms: ${rooms}
${budget?.min || budget?.max ? `Budget: ${budget.min ? `$${budget.min}` : ''}${budget.min && budget.max ? ' - ' : ''}${budget.max ? `$${budget.max}` : ''} per night` : ''}

${groupBooking && group ? `
GROUP BOOKING:
${group.groupName ? `Group Name: ${group.groupName}` : ''}
Total Travelers: ${group.totalTravelers}
${group.roomingPreference ? `Rooming: ${group.roomingPreference}` : ''}
${group.coordinator ? `Coordinator: ${group.coordinator.fullName} (${group.coordinator.phone})` : ''}
` : ''}

${specialRequests ? `SPECIAL REQUESTS:\n${specialRequests}` : ''}

Submitted via Rawhah Booking Mobile App on ${new Date().toLocaleString()}
    `.trim();

    return { html, text };
  }

  // Send hotel inquiry notification email
  async sendHotelInquiryNotification(data: HotelInquiryFormData, inquiryId: string): Promise<ResendEmailResponse> {
    try {
      const fromEmail = process.env.INQUIRY_EMAIL_FROM || 'noreply@rawhahbooking.com';
      const toEmail = process.env.INQUIRY_EMAIL_TO || 'inquiries@rawhahbooking.com';

      const { html, text } = this.formatHotelInquiryEmail(data, inquiryId);

      const payload: ResendEmailPayload = {
        from: fromEmail,
        to: [toEmail],
        subject: `🏨 New Hotel Inquiry - ${data.destination.city} | ${inquiryId}`,
        html,
        text,
      };

      console.log('Sending hotel inquiry email notification...');

      const response = await fetch(`${this.baseURL}/emails`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Hotel inquiry email sent successfully:', result.id);
      
      return result;
    } catch (error) {
      console.error('Error sending hotel inquiry email:', error);
      throw error;
    }
  }

  // Send confirmation email to guest
  async sendGuestConfirmation(data: HotelInquiryFormData, inquiryId: string): Promise<ResendEmailResponse> {
    try {
      const fromEmail = process.env.INQUIRY_EMAIL_FROM || 'noreply@rawhahbooking.com';
      const { destination, dates, contact } = data;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Hotel Inquiry Confirmation</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8f9fa; }
            .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { background: #A83442; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; text-align: center; }
            .icon { font-size: 48px; margin-bottom: 20px; }
            h1 { color: #A83442; margin: 0 0 20px; }
            .highlight { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="icon">✅</div>
              <h1 style="color: white; margin: 0;">Inquiry Received!</h1>
            </div>
            
            <div class="content">
              <p>Dear <strong>${contact.fullName}</strong>,</p>
              
              <p>Thank you for your hotel inquiry! We've received your request and our team will review it shortly.</p>
              
              <div class="highlight">
                <h3 style="margin-top: 0;">Your Inquiry Details:</h3>
                <p><strong>Reference ID:</strong> ${inquiryId}</p>
                <p><strong>Destination:</strong> ${destination.city}${destination.country ? `, ${destination.country}` : ''}</p>
                <p><strong>Dates:</strong> ${dates.checkIn} to ${dates.checkOut}</p>
              </div>
              
              <p><strong>What happens next?</strong></p>
              <p>Our hotel specialists will review your requirements and respond within <strong>10-15 minutes</strong> during business hours with personalized recommendations.</p>
              
              <p>If you have any urgent questions, feel free to contact us directly.</p>
            </div>

            <div class="footer">
              <p><strong>Rawhah Booking</strong></p>
              <p>Professional hotel accommodations with exceptional service</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const text = `
Dear ${contact.fullName},

Thank you for your hotel inquiry! We've received your request for ${destination.city}${destination.country ? `, ${destination.country}` : ''} from ${dates.checkIn} to ${dates.checkOut}.

Reference ID: ${inquiryId}

Our hotel specialists will review your requirements and respond within 10-15 minutes during business hours with personalized recommendations.

If you have any urgent questions, feel free to contact us directly.

Best regards,
Rawhah Booking Team
      `.trim();

      const payload: ResendEmailPayload = {
        from: fromEmail,
        to: [contact.email],
        subject: `Hotel Inquiry Confirmation - ${inquiryId}`,
        html,
        text,
      };

      console.log('Sending guest confirmation email...');

      const response = await fetch(`${this.baseURL}/emails`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Guest confirmation email sent successfully:', result.id);
      
      return result;
    } catch (error) {
      console.error('Error sending guest confirmation email:', error);
      throw error;
    }
  }
}

// Create singleton instance
const resendApiKey = process.env.RESEND_API_KEY;
export const emailService = resendApiKey ? new EmailService(resendApiKey) : null;

export default emailService; 