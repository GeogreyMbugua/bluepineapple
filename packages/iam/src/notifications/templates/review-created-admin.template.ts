export function renderAdminReviewCreatedEmail(review: {
  guestName: string;
  rating: number;
  comment: string;
  experienceName?: string | null;
}): string {
  const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Review Submitted</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f4f7f6;color:#333;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg, #0070ba 0%, #005a9e 100%);padding:40px 30px;text-align:center;">
              <h1 style="margin:0;font-size:28px;font-weight:600;color:#ffffff;letter-spacing:0.5px;">Blue Pineapple</h1>
              <p style="margin:8px 0 0;font-size:16px;color:rgba(255,255,255,0.9);">New Review Alert</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 30px;">
              <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#444;">A new guest review has been submitted on the coastal experiences platform.</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;">Guest</p>
                    <p style="margin:0;font-size:16px;font-weight:500;color:#1e293b;">${review.guestName}</p>
                  </td>
                </tr>
                ${review.experienceName ? `
                <tr>
                  <td style="padding:16px 24px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;">Experience</p>
                    <p style="margin:0;font-size:16px;font-weight:500;color:#1e293b;">${review.experienceName}</p>
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding:16px 24px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;">Rating</p>
                    <p style="margin:0;font-size:20px;color:#f59e0b;letter-spacing:2px;">${stars}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 24px;">
                    <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;">Review</p>
                    <p style="margin:0;font-size:15px;line-height:1.6;color:#334155;">${review.comment}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;font-size:14px;color:#64748b;">Log in to the admin dashboard to manage this review.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
