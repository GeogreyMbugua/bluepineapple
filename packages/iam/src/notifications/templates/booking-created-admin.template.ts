export function renderAdminBookingCreatedEmail(booking: {
  bookingReference: string;
  totalGuests: number;
  totalAmount: string;
  source?: string;
  pricingMode?: string;
  adults?: number;
  children?: number;
  infants?: number;
  discountRate?: number;
  discountAmount?: number;
  origin?: string;
  destination?: string;
  guest?: { firstName?: string; lastName?: string } | null;
  partnerId?: string;
  departure?: {
    departureDateTime?: Date;
    experience?: { name?: string } | null;
    vessel?: { name?: string } | null;
    route?: { name?: string } | null;
    totalCapacity?: number;
    availableCapacity?: number;
    onlineCapacity?: number;
    onlineBookedSeats?: number;
  } | null;
}): string {
  const guestName = `${booking.guest?.firstName ?? ''} ${booking.guest?.lastName ?? ''}`.trim() || 'N/A';

  const departureDate = booking.departure?.departureDateTime
    ? new Date(booking.departure.departureDateTime).toLocaleDateString('en-KE', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Nairobi'
      })
    : 'TBD';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Booking Created — ${booking.bookingReference}</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f4f7f6;color:#333;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg, #0070ba 0%, #005a9e 100%);padding:40px 30px;text-align:center;">
              <h1 style="margin:0;font-size:28px;font-weight:600;color:#ffffff;letter-spacing:0.5px;">Blue Pineapple</h1>
              <p style="margin:8px 0 0;font-size:16px;color:rgba(255,255,255,0.9);">New Booking Alert</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 30px;">
              <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#444;">A new booking has been created and requires your attention.</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;">Booking Reference</p>
                    <p style="margin:0;font-size:20px;font-weight:600;color:#0070ba;">${booking.bookingReference}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 24px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;">Guest</p>
                    <p style="margin:0;font-size:16px;font-weight:500;color:#1e293b;">${guestName}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 24px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;">Journey</p>
                    <p style="margin:0;font-size:15px;color:#334155;">${booking.origin ?? 'N/A'} → ${booking.destination ?? 'N/A'}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 24px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;">Source / Fare mode</p>
                    <p style="margin:0;font-size:15px;color:#334155;">${booking.source ?? 'N/A'} / ${booking.pricingMode ?? 'N/A'}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 24px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;">Partner ID</p>
                    <p style="margin:0;font-size:15px;color:#334155;">${booking.partnerId ?? 'N/A'}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 24px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;">Experience</p>
                    <p style="margin:0;font-size:16px;font-weight:500;color:#1e293b;">${booking.departure?.experience?.name ?? 'Water Taxi Trip'}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 24px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;">Departure</p>
                    <p style="margin:0;font-size:15px;color:#334155;">${departureDate}</p>
                  </td>
                </tr>
                ${booking.departure?.vessel?.name ? `
                <tr>
                  <td style="padding:16px 24px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;">Vessel</p>
                    <p style="margin:0;font-size:15px;color:#334155;">${booking.departure.vessel.name}</p>
                  </td>
                </tr>` : ''}
                <tr>
                  <td style="padding:16px 24px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;">Capacity</p>
                    <p style="margin:0;font-size:15px;font-weight:600;color:#b45309;">Online: ${Math.max(0, (booking.departure?.onlineCapacity ?? 0) - (booking.departure?.onlineBookedSeats ?? 0))}/${booking.departure?.onlineCapacity ?? 'N/A'} remaining; vessel: ${booking.departure?.availableCapacity ?? 'N/A'}/${booking.departure?.totalCapacity ?? 'N/A'} remaining.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 24px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;">Guests</p>
                    <p style="margin:0;font-size:15px;color:#334155;">${booking.totalGuests}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 24px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;">Passenger composition</p>
                    <p style="margin:0;font-size:15px;color:#334155;">${booking.adults ?? 'N/A'} adult(s), ${booking.children ?? 0} child(ren), ${booking.infants ?? 0} under 5</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 24px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;">Discount</p>
                    <p style="margin:0;font-size:15px;color:#334155;">${booking.discountRate ? `${Math.round(booking.discountRate * 100)}% (KES ${Number(booking.discountAmount ?? 0).toLocaleString()})` : 'None'}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 24px;">
                    <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;">Total Amount</p>
                    <p style="margin:0;font-size:18px;font-weight:600;color:#0f172a;">KES ${Number(booking.totalAmount).toLocaleString()}</p>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
                <tr>
                  <td align="center">
                    <p style="margin:0 0 16px;font-size:14px;color:#64748b;line-height:1.6;">
                      Please review the booking in the admin panel.<br>
                      Reference: <strong style="color:#0070ba;">${booking.bookingReference}</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 30px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;font-size:13px;color:#94a3b8;">Blue Pineapple Holdings &copy; ${new Date().getFullYear()}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
